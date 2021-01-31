import React from 'react';
import LineGraph from "./line.js"
// reactstrap components
import {
  Card, CardText, CardBody,
  CardTitle, CardSubtitle, Button, Row, Col
} from 'reactstrap';

import Switch from "react-switch";

import {
  isMobile
} from "react-device-detect";

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

var AWS = require('aws-sdk');
var AWSIoTData = require('aws-iot-device-sdk');
var AWSConfiguration = require('./aws-configuration.js');

AWS.config.region = AWSConfiguration.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({ IdentityPoolId: AWSConfiguration.poolId });
var cognitoIdentity = new AWS.CognitoIdentity();
AWS.config.credentials.get(function (err, data) {
  if (!err) {
    
    var params = { IdentityId: AWS.config.credentials.identityId };
    cognitoIdentity.getCredentialsForIdentity(params, function (err, data) {
      if (!err) { mqttClient.updateWebSocketCredentials(data.Credentials.AccessKeyId, data.Credentials.SecretKey, data.Credentials.SessionToken); }
      else {
        console.log('error retrieving credentials: ' );
        alert('error retrieving credentials: ' );
      }
    });
  }
  else { console.log('error retrieving identity:' ); }
});

var messageHistory = '';
var refresh = 0;
var clientId = 'mqtt-explorer-' + (Math.floor((Math.random() * 100000) + 1));

var mqttClient = AWSIoTData.device({
  region: AWS.config.region,
  host: AWSConfiguration.host,
  clientId: clientId,
  protocol: 'wss',
  maximumReconnectTimeMs: 1000,
  debug: true,
  accessKeyId: '',
  secretKey: '',
  sessionToken: ''
});

var Fili = require('fili');

//  Instance of a filter coefficient calculator
var iirCalculator = new Fili.CalcCascades();

// calculate filter coefficients
var iirFilterCoeffs = iirCalculator.lowpass({
  order: 1, // cascade 3 biquad filters (max: 12)
  characteristic: 'bessel',
  Fs: 64, // sampling frequency
  Fc: 10, // cutoff frequency / center frequency for bandpass, bandstop, peak
  BW: 3, // bandwidth only for bandstop and bandpass filters - optional
  gain: 0, // gain for peak, lowshelf and highshelf
  preGain: false // adds one constant multiplication for highpass and lowpass
  // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
});

