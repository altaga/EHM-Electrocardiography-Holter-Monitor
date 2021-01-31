import React from 'react';
import logo from './logo.svg';
import './App.css';
import { isMobile } from "react-device-detect";

function App() {
  if (isMobile) {
    return (
      <div className="App">
        <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet"></link>
        <header className="App-header">
          <img style={{ height: "70vw" }} src={logo} className="App-logo" alt="logo" />
          <div style={{ fontSize: "3.5rem", color: "#d7172f", fontFamily: "amiri" }}>
            EHM
            </div>
          <div style={{ fontSize: "3.5rem", color: "#104685", fontFamily: "amiri" }}>
            Electrocardiography Holter Monitor
            </div>
        </header>
      </div>
    );
  }
  else {
    return (
      <div className="App">
        <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet"></link>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div style={{ fontSize: "3.5rem", color: "#d7172f", fontFamily: "amiri" }}>
            EHM
            </div>
          <div style={{ fontSize: "3.5rem", color: "#104685", fontFamily: "amiri" }}>
            Electrocardiography Holter Monitor
            </div>
        </header>
      </div>
    );
  }
}

export default App;
