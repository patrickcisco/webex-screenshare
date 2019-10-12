import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Meeting from './pages/Meeting';
import Home from './pages/Home';
import ActiveMeeting from './pages/ActiveMeeting';
import './App.css';


function App(props) {
  
  return (
    <Router>
            <Switch>
            <Route path="/meeting/:id" children={<Meeting />} />
            <Route path="/activemeeting/:id/:name" children={<ActiveMeeting />} />
            <Route path="/" children={<Home/>} />
            </Switch>
    </Router>
  );
}

export default App;
