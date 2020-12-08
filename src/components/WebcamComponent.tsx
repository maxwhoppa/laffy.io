// This component is the main component for Random video chatting

import React, {Component} from 'react';
import {VideoAnalyzer} from '../components/VideoAnalyzer'
import { Lobby } from '../components/Lobby';


import {loadModels} from '../api/face';
import {socketStuff} from '../api/sockets';


type WebcamComponentState = {
  localStream: HTMLVideoElement | null
  userSmiled: boolean
  faceDetectionActive: boolean
}

export class WebcamComponent extends Component<React.HTMLAttributes<HTMLVideoElement>, WebcamComponentState> {
  video: HTMLVideoElement | null = null
  peerVideo: HTMLVideoElement | null = null


  constructor(props: React.HTMLAttributes<HTMLVideoElement>){
    super(props)

    this.handleFaceDetectionChange = this.handleFaceDetectionChange.bind(this);
    this.state = {
      localStream: null,
      userSmiled: false,
      faceDetectionActive: false
    }
    
    console.log('loading models in constructor')
    loadModels();
    this.startVideo()
  }

  handleFaceDetectionChange(faceDetectionActive: boolean){
      this.setState({faceDetectionActive:faceDetectionActive});
  }

  componentDidMount(){
  }
  
  componentDidUpdate(prevState: any) {
    console.log("rerendered webcamcomponent")
    if (this.state.faceDetectionActive && !prevState.faceDetectionActive)
      socketStuff(this.video?.srcObject, this.peerVideo)
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
    })
    .catch(() => console.log('user did not allow for video'))

  }


//TODO, Pass data to this component from Video Analyzer so that webComp can pass to -> randosComp & friendsComp 

  render(){
    return (
    <div className="h-100 media-body">
      <video ref={ref => { this.video = ref; }} muted autoPlay={true}  className="h-50 w-100 border rounded"style={
        {transform: 'scaleX(-1)',
        backgroundColor:'black'                }}/>
      <video ref={ref => { this.peerVideo = ref; }} autoPlay={true} className="h-50 w-100 border rounded" style={{transform: 'scaleX(-1)',backgroundColor:'black'  }} />
      <VideoAnalyzer faceDetectionActive={this.state.faceDetectionActive} localStream={this.state.localStream} handleFaceDetectionChange={this.handleFaceDetectionChange}/>
    </div>
    )}
}

