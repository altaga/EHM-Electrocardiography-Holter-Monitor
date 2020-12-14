/*
\file   application_manager.c

\brief  Application Manager source file.

(c) 2018 Microchip Technology Inc. and its subsidiaries.

Subject to your compliance with these terms, you may use Microchip software and any
derivatives exclusively with Microchip products. It is your responsibility to comply with third party
license terms applicable to your use of third party software (including open source software) that
may accompany Microchip software.

THIS SOFTWARE IS SUPPLIED BY MICROCHIP "AS IS". NO WARRANTIES, WHETHER
EXPRESS, IMPLIED OR STATUTORY, APPLY TO THIS SOFTWARE, INCLUDING ANY
IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS
FOR A PARTICULAR PURPOSE.

IN NO EVENT WILL MICROCHIP BE LIABLE FOR ANY INDIRECT, SPECIAL, PUNITIVE,
INCIDENTAL OR CONSEQUENTIAL LOSS, DAMAGE, COST OR EXPENSE OF ANY KIND
WHATSOEVER RELATED TO THE SOFTWARE, HOWEVER CAUSED, EVEN IF MICROCHIP
HAS BEEN ADVISED OF THE POSSIBILITY OR THE DAMAGES ARE FORESEEABLE. TO
THE FULLEST EXTENT ALLOWED BY LAW, MICROCHIP'S TOTAL LIABILITY ON ALL
CLAIMS IN ANY WAY RELATED TO THIS SOFTWARE WILL NOT EXCEED THE AMOUNT
OF FEES, IF ANY, THAT YOU HAVE PAID DIRECTLY TO MICROCHIP FOR THIS
SOFTWARE.
 */

#include <string.h>
#include <time.h>
#include <stdio.h>
#include "utils/atomic.h"
#include <avr/wdt.h>
#include<avr/interrupt.h>
#include<avr/io.h>
#include "include/pin_manager.h"
#include "application_manager.h"
#include "mcc.h"
#include "config/IoT_Sensor_Node_config.h"
#include "config/conf_winc.h"
#include "config/mqtt_config.h"
#include "config/cloud_config.h"
#include "cloud/cloud_service.h"
#include "cloud/mqtt_service.h"
#include "cloud/crypto_client/crypto_client.h"
#include "cloud/wifi_service.h"
#include "CryptoAuth_init.h"
#include "../mcc_generated_files/sensors_handling.h"
#include "credentials_storage/credentials_storage.h"
#include "led.h"
#include "debug_print.h"
#include "time_service.h"
#if CFG_ENABLE_CLI
#include "cli/cli.h"
#endif


#define MAIN_DATATASK_INTERVAL 1000L
// The debounce time is currently close to 2 Seconds.
#define AWS_MCHP_SANDBOX_URL "a1gqt8sttiign3.iot.us-east-2.amazonaws.com"

// This will contain the device ID, before we have it this dummy value is the init value which is non-0
char attDeviceID[20] = "BAAAAADD1DBAAADD1D";
char mqttSubscribeTopic[SUBSCRIBE_TOPIC_SIZE];
ATCA_STATUS retValCryptoClientSerialNumber;
static uint8_t holdCount = 0;
#define TOGGLE_ON  1
#define TOGGLE_OFF 0

uint32_t MAIN_dataTask(void *payload);
timerStruct_t MAIN_dataTasksTimer = {MAIN_dataTask};
int adc_result = 0;
#define ADC_CHANNEL 7

static void wifiConnectionStateChanged(uint8_t status);
static void sendToCloud(void);
static void subscribeToCloud(void);
static void receivedFromCloud(uint8_t *topic, uint8_t *payload);
uint32_t initDeviceShadow(void *payload);
timerStruct_t initDeviceShadowTimer = {initDeviceShadow};

void loadDefaultAWSEndpoint(void);

#define PERIOD_EXAMPLE_VALUE    (83) // 150 HZ min sample rate AHA https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjs1K-4iM3tAhUQXKwKHcglAncQFjABegQIBBAC&url=https%3A%2F%2Fwww.ahajournals.org%2Fdoi%2Fpdf%2F10.1161%2Fhc5001.101063%23%3A~%3Atext%3DThe%2520American%2520Heart%2520Association%2520(AHA%2Cthe%2520limitations%2520of%2520previous%2520studies.&usg=AOvVaw38JqixTbKeuD7eR6_EVrIB

