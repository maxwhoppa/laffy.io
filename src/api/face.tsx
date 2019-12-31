// Load models and weights
import * as faceapi from 'face-api.js';

export async function loadModels() {
  faceapi.nets.tinyFaceDetector.loadFromUri('/models')
  faceapi.nets.faceLandmark68Net.loadFromUri('/models')
  faceapi.nets.faceRecognitionNet.loadFromUri('/models')
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
}

  