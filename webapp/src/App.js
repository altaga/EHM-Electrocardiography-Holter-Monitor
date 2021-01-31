/*App.js*/
import React, { Component } from "react";
import Index from "./pages/index"
import ECG from "./pages/ecg/App"
import history from './pages/history/history';

import {
  Router,
  Route,
  Switch
} from "react-router-dom";

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
      return ( 
      <>
      <Router history={history}>
      <Switch>
        <Route exact path="/" component={Index} />
        <Route exact path="/ecg/:handle" component={(props) => <ECG {...props} />} />
        <Route path="*" component={Index} />
      </Switch>
      </Router>
      </>
    );
  }
}

export default App;