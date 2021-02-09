// This component analyzes the video passed in thru the props

import React, {Component} from 'react';
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';

// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement
// Can add Cancas, Image, below
const { ImageData } = canvas
faceapi.env.monkeyPatch({
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
})


type VideoAnalyzerProps = {
    localStream: HTMLVideoElement | null
    handleWebcamChange: any
  }

export type VideoAnalyzerState = {
  cameraActive: boolean,
  faceDetectionActive: boolean,
  numFaces: number,
  userSmiled: boolean,
}

 export class VideoAnalyzer extends Component<VideoAnalyzerProps> {
    interval : any

    
    constructor(props:VideoAnalyzerProps){
        super(props)
    }

    async componentDidMount() {
        this.interval = setInterval(() => this.setState({ }), 300);
     }

    componentDidUpdate(prevProps: VideoAnalyzerProps) {
        this.detectSmiles(this.props.localStream)
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async detectSmiles(video: HTMLVideoElement | null) {
      if (video){
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks().withFaceExpressions()

        //only hits this point when we have face-api working in browser

        var currentState : VideoAnalyzerState = {
          cameraActive: true,
          faceDetectionActive: true,
          numFaces: detections.length,
          userSmiled: false,
        }


        detections.forEach(e => {
          if (e.expressions.happy >= .95){
            currentState.userSmiled = true;
            console.log('smiled')
          }
        })

        this.props.handleWebcamChange(currentState)

      }// else {}
      //
      //may have to do some error handling -- if the video is stopped .... 
    }

  render(){
    return null
  }
}