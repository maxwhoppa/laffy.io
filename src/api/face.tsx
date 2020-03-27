// Load models and weights

//TODO: fix this so that we can make this faster with native C++ library
import * as faceapi from 'face-api.js';

export async function loadModels() {
  faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  faceapi.nets.faceLandmark68Net.loadFromUri('/models')
  faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
}

  