// create a filter instance from the calculated coeffs
var iirFilter = new Fili.IirFilter(iirFilterCoeffs);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hr: "NA",
      steps: "NA",
      meters: "NA",
      mess: "None",
      x: window.innerWidth - 20,
      y: window.innerHeight - 20,
      avg: "NA",
      max: "NA",
      min: "NA",
      data: [],
      datamem: [],
      series: [],
      memory: [],
      checked: false,
      checked1: false,
      bpm: "+",
      ibi: "+",
      sdnn: "+",
      sdsd: "+",
      rmssd: "+",
      pnn20: "+",
      pnn50: "+",
      hr_mad: "+",
      sd1: "+",
      sd2: "+",
      s: "+",
      sd1sd2: "+",
      br: "+",
      advance: "none"
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleChange1 = this.handleChange1.bind(this);
  }

  handleChange(checked) {
    this.setState({ checked });
  }

  handleChange1(checked1) {
    this.setState({ checked1 });

    if (checked1) {
      this.setState({ advance: "inline" });
    }
    else {
      this.setState({ advance: "none" });
    }
  }

  checkEKG() {
    let _this = this
    let tempdata = ""
    for (var i = 0; i < this.state.memory.length; i++) {
      tempdata += parseInt(this.state.memory[i], 10) + ".0"
      if (i === this.state.memory.length) {

      }
      else {
        tempdata += ","
      }
    }
    tempdata = tempdata.substring(0, tempdata.length - 1);
    
    var unirest = require('unirest');
    unirest('POST', 'https://574cyfj51e.execute-api.us-east-1.amazonaws.com/EKG_from_array')
      .headers({
        'Content-Type': 'text/plain'
      })
      .send(tempdata)
      .end(function (res) {
        if (res.error) console.log(res.error);
        let array = res.raw_body.replace("[", "").replace("]", "").replace(' ', "").replace('"', "")
        for (let k = 0; k < 25; k++) {
          array = array.replace(' ', "").replace('"', "")
        }
        array = array.split(",")
        for (let k = 0; k < array.length; k++) {
          array[k] = parseFloat(array[k], 10)
        }
        for (let k = 0; k < array.length; k++) {
          if (array[k] >= 100) {
            array[k] = array[k].toFixed(0)
          }
          else if (array[k] >= 1) {
            array[k] = array[k].toFixed(2)
          }
          else if (array[k] < 1) {
            array[k] = array[k].toFixed(4)
          }
        }
        for (let k = 0; k < array.length; k++) {
          array[k] = " " + (array[k].toString()).substring(0, 5);
        }

        _this.setState(
          {
            bpm: Math.round(array[1]/1.5),
            ibi: array[3],
            sdnn: array[5],
            sdsd: array[7],
            rmssd: array[9],
            pnn20: array[11],
            pnn50: array[13],
            hr_mad: array[15],
            sd1: array[17],
            sd2: array[19],
            s: array[21],
            sd1sd2: array[23],
            br: Math.round(parseInt(parseFloat(array[25]) * 60).toString()/2)
          }
        )
      });


  }

  componentDidMount() {
    let _this = this
    let sub_topic1= this.props.match.params.handle + "/sensors"

    window.mqttClientConnectHandler = function () {
      console.clear();
      console.log("Connected")
      messageHistory = '';
      mqttClient.subscribe(sub_topic1);
    }

    window.mqttClientReconnectHandler = function () {
      console.log('reconnect : times : ' + refresh.toString());
    };

    window.mqttClientMessageHandler = function (topic, payload) {

      if(topic === sub_topic1){
        var string = new TextDecoder("utf-8").decode(payload);
        messageHistory = string.replace('{"Data":','').replace('}','')
        messageHistory = messageHistory.split(",")
        var indata = _this.state.datamem
        var inserie = _this.state.series
        var inmemory = _this.state.memory
  
        for (var j = 0; j < messageHistory.length; j++) {
          indata.push(messageHistory[j.toString()])
          inmemory.push(messageHistory[j.toString()])
          inserie.push(".")
          if (indata.length > 2000) {
            indata.shift()
          }
          if (indata.length > 1000) {
            inserie.shift()
          }
          if (inmemory.length > 10000) {
            inmemory.shift()
          }
        }
  
        if (_this.state.checked) {
          indata = iirFilter.multiStep(indata)
        }
        
        if(isMobile){
          _this.setState(
            {
              data: indata.slice(0, 1000),
              datamem: indata,
              series: inserie,
              memory: inmemory
            }
          )
        }
        else{
          _this.setState(
            {
              data: indata.slice(0, 1500),
              datamem: indata,
              series: inserie,
              memory: inmemory
            }
          )
        }
      }
      messageHistory = "";
    }

    window.updateSubscriptionTopic = function () {

    };

    window.clearHistory = function () {
      if (1 === true) {
        messageHistory = '';
      }
    };

    window.updatePublishTopic = function () { };

    window.updatePublishData = function () {

    };

    mqttClient.on('connect', window.mqttClientConnectHandler);
    mqttClient.on('reconnect', window.mqttClientReconnectHandler);
    mqttClient.on('message', window.mqttClientMessageHandler);
    mqttClient.on('close', function () {
      console.log('close');
    });
    mqttClient.on('offline', function () {
      console.log('offline');
    });
    mqttClient.on('error', function (error) {
      console.log('error', error);
    });

  }

  toPDF() {
    window.scrollTo(0, 0);
    let pdf;
    if(isMobile){
      pdf = new jsPDF('p', 'mm', 'a4', true); // A4 size page of PDF
      let data = document.getElementById('MyApp');
    let html2canvasOptions = {
      allowTaint: true,
      removeContainer: true,
      backgroundColor: null,
      imageTimeout: 15000,
      logging: true,
      scale: 2,
      useCORS: true
    };

    html2canvas(data, html2canvasOptions)
      .then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png')
        const imgWidth = 200;
        const pageHeight = 296;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
          heightLeft -= pageHeight;
        }
        //pdf.addPage();
        pdf.save('resume.pdf'); // Generated PDF
      });
    }
    else{
      pdf = new jsPDF('l', 'mm', 'a4', true); // A4 size page of PDF
      let data = document.getElementById('MyApp');
      let html2canvasOptions = {
      allowTaint: true,
      removeContainer: true,
      backgroundColor: null,
      imageTimeout: 15000,
      logging: true,
      scale: 2,
      useCORS: true
    };

    html2canvas(data, html2canvasOptions)
      .then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png')
        const imgWidth = 296;
        const pageHeight = 260;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
          heightLeft -= pageHeight;
        }
        //pdf.addPage();
        pdf.save('resume.pdf'); // Generated PDF
      });
    }
    