void TCA0_init(void);

int counter = 0;

void free_running() {
    while (1) {
        if (ADC0_IsConversionDone()) {
            adc_result = ADC0.RES;
            break;
        }
    }
}

ISR(TCA0_OVF_vect) {
    free_running();
    counter++;
    TCA0.SINGLE.INTFLAGS = TCA_SINGLE_OVF_bm;
}
// This will get called every 1 second only while we have a valid Cloud connection

static void sendToCloud(void) {
    static char json[PAYLOAD_SIZE];
    static char publishMqttTopic[PUBLISH_TOPIC_SIZE];
    int rawTemperature = 0;
    //int light = 0;
    int len = 0;
    int temp = 0;
    memset((void*) publishMqttTopic, 0, sizeof (publishMqttTopic));
    sprintf(publishMqttTopic, "%s/sensors", cid);
    // This part runs every CFG_SEND_INTERVAL seconds
    if (shared_networking_params.haveAPConnection) {
        len = sprintf(json, "{\"ADC\":%d,\"Counter\":%d}", adc_result, counter);
        counter = 0;
    }
    if (len > 0) {
        CLOUD_publishData((uint8_t*) publishMqttTopic, (uint8_t*) json, len);
        if (holdCount) {
            holdCount--;
        } else {
            ledParameterYellow.onTime = LED_BLIP;
            ledParameterYellow.offTime = LED_BLIP;
            LED_control(&ledParameterYellow);
        }
    }
}

//This handles messages published from the MQTT server when subscribed

static void receivedFromCloud(uint8_t *topic, uint8_t *payload) {
    char *toggleToken = "\"toggle\":";
    char *subString;
    sprintf(mqttSubscribeTopic, "$aws/things/%s/shadow/update/delta", cid);
    if (strncmp((void*) mqttSubscribeTopic, (void*) topic, strlen(mqttSubscribeTopic)) == 0) {
        if ((subString = strstr((char*) payload, toggleToken))) {
            if (subString[strlen(toggleToken)] == '1') {

                ledParameterYellow.onTime = SOLID_ON;
                ledParameterYellow.offTime = SOLID_OFF;
                LED_control(&ledParameterYellow);
            } else {

                ledParameterYellow.onTime = SOLID_OFF;
                ledParameterYellow.offTime = SOLID_ON;
                LED_control(&ledParameterYellow);
            }
            holdCount = 2;
        }
    }
    debug_printIoTAppMsg("topic: %s", topic);
    debug_printIoTAppMsg("payload: %s", payload);
}

void application_init(void) {
    uint8_t mode = WIFI_DEFAULT;
    // Initialization of modules before interrupts are enabled
    SYSTEM_Initialize();
    LED_test();
#if CFG_ENABLE_CLI     
    CLI_init();
    CLI_setdeviceId(attDeviceID);
#endif   
    debug_init(attDeviceID);

    // Initialization of modules where the init needs interrupts to be enabled
    if (!CryptoAuth_Initialize()) {
        debug_printError("APP: CryptoAuthInit failed");
        shared_networking_params.haveError = 1;
    }
    // Get serial number from the ECC608 chip 
    retValCryptoClientSerialNumber = CRYPTO_CLIENT_printSerialNumber(attDeviceID);
    if (retValCryptoClientSerialNumber != ATCA_SUCCESS) {
        shared_networking_params.haveError = 1;
        switch (retValCryptoClientSerialNumber) {
            case ATCA_GEN_FAIL:
                debug_printError("APP: DeviceID generation failed, unspecified error");
                break;
            case ATCA_BAD_PARAM:
                debug_printError("APP: DeviceID generation failed, bad argument");
            default:
                debug_printError("APP: DeviceID generation failed");
                break;
        }

    }
#if CFG_ENABLE_CLI   
    CLI_setdeviceId(attDeviceID);
#endif   
    debug_setPrefix(attDeviceID);
    loadDefaultAWSEndpoint();
    wifi_readThingNameFromWinc();
    wifi_init(wifiConnectionStateChanged, mode);
    if (mode == WIFI_DEFAULT) {
        CLOUD_setupTask(attDeviceID);
        timeout_create(&MAIN_dataTasksTimer, MAIN_DATATASK_INTERVAL);
    }
    LED_test();
    subscribeToCloud();
    ADC0.CTRLA |= 1 << ADC_FREERUN_bp;
    ADC0_StartConversion(ADC_CHANNEL);
    TCA0_init();
    sei(); // Enable global interrupts by setting global interrupt enable bit in SREG
}

