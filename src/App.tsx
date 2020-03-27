import React from 'react';
import logo from './logo.svg';
import './App.css';
// TODO: import '@tensorflow/tfjs-node'; -- This never worked due to aws-sdk https://github.com/webpack/webpack/issues/8400
import {HomePage} from './components/HomePage'


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Welcome to Laffy.io
        </p>
        <img src={logo} className="App-logo" alt="logo" />
        <HomePage />
      </header>
    </div>
  );
}

export default App;
