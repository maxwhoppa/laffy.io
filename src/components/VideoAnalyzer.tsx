// This component analyzes the video passed in thru the props

import React, {Component} from 'react';
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import { RandomChat } from './RandomChat';

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
    handleFaceDetectionChange: any
    faceDetectionActive: boolean
  }

type VideoAnalyzerState = {
    userSmiled: boolean
    numFaces: number
}

export class VideoAnalyzer extends Component<VideoAnalyzerProps,VideoAnalyzerState> {
    interval : any

    
    constructor(props:VideoAnalyzerProps){
        super(props)
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            userSmiled: false,
            numFaces: 0,
        }
    }

    handleChange(active: boolean){
      this.props.handleFaceDetectionChange(active)
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


          if (!this.props.faceDetectionActive){
            this.handleChange(true);
          }
      
          if (detections.length !== this.state.numFaces){
            this.setState({numFaces: detections.length})
          }


          detections.forEach(e => {
            if (e.expressions.happy >= .6){
              if (!this.state.userSmiled)
                this.setState({userSmiled: true})
          }
          else {
            if (this.state.userSmiled )
              this.setState({userSmiled: false})
          }
        })
      }
    }

    Smiled(props: any) {
      if (props.numFaces === 0)
      return <h1>Please show your face</h1>
      if (props.userSmiled === true)
      return (<h1>YOU SMILED! :D</h1>)
      else 
      return <h1>You didnt smile :( </h1>
    }

    render(){
        return (
            <div>
                <this.Smiled userSmiled={this.state.userSmiled} numFaces={this.state.numFaces}/>
                <RandomChat userSmiled={this.state.userSmiled} numFaces={this.state.numFaces}/>
            </div>
        )
    }


}