/*
    data = document.getElementById('MyApp1');
    html2canvas(data, html2canvasOptions)
      .then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png')
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
          heightLeft -= pageHeight;
        }

      });
      */
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
  }

  render() {
    if (isMobile) {
      return (
        <div className="App" style={{ paddingBottom: "0.1px", backgroundColor: "#FFF" }}>
          <Col style={{ paddingTop: "16px" }}>
            <Card id="MyApp" style={{ paddingTop: "0px" }}>
              <Row style={{ paddingLeft: "20px", width: window.innerWidth - 40, height: window.innerHeight - 400 }}>
                <LineGraph data={[this.state.data, this.state.series]} />
              </Row>
              <Row md="1">
                <Col style={{ paddingLeft: "32px", paddingRight: "32px" }}>
                  <Card>
                    <CardBody>
                      <CardTitle style={{ textAlign: "center", fontSize: "32px" }}>Analysis:</CardTitle>
                      <Row md="1">
                        <Col style={{ textAlign: "left", fontSize: "20px" }}>
                          <CardText>BPM: {this.state.bpm}</CardText>
                          <CardText>BreathsPM:{this.state.br}</CardText>
                          <div />
                          <div style={{ display: this.state.advance }}>Advance:</div>
                          <div />
                          <div />
                          <CardText style={{ display: this.state.advance }}>IBI:{this.state.ibi}</CardText>
                          <div />
                          <CardText style={{ display: this.state.advance }}>SDNN:{this.state.sdnn}</CardText>
                          <div />
                          <CardText style={{ display: this.state.advance }}>SDSD:{this.state.sdsd}</CardText>
                          <div />
                          <CardText style={{ display: this.state.advance }}>RMSSD:{this.state.rmssd}</CardText>
                          <div />
                          <CardText style={{ display: this.state.advance }}>PNN20:{this.state.pnn20}</CardText>
                          <div />
                          <CardText style={{ display: this.state.advance }}>PNN50:{this.state.pnn50}</CardText>
                          <div />
                          <CardText style={{ display: this.state.advance }}>HR_MAD:{this.state.hr_mad}</CardText> 
                          <div />
                          <CardText style={{ display: this.state.advance }}>SD1:{this.state.sd1}</CardText> 
                          <div />
                          <CardText style={{ display: this.state.advance }}>SD2:{this.state.sd2}</CardText> 
                          <div />
                          <CardText style={{ display: this.state.advance }}>S:{this.state.s}</CardText> 
                          <div />
                          <CardText style={{ display: this.state.advance }}>SD1SD2:{this.state.sd1sd2}</CardText> 
                          <div />
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Card>
            <Card>
              <Col style={{ paddingLeft: "32px", paddingRight: "32px" }}>
                <CardBody>
                  <CardTitle style={{ fontSize: "32px" }}>Filter :</CardTitle>
                  <Switch onChange={this.handleChange} checked={this.state.checked} />
                  <p />
                  <CardTitle style={{ fontSize: "32px" }}>Advance :</CardTitle>
                  <Switch onChange={this.handleChange1} checked={this.state.checked1} />
                  <p />
                  <Row md="2">
                    <Col>
                      <CardSubtitle style={{ fontSize: "32px" }}>Analyze EKG</CardSubtitle>
                      <Button style={{ fontSize: "32px" }} onClick={() => this.checkEKG()} >Analyze</Button>
                    </Col>
                    <p />

                    <Col>
                      <p />
                      <CardSubtitle style={{ fontSize: "32px" }}>Save PDF</CardSubtitle>
                      <Button style={{ fontSize: "32px" }} onClick={() => this.toPDF()}>Save</Button>
                    </Col>
                  </Row>
                </CardBody>
              </Col>
            </Card>
          </Col>
        </div>
      )
    }
    else {
      return (
        <div id="MyApp" className="App" style={{ backgroundColor: "#FFF" }}>
          <Col style={{ paddingTop: "16px" }}>
            <Card style={{ paddingTop: "0px", height: window.innerHeight - 36 }}>
              <Row style={{ paddingLeft: "20px", width: window.innerWidth - 40, height: window.innerHeight - 400 }}>
                <LineGraph data={[this.state.data, this.state.series]} />
              </Row>
              <Row md="2">
                <Col style={{ paddingLeft: "32px" }}>
                  <Card style={{ height: window.innerHeight * 0.46 }}>
                    <CardBody>
                    <Row md="2">
                      <Col>
                      <CardTitle style={{ fontSize: "32px" }}>Filter :</CardTitle>
                      <Switch onChange={this.handleChange} checked={this.state.checked} />
                      </Col>
                      <Col>
                      <CardTitle style={{ fontSize: "32px" }}>Advance :</CardTitle>
                      <Switch onChange={this.handleChange1} checked={this.state.checked1} />
                      </Col>
                      </Row>
                      <p />
                      <Row md="2">
                        <Col>
                          <CardSubtitle style={{ fontSize: "32px" }}>Analyze EKG</CardSubtitle>
                          <Button style={{ fontSize: "32px" }} onClick={() => this.checkEKG()}>Analyze</Button>
                        </Col>
                        <Col>
                          <CardSubtitle style={{ fontSize: "32px" }}>Save PDF</CardSubtitle>
                          <Button style={{ fontSize: "32px" }} onClick={() => this.toPDF()}>Save</Button>
                        </Col>
                      </Row>

                    </CardBody>
                  </Card>
                </Col>
                <Col style={{ paddingRight: "32px" }}>
                  <Card style={{ height: window.innerHeight * 0.46 }}>
                    <CardBody style={{ textAlign: "left", fontSize: "25px" }}>
                      <CardTitle >Analysis:</CardTitle>
                      <Row md="2">
                        <Col>
                          <CardText>BPM: {this.state.bpm}</CardText>
                        </Col>
                        <Col>
                          <CardText>BreathsPM:{this.state.br}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>IBI:{this.state.ibi}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>SDNN:{this.state.sdnn}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>SDSD:{this.state.sdsd}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>RMSSD:{this.state.rmssd}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>PNN20:{this.state.pnn20}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>PNN50:{this.state.pnn50}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>HR_MAD:{this.state.hr_mad}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>SD1:{this.state.sd1}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>SD2:{this.state.sd2}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>S:{this.state.s}</CardText>
                        </Col>
                        <Col>
                           <CardText style={{ display: this.state.advance }}>SD1SD2:{this.state.sd1sd2}</CardText>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </div>
      )
    }
  }
}

export default App;
