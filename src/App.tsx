import React from 'react';
import './App.css';
// TODO: import '@tensorflow/tfjs-node'; -- This never worked due to aws-sdk https://github.com/webpack/webpack/issues/8400
import {HomePage} from './components/HomePage'
import {LandingPage} from './components/LandingPage'
import Background from './pics/background.png';
import BlackBackground from './pics/black_background.png';


function App() {
  return (
    <div className="App" style={{height:"100%", padding: "0px",backgroundSize: 'fixed', backgroundImage: `url(${Background})`}} >

        <LandingPage/>
        {/* <HomePage /> */}
    </div>
  );
}

export default App;