static void subscribeToCloud(void) {
    sprintf(mqttSubscribeTopic, "$aws/things/%s/shadow/update/delta", cid);
    CLOUD_registerSubscription((uint8_t*) mqttSubscribeTopic, receivedFromCloud);
}



#if USE_CUSTOM_ENDPOINT_URL

void loadCustomAWSEndpoint(void) {
    memset(awsEndpoint, '\0', AWS_ENDPOINT_LEN);
    sprintf(awsEndpoint, "%s", CFG_MQTT_HOSTURL);
    debug_printIoTAppMsg("Custom AWS Endpoint is used : %s", awsEndpoint);
}
#else

void loadDefaultAWSEndpoint(void) {
    memset(awsEndpoint, '\0', AWS_ENDPOINT_LEN);
    wifi_readAWSEndpointFromWinc();
    if (awsEndpoint[0] == 0xFF) {
        sprintf(awsEndpoint, "%s", AWS_MCHP_SANDBOX_URL);
        debug_printIoTAppMsg("Using the AWS Sandbox endpoint : %s", awsEndpoint);
    }
}
#endif

// This scheduler will check all tasks and timers that are due and service them

void runScheduler(void) {
    timeout_callNextCallback();
}

// This gets called by the scheduler approximately every 100ms

uint32_t MAIN_dataTask(void *payload) {
    if (CLOUD_checkIsConnected()) {
        sendToCloud();
    }
    else {
        ledParameterYellow.onTime = SOLID_OFF;
        ledParameterYellow.offTime = SOLID_ON;
        LED_control(&ledParameterYellow);
    }
    if (!shared_networking_params.amConnectingAP) {
        if (shared_networking_params.haveAPConnection) {
            ledParameterBlue.onTime = SOLID_ON;
            ledParameterBlue.offTime = SOLID_OFF;
            LED_control(&ledParameterBlue);
        }

        // Green LED if we are in Access Point
        if (!shared_networking_params.amConnectingSocket) {
            if (CLOUD_checkIsConnected()) {
                ledParameterGreen.onTime = SOLID_ON;
                ledParameterGreen.offTime = SOLID_OFF;
                LED_control(&ledParameterGreen);
            } else if (shared_networking_params.haveDataConnection == 1) {
                ledParameterGreen.onTime = LED_BLINK;
                ledParameterGreen.offTime = LED_BLINK;
                LED_control(&ledParameterGreen);
            }
        }
    }

    // RED LED
    if (shared_networking_params.haveError) {
        ledParameterRed.onTime = SOLID_ON;
        ledParameterRed.offTime = SOLID_OFF;
        LED_control(&ledParameterRed);
    } else {
        ledParameterRed.onTime = SOLID_OFF;
        ledParameterRed.offTime = SOLID_ON;
        LED_control(&ledParameterRed);
    }

    // This is milliseconds managed by the RTC and the scheduler, this return 
    // makes the timer run another time, returning 0 will make it stop
    return MAIN_DATATASK_INTERVAL;
}

void application_post_provisioning(void) {
    CLOUD_setupTask(attDeviceID);
    timeout_create(&MAIN_dataTasksTimer, MAIN_DATATASK_INTERVAL);
}

// React to the WIFI state change here. Status of 1 means connected, Status of 0 means disconnected

static void wifiConnectionStateChanged(uint8_t status) {
    // If we have no AP access we want to retry
    if (status != 1) {
        CLOUD_reset();
    }
}

void TCA0_init(void) {
    /* enable overflow interrupt */
    TCA0.SINGLE.INTCTRL = TCA_SINGLE_OVF_bm;

    /* set Normal mode */
    TCA0.SINGLE.CTRLB = TCA_SINGLE_WGMODE_NORMAL_gc;

    /* disable event counting */
    TCA0.SINGLE.EVCTRL &= ~(TCA_SINGLE_CNTEI_bm);

    /* set the period */
    TCA0.SINGLE.PER = PERIOD_EXAMPLE_VALUE;

    TCA0.SINGLE.CTRLA = TCA_SINGLE_CLKSEL_DIV1024_gc /* set clock source (sys_clk/1024) */
            | TCA_SINGLE_ENABLE_bm; /* start timer */
}



