# EHM: Electrocardiography Holter Monitor

 An ECG/EKG Holter monitor with heart rate analysis and dashboard. AWS based and powered by Microchip.

 <img src="https://i.ibb.co/h7krzxt/logo.png" width="800">

 Always use technology to improve the world, if you are a black hat or gray hat hacker please abstain at this point ......... or at least leave your star to make me feel less guilty XP.

# **Table of contents**

- [EHM: Electrocardiography Holter Monitor](#ehm-electrocardiography-holter-monitor)
- [**Table of contents**](#table-of-contents)
- [**Introduction**](#introduction)
- [**Problem**](#problem)
- [**Solution**](#solution)
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
- [**Epic DEMO**](#epic-demo)
  - [Closing](#closing)
- [**References**](#references)

# **Introduction**

Pendiente

# **Problem**

Our heart beats 115200 times a day, it is such a fine machinery that does not stop during our lives, however, not many people have the advantage to have this machinery in good condition, many factors of daily life can permanently affect cardiac function.

Factors such as:

- Sedentary.
- Do not eat a balanced diet.
- Drink alcoholic drinks along with energy drinks.
- A long ETC ...

Too many people must undergo cardiac tests frequently in expensive hospitals with gigantic measuring devices.

<img src="https://i.ibb.co/PZZ5YC7/Sneaky-Whopping-Caimanlizard-size-restricted.gif" width="600">

That's why I decided through AVR-IoT WA develope an ECG/EKG Holter monitor which is able to see and analyze the EKG of the patients in real time.

# **Solution**



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

Para poder realizar el primer setup de nuestro dispositivo recomiendo que sigas la guia oficial de Microchip ya que es un proceso muy sencillo de realizar en el caso de AWS.

Vas a necesitar el siguiente archivo para hacer correctamente la configuracion de AWS.

https://www.microchip.com/design-centers/internet-of-things/iot-dev-kits/iot-provision-tool

Guia Microchip:

https://github.com/microchip-pic-avr-solutions/microchip-iot-developer-guides-for-aws/tree/master/connect-the-board-to-your-aws-account

En este caso deberas de ver los datos de la board llegando a AWS IoT de la siguiente forma 1 cada segundo:

<img src="https://i.ibb.co/DWxsWHN/image.png" width="100%">

En mi caso estoy obteniendo los datos de un ECG, anota el numero que aparece como topic, ya que este numero nos servira mas adelante para visualizar los datos de nuestra pagina web.

NOTA: Haciendo un copy/paste en un bloc de notas podras ver el topic completo, AWS por estetica lo corta cuando lo visualizas.

<img src="https://i.ibb.co/jbbFC2k/image.png" width="100%">

## **Code Highlights**

Para poder programar correctamente el microcontrolador tenemos que saber que el microcontrolador es:

https://www.microchip.com/wwwproducts/en/ATmega4808

Para poder obtener correctamente una lectura de ECG y mandarla a AWS sin perder datos, debemos tener en consideracion ciertas cosas:

- La frecuencia minima de muestreo segun la AHA para un ECG es de 150Hz [1].
  - Para solucionar esto hicimos que la velocidad de muestreo fuera de 150 HZ a travez de programar una interrupcion por Timer, haciendo que el microcontrolador haga esta tarea 150 veces por segundo.

        ISR(TCA0_OVF_vect) {
            free_running();
            TCA0.SINGLE.INTFLAGS = TCA_SINGLE_OVF_bm;
        }
        ...
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
  
- El microcontrolador va a mandar aproximadamente un dato cada segundo.
  - Esto se realizo al alterar la velocidad con la que se realiza la rutina en el codigo principal.

        #define MAIN_DATATASK_INTERVAL 1000L

- La obtencion de datos del ecg no se puede detener mientras se mandan los datos a la nube.
  - Se hizo que el ADC funcionara por free_running para evitar interrupciones de lectura cuando se mandan los datos a nube.

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

Para mas detalles este codigo esta en la siguiente carpeta:
https://github.com/altaga/EHM-Electrocardiography-Holter-Monitor/blob/main/MPLAB%20Project/AVRIoT.X/mcc_generated_files/application_manager.c

<img src="https://i.ibb.co/fQXzyL8/New-Project-8.png" width="100%">

[1](https://www.ahajournals.org/doi/pdf/10.1161/hc5001.101063#:~:text=The%20American%20Heart%20Association%20(AHA,the%20limitations%20of%20previous%20studies.)

## **Dry Electrodes**

Ddebido a que este es un device que vamos a estar utilizando un largo perdiodo de tiempo y ademas es un dispositivo que debe de ser usado todos los dias, podemos entender que el uso de electrodos desechables es poco viable. Asi que por eso decidimos realiza nuestros propios electrodos secos.

Materials:
- Copper Plate.
- Silver Conductive Ink.
- Electrode External Snap.

<img src="https://i.ibb.co/hLZ8DTB/20210130-204013.png" width="100%">

## **Electrode arrangement**

Para poder realizar la lectura del ECG y que ademas el dispositivo sea los menos incomodo posible, tomamos en consideracion el arreglo de Electrodos de el AppleWatch 

<img src="https://i.ibb.co/kcy5XYN/image.png" width="500">

Nosotros colocamos dos electrodos en la mano derecha y uno en la mano izquierda de la siguiente forma.

Right:

<img src="https://i.ibb.co/26LFnGX/20210130-205858.jpg" width="600">

Left:

<img src="https://i.ibb.co/tD4spc2/20210130-205832.jpg" width="600">

Ground:

<img src="https://i.ibb.co/fYL5W2X/20210130-205900.jpg" width="600">

Con esta dispocicion de electrodos podemos obtener una señal de ECG que si no es perfecta, podremos arreglrla con un poco de procesamiento en la pagina web.

## **WebPage Setup**

Para configurar correctamente la pagina web crea en la siguiente ruta Webapp\src\pages\ecg un archivo llamado aws-configuration.js y coloca las credenciales de AWSIoT y el Identity Pool de Cognito.

    var awsConfiguration = {
      poolId: "us-east-1:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // 'YourCognitoIdentityPoolId'
      host:"xxxxxxxxxxxxxxxxxx.iot.us-east-1.amazonaws.com", // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
      region: "us-east-1" // 'YourAwsRegion', e.g. 'us-east-1'
    };
    module.exports = awsConfiguration;

<img src="https://i.ibb.co/w0fbqRY/image.png" width="100%">

## **WebPage**

La pagina web se realizo utilizando el framework de ReactJS.

https://reactjs.org/

Para la funcionalidad de la pagina web se utilizaron dos SDK de AWS para Javascript.

- Para el control de acceso de la pagina web a consumir los recursos de AWSIoT
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html
- Para poder realizar la lectura del topic de AWS IoT
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Iot.html

Para el analisis del ECG se utilizo una funcion Lambda con la cual accedemos mediante API y tiene configurada como funcion con la libreria [Heartpy](https://pypi.org/project/heartpy/).

Para el estilo y frontend de la plataforma se usaron los paquetes:

- ReactStrap: https://reactstrap.github.io/
- ChartJS : https://www.chartjs.org/

Y para el deploy de la plataforma se utilizo como fuente un repositorio de Github y AWS Amplify.

<img src="https://i.ibb.co/Dk8HBL4/image.png" width="100%">

La pagina desplegada tiene 2 paths importantes.

- El Index, el cual es la carta de presentacion de nuestra aplicacion

<img src="https://i.ibb.co/26H6kfJ/image.png" width="100%">

- El monitor ECG, sin embargo este tiene algo importante, segun el sensor que querramos visualizar, lo tendremos que especificar en el path segun el numero que hayamos recibido en AWS IoT.

<img src="https://i.ibb.co/TcSBcMy/image.png" width="100%">

- La pagina web tiene algunos funciones especiales:
  - Filtrado de señal en tiempo real
    - Señal sin filtrar:
  <img src="https://i.ibb.co/dG5xrqh/image.png" width="100%">
    - Señal filtrada:
  <img src="https://i.ibb.co/w7DqPyh/image.png" width="100%">

La funcion de Analyze EKG, manda los datos sin filtrar recibidos en la pagina web y los manda a nuestra funcion Lambda para ser analizados por la libreria HeartPy y devuelve datos valiosos para los medicos.

La funcion de SavePDF salva los datos en pantalla para registro.

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

<img src="https://i.ibb.co/TcSBcMy/image.png" height="340">
<img src="https://i.ibb.co/jbcRLP8/Screenshot-20210130-193858-Edge.jpg" height="340" />

# **Epic DEMO**

Video: Click on the image
[![EKG](https://i.ibb.co/h7krzxt/logo.png)](PENDING)

Sorry github does not allow embed videos.

## Closing

PENDING

# **References**

Links:

(1) https://www.ahajournals.org/doi/pdf/10.1161/hc5001.101063#:~:text=The%20American%20Heart%20Association%20(AHA,the%20limitations%20of%20previous%20studies.

(2) 

(3) 

(4) 