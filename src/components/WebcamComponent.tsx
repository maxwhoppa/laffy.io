import React, {Component} from 'react';
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import {loadModels} from '../api/face';


// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
const { Canvas, Image, ImageData } = canvas
// @ts-ignore: fix for face-api.js
faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
})

type WebcamState = { playing: any, intervalId: NodeJS.Timeout | null};

export class WebcamComponent extends Component<React.HTMLAttributes<HTMLVideoElement>, WebcamState> {
  video: HTMLVideoElement | null = null
  interval : any

  constructor(props: any){
    super(props);
    this.state = {
      playing: false,
      intervalId: null
    }
  }
  
  componentDidUpdate(){
    this.handleVideo(this.video)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  async componentDidMount() {

    this.interval = setInterval(() => this.setState({ }), 200);
    await loadModels();
    this.startVideo()
 }
 
  startVideo(){
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then( async stream => {
      if (this.video) {
        this.video.srcObject = stream;            
      }
    })
    .catch(err => document.write(err))

    this.setState({playing: true})
  }

  async handleVideo(video: HTMLVideoElement | null) {
      if (video){
       const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceExpressions()

        console.log(detections);
    
        if (detections.length === 0){
            console.log("WE NEED A FACE")
        }
        if (detections.length > 0 && detections[0].expressions.happy > .5 ){
            console.log("Person 1 SMILED")
        }
        if (detections.length > 1 && detections[1].expressions.happy > .5 ){
            console.log("Person 2 SMILED")
        }
    }
  }

  render(){
    return (
    <div>
      <video ref={ref => { this.video = ref; }} muted autoPlay={true} />
    </div>
    )}
}