import React from 'react';
import './App.css';
// TODO: import '@tensorflow/tfjs-node'; -- This never worked due to aws-sdk https://github.com/webpack/webpack/issues/8400
import {HomePage} from './components/HomePage'


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <HomePage />
      </header>
    </div>
  );
}

export default App;
