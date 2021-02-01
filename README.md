# EHM: Electrocardiography Holter Monitor

 An ECG/EKG Holter monitor with heart rate analysis and dashboard. AWS based and powered by Microchip.

 <img src="https://i.ibb.co/h7krzxt/logo.png" width="800">

 Always use technology to improve the world, if you are a black hat or gray hat hacker please abstain at this point ......... or at least leave your star to make me feel less guilty XP.

# **Table of contents**

- [EHM: Electrocardiography Holter Monitor](#ehm-electrocardiography-holter-monitor)
- [**Table of contents**](#table-of-contents)
- [**Introduction**](#introduction)
- [**Problem**](#problem)
- [**Second Problem**](#second-problem)
- [**Materials**](#materials)
- [**Connection Diagram**](#connection-diagram)
- [**Project:**](#project)
  - [**AVR-IoT WA Setup**](#avr-iot-wa-setup)
  - [**Code Highlights**](#code-highlights)
  - [**Dry Electrodes**](#dry-electrodes)
  - [**Electrode arrangement**](#electrode-arrangement)
  - [**WebPage Setup**](#webpage-setup)
  - [**WebPage**](#webpage)
- [**Final Product**](#final-product)
- [**Non Stop DEMO**](#non-stop-demo)
- [**Epic DEMO**](#epic-demo)
  - [Closing](#closing)
- [**References**](#references)

# **Introduction**

Our heart beats 115200 times a day, it is such a fine machine that does not stop during our lives. However, not many people have the advantage to have this machine in good conditions. Many factors of daily life can permanently affect cardiac function.

Factors such as:

* Sedentarism.
* Diet full of Salt, saturated fats and refined sugar.
* Alcoholic intake.
* Smoking
* High blood pressure
* Obesity
* Family history of heart disease
* History of a previous heart attack
* Age over 45 for men, or over 55 for women
* Male gender (there's a direct correlation for cardiovascular disease)
* Substance abuse
* Low potassium or magnesium

This brings us to our pain point:

Quite a lot of people have to undergo cardiac tests frequently in expensive hospitals with gigantic measuring devices. We are in a time where open health is stronger than ever and it is time to make the patient the point of care.

The market for electrocardiography is quite enormous, as it has become the standard for patients with heart risks.

<img src="https://hackster.imgix.net/uploads/attachments/1253038/image_6HoGEtNXFh.png?auto=compress%2Cformat&w=740&h=555&fit=max" width="600">

What we can see in this graphic is that most of the electrocardiographs are those big machines (as a Biomedical Engineer I can attest that most, are quite old). In addition to this most in the "holter" category are not really wearables but smaller ones that can be carried despite that a wearable one that can be used at home could provide invaluable information about the patient's heart.

One thing that we have to notice first. The first of wearables has already come out in the market and the results are not that great. The main issue that Doctors put forth is that it is too much information, think of the internet before data aggregators, it has no value if it cannot be interpreted correctly and that is something that has to be taken into consideration. A solution should aggregate all that data and provide carers with useful information.

Because of these reasons through AzureSphere's technology we will create a real-time heart rate, EKG monitoring system and a dashboard deployment, that will be out of the box secure, from the MCU, to the OS, to the cloud. Healthcare data is our most valuable one, and it is evident that this kind of security must become the norm in every device.

# **Problem**

Our heart beats 115200 times a day, it is such a fine machinery that does not stop during our lives, however, not many people have the advantage to have this machinery in good condition, many factors of daily life can permanently affect cardiac function.

Factors such as:

- Sedentary.
- Do not eat a balanced diet.
- Drink alcoholic drinks along with energy drinks.
- A long ETC ...

Too many people must undergo cardiac tests frequently in expensive hospitals with gigantic measuring devices.

<img src="https://i.ibb.co/PZZ5YC7/Sneaky-Whopping-Caimanlizard-size-restricted.gif" width="600">

# **Second Problem**

This brings us to the second problem that is quite basic, most ECG machines whether they are Holters or Rest ECGs use gel-based electrodes. These are completely unusable in an athletic environment i.e. Athletes trying to measure themselves during activity. For these reasons we will try while developing the IoT device, to develop at the same time Dry electrodes.

That's why we decided through AVR-IoT WA develope an ECG/EKG Holter monitor which is able to see and analyze the EKG of the patients in real time.

# **Materials**

Hardware:
- AVR-IoT WA (ATmega4808, WiFi, AWS).                                x1.
https://www.microchip.com/Developmenttools/ProductDetails/EV15R70A
- AD8232 ECG.
https://smile.amazon.com/dp/B07PKFRHTK/ref=cm_sw_em_r_mt_dp_nBh4FbR18SS8Z
- 16 AWG Wire.
https://smile.amazon.com/dp/B07CMYVF3J/ref=cm_sw_em_r_mt_dp_xFh4FbATJCP7P?_encoding=UTF8&psc=1
- Conductive INK. x1.
https://smile.amazon.com/dp/B00OZATJ3A/ref=cm_sw_em_r_mt_dp_tIh4FbS2D8BEM
- Copper tube. x1.
https://smile.amazon.com/dp/B07T94WSSH/ref=cm_sw_em_r_mt_dp_tKh4FbFZZX6YV?_encoding=UTF8&psc=1
- Li-ion Battery x1.
https://smile.amazon.com/dp/B01NAX9XYG/ref=cm_sw_em_r_mt_dp_LMh4FbTQB20VK

Software:
- MPLAB X IDE v5.45
https://www.microchip.com/en-us/development-tools-tools-and-software/mplab-x-ide
- AWS:
https://aws.amazon.com/

Cloud Services:

- AWS IoT
https://aws.amazon.com/iot/
- AWS Amplify
https://aws.amazon.com/amplify/
- AWS Lambda
https://aws.amazon.com/lambda/
- AWS API Gateway
https://aws.amazon.com/api-gateway/

Python Libraries:

- Heartpy
https://pypi.org/project/heartpy/

# **Connection Diagram**

This is the connection diagram of the system:

<img src="https://i.ibb.co/VmbKdkZ/New-Project-7.png" width="100%">

Circuit:

<img src="https://i.ibb.co/Hr7MsQh/Untitled-Sketch-bb.png" width="100%">

# **Project:**

## **AVR-IoT WA Setup**

In order to do the first setup of our device, I recommend that you follow the official Microchip guide since it is a very simple process to perform in the case of AWS.

You will need the following file to correctly configure AWS.
https://www.microchip.com/design-centers/internet-of-things/iot-dev-kits/iot-provision-tool

Microchip guide:

https://github.com/microchip-pic-avr-solutions/microchip-iot-developer-guides-for-aws/tree/master/connect-the-board-to-your-aws-account

In this case you should see the data from the board arriving at AWS IoT as follows 1 every second:

<img src="https://i.ibb.co/DWxsWHN/image.png" width="100%">

In this case I am obtaining the data from an ECG, write down the number that appears as a topic, since this number will serve us later to view the data on our website.

NOTE: By making a copy / paste in a notepad you can see the entire topic, AWS for aesthetics cuts it when you view it.

<img src="https://i.ibb.co/jbbFC2k/image.png" width="100%">

## **Code Highlights**

In order to program the microcontroller correctly we have to know that the microcontroller is:

https://www.microchip.com/wwwproducts/en/ATmega4808

In order to correctly obtain an ECG reading and send it to AWS without losing data, we must take into consideration certain things:

- The minimum sampling rate according to the AHA for an ECG is 150Hz [1].
  - To solve this we made the sampling rate 150 Hz by programming an interrupt by Timer, making the microcontroller do this task 150 times per second.
   
        // Interrupt Routine
        ISR(TCA0_OVF_vect) {
            free_running();
            TCA0.SINGLE.INTFLAGS = TCA_SINGLE_OVF_bm;
        }
        ...
        // Enable Interrupt 
        // application_init(void) inside here
        TCA0_init();
        sei(); // Enable global interrupts by setting global interrupt enable bit in SREG

        ...
        // Setup timer Interrupt function
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

<img src="https://i.ibb.co/1vpX2x1/image.png" width="100%">
  
- The microcontroller will send approximately one data every second.
  - This was done by altering the speed with which the routine is performed in the main code.

        #define MAIN_DATATASK_INTERVAL 1000L

<img src="https://i.ibb.co/fQXzyL8/New-Project-8.png" width="100%">

- Ecg data collection cannot be stopped while data is being sent to the cloud.
   - The ADC was made to work with free_running to avoid read interruptions when sending data to the cloud.
   
  
          // ADC Freeruning read function
          void free_running() {
              while (1) {
                  if (ADC0_IsConversionDone()) {
                      if (adc_counter < sizeof array / sizeof array[0]) {
                          array[adc_counter] = ADC0.RES;
                          adc_counter++;
                      }
                      break;
                  }
              }
          }

          // Start ADC in Free runing Mode 
          // application_init(void) inside here
          ADC0.CTRLA |= 1 << ADC_FREERUN_bp;
          ADC0_StartConversion(ADC_CHANNEL);

<img src="https://i.ibb.co/YkT00RT/New-Project-9.png" width="100%">

For more details you can find the code in the following folder:
https://github.com/altaga/EHM-Electrocardiography-Holter-Monitor/blob/main/MPLAB%20Project/AVRIoT.X/mcc_generated_files/application_manager.c

In turn, on the side of the device we put an NFC stamp to access the platform quickly from the smartphone.

<img src="https://i.ibb.co/5FGvSzL/20210131-013512-1.png" width="60%">

[1](https://www.ahajournals.org/doi/pdf/10.1161/hc5001.101063#:~:text=The%20American%20Heart%20Association%20(AHA,the%20limitations%20of%20previous%20studies.)

## **Dry Electrodes**

This is perhaps the gre3atest development done in the project!

Due to the fact that this is a device that we are going to be using for long periods of time and it is also a device that must be used every day, we soon understood that the use of disposable electrodes is not feasible. So that's why we decided to make our own dry electrodes.

Materials:
- Copper Plate.
- Silver Conductive Ink.
- Electrode External Snap.

<img src="https://i.ibb.co/hLZ8DTB/20210130-204013.png" width="100%">

## **Electrode arrangement**

In order to read the ECG and also make the device as comfortable as possible, we take into consideration the arrangement of Electrodes of the AppleWatch

<img src="https://i.ibb.co/kcy5XYN/image.png" width="500">

First we place two electrodes on the right hand and one on the left hand as follows.

Right:

<img src="https://i.ibb.co/26LFnGX/20210130-205858.jpg" width="600">

Left:

<img src="https://i.ibb.co/tD4spc2/20210130-205832.jpg" width="600">

Ground:

<img src="https://i.ibb.co/fYL5W2X/20210130-205900.jpg" width="600">

With this arrangement of electrodes we can obtain an ECG signal that while not perfect, we can fix with a little processing on the web page.

## **WebPage Setup**

To correctly configure the web page, create a file called aws-configuration.js in the following path Webapp \ src \ pages \ ecg and enter the AWSIoT credentials and the Cognito Identity Pool.

    var awsConfiguration = {
      poolId: "us-east-1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 'YourCognitoIdentityPoolId'
      host:"xxxxxxxxxxxxxxxxxx.iot.us-east-1.amazonaws.com", // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
      region: "us-east-1" // 'YourAwsRegion', e.g. 'us-east-1'
    };
    module.exports = awsConfiguration;

<img src="https://i.ibb.co/w0fbqRY/image.png" width="100%">

## **WebPage**

The web page was made using the ReactJS framework.

https://reactjs.org/

For the functionality of the website, two AWS SDKs for Javascript were used.

- For the access control of the web page to consume the AWSIoT resources
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html
- To be able to read the AWS IoT topic
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html

For the analysis of the ECG, a Lambda function was used with which we access via API and has been configured as a function with the [Heartpy] library (https://pypi.org/project/heartpy/).

For the style and frontend of the platform, the packages were used:

- ReactStrap: https://reactstrap.github.io/
- ChartJS: https://www.chartjs.org/

And for the platform deployment, a Github and AWS Amplify repository was used as a source.
<img src="https://i.ibb.co/Dk8HBL4/image.png" width="100%">

The displayed web page has 2 important paths.

- The Index, which is the presentation letter of our application

<img src = "https://i.ibb.co/26H6kfJ/image.png" width = "100%">

- The ECG monitor, however this has something important. Depending on the sensor we want to visualize, we will have to specify it on the path according to the number we have received in AWS IoT.

<img src = "https://i.ibb.co/TcSBcMy/image.png" width = "100%">

- The website has some special functions:
   - Real-time signal filtering
     - Unfiltered signal:
   <img src = "https://i.ibb.co/dG5xrqh/image.png" width = "100%">
     - Filtered signal:
   <img src = "https://i.ibb.co/w7DqPyh/image.png" width = "100%">

The Analyze EKG function sends the unfiltered data received on the web page and sends it to our Lambda function to be analyzed by the HeartPy library and returns valuable data for physicians.

The SavePDF function saves the data on screen for record.

Video: Click on the image
[![EKG](https://i.ibb.co/h7krzxt/logo.png)](https://youtu.be/zGBveqvmWrU)

Sorry github does not allow embed videos.

# **Final Product**

Hotler Monitor with Case:

<img src="https://i.ibb.co/XZB0Mfm/20210130-230501.jpg" width="49%" /><img src="https://i.ibb.co/rdBZv2t/20210130-230630.jpg" width="49%" />

ECG lead wires and device:

<img src="https://i.ibb.co/Y3nQK3k/20210130-170836.jpg" width="100%" />

ECG lead wires with Shirt:

<img src="https://i.ibb.co/RgT9ZXx/20201006-183412.jpg" width="100%" />

Platform:

<img src="https://i.ibb.co/TcSBcMy/image.png" height="320"><img src="https://i.ibb.co/jbcRLP8/Screenshot-20210130-193858-Edge.jpg" height="320" />

# **Non Stop DEMO**

Video: Click on the image
[![EKG](https://i.ibb.co/h7krzxt/logo.png)](https://youtu.be/eb57H7PDsuY)

Sorry github does not allow embed videos.

# **Epic DEMO**

Video: Click on the image
[![EKG](https://i.ibb.co/h7krzxt/logo.png)](https://youtu.be/dF6aVnAowOc)

Sorry github does not allow embed videos.

## Closing

We think we have achieved a great medical device prototype with this project. It does everything an IoT-capable device should do and probably we have solved some of the problems in relation with gel-based electrodes. And that is perhaps the main innovation with this device. It has huge market potential mainly with sports science applications. For our next steps in relation with this project we will focus on testing it in both sports and clinical applications and also on the market of sport-related or exercise related classes and services, which also show great potential.

# **References**

Links:

(1) https://www.ahajournals.org/doi/pdf/10.1161/hc5001.101063#:~:text=The%20American%20Heart%20Association%20(AHA,the%20limitations%20of%20previous%20studies.

(2)https://medicalfuturist.com/ten-ways-technology-changing-healthcare/?utm_source=The%20Medical%20Futurist%20Newsletter&utm_campaign=ee5854702c-EMAIL_CAMPAIGN_2019_10_29_diabetes_companies_COPY_&utm_medium=email&utm_term=0_efd6a3cd08-ee5854702c-420575081
