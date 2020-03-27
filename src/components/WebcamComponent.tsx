// This component is the main component for Random video chatting

import React, {Component} from 'react';
import {VideoAnalyzer} from '../components/VideoAnalyzer'

import {loadModels} from '../api/face';
import {socketStuff} from '../api/sockets';


type WebcamComponentState = {
  localStream: HTMLVideoElement | null
  userSmiled: boolean
  ready: boolean
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
      ready: false
    }
    
    console.log('loading models in constructor')
    loadModels();
    this.startVideo()
  }

  handleFaceDetectionChange(faceDetectionActive: boolean){
    this.setState({ready:faceDetectionActive});
  }

  componentDidMount(){
  }
  
  componentDidUpdate(prevState: any) {
    console.log("rerendered webcamcomponent")
    if (this.state.ready && !prevState.ready)
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



  render(){
    return (
    <div>
            <button onClick={() => this.setState({ready:true})}>Start</button>
      <video ref={ref => { this.video = ref; }} muted autoPlay={true}            
       style={{
                position: "absolute",
                width: "100%",
                left: 0,
                top: 0,
                opacity: !this.state.ready?0:.75,
                transition: "opacity, 2s ease-in-out"
              }}/>
      <video ref={ref => { this.peerVideo = ref; }} autoPlay={true} />
      <VideoAnalyzer faceDetectionActive={this.state.ready} localStream={this.state.localStream} handleFaceDetectionChange={this.handleFaceDetectionChange}/>
    </div>
    )}
}

