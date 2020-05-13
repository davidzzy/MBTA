import React, { Component }  from 'react';
import './App.css';
import Time from './Components/Time';
import Data from './Components/Data';
import YMCA from './Image/tenor.gif';

export class App extends Component{
  
  
  render() {
      return (
        <div className="App">
          <h1>Welcome to the M B T A</h1>
          <picture>
        <img src={YMCA} />
      </picture>
          <Time/>
          <h2> North Station </h2>
          <Data selectedStation={'place-north'}/>
          <h2> South Station </h2>
          <Data selectedStation={'place-sstat'}/>
        </div>
      );
  }
}

export default App;
