// This component is the main component for Random video chatting

import React, {Component} from 'react';
import {VideoAnalyzer, VideoAnalyzerState} from '../components/VideoAnalyzer'


import {loadModels} from '../api/face';
import {socketStuff} from '../api/sockets';
import { configure } from '@testing-library/react';


type WebcamComponentState = {
  localStream: HTMLVideoElement | null
}

export type WebcamComponentProps = {
  handleWebcamChange: any
  configureVideo: any
}

export class WebcamComponent extends Component<WebcamComponentProps, WebcamComponentState> {
  video: HTMLVideoElement | null = null
  peerVideo: HTMLVideoElement | null = null


  constructor(props: WebcamComponentProps){
    super(props)

    this.state = {
      localStream: null,
    }
    
    console.log('loading models in constructor')
    loadModels();
    this.startVideo()
  }

  componentDidMount(){
  }
  
  componentDidUpdate(prevProps: WebcamComponentProps) {
    console.log("rerendered webcamcomponent")
    // socketStuff(this.video?.srcObject, this.peerVideo)
  }

  componentWillUnmount() {
  }

 
  startVideo(){
    console.log('startVideo')
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then( async stream => {
      if (this.video) {
        this.video.srcObject = stream;       
      }
      this.setState({localStream: this.video})
      this.props.configureVideo(this.video, this.peerVideo)
      this.props.handleWebcamChange({
        cameraActive: true,
        faceDetectionActive: false,
        userSmiled: false,
        numFaces: 0,
      })
    })
    .catch(() => console.log('user did not allow for video'))
  }

  render(){
    return (
    <div className="h-100 media-body">
      <video ref={ref => { this.video = ref; }} muted autoPlay={true}  className="h-50 w-100 border rounded"style={
        {transform: 'scaleX(-1)',
        backgroundColor:'black'                }}/>
      <video ref={ref => { this.peerVideo = ref; }} autoPlay={true} className="h-50 w-100 border rounded" style={{transform: 'scaleX(-1)',backgroundColor:'black'  }} />
      <VideoAnalyzer localStream={this.state.localStream} handleWebcamChange={this.props.handleWebcamChange}/>
    </div>
    )}
}


export const WebcamComponentMemo = React.memo(WebcamComponent)
