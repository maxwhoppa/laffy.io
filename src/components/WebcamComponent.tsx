import React, {Component} from 'react';
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import {loadModels} from '../api/face';
import socketIOClient from "socket.io-client";
const socket = socketIOClient('http://localhost:8080/')
let Peer = require('simple-peer')

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

let client = {
  peer: new Peer(),
  gotAnswer:false 
}

type WebcamComponentState = {
  localStream: MediaStream | null
}

export class WebcamComponent extends Component<React.HTMLAttributes<HTMLVideoElement>, WebcamComponentState> {
  video: HTMLVideoElement | null = null
  peerVideo: HTMLVideoElement | null = null
  interval : any

  constructor(props: React.HTMLAttributes<HTMLVideoElement>){
    super(props)
    this.state = {
      localStream: null
    }
    console.log('loading models in constructor')
    loadModels();
  }
  
  componentDidUpdate(prevProps: React.HTMLAttributes<HTMLVideoElement>) {
    this.detectSmiles(this.video)
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }


  async componentDidMount() {
    this.interval = setInterval(() => this.setState({ }), 200);
    this.startVideo()
 }
 
  startVideo(){
    console.log('startVideo')
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then( async stream => {
      if (this.video) {
        this.video.srcObject = stream;       
        // TODO: Remove socketStuff from here so it loads faster
        this.socketStuff(stream, this.peerVideo)
      }
      this.setState({localStream: stream})
    })
    .catch(err => this.startVideo())

  }

  socketStuff(stream : any , peerVideo: any) {
    console.log('socket stuff')
    socket.emit('NewClient')

        function InitPeer(type: any ){
            let peer = new Peer({initiator:(type === 'init')? true: false, stream: stream, trickle: false})
            peer.on('stream', function (stream : any){
              peerVideo.srcObject = stream
            })
            peer.on('close', function(){
                // document.getElementById('peerVideo').remove();
                peer.destroy()
            })
            return peer
        }

        // Peer that will send the offer (peer of type init)
        function MakePeer(){
            // when sending offer we must wait for offer from other user
            client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function(data: any){
                if (!client.gotAnswer){
                    socket.emit('Offer', data)
                }
            })
            client.peer = peer
        }
        
        //when we get an offer from another client (peer of type notinit)
        function FrontAnswer(offer:any){
            let peer = InitPeer("notInit")
            peer.on('signal', (data :any) => {
                socket.emit('Answer', data)
            })
            peer.signal(offer)
        }

        function SignalAnswer(answer : any){
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }

        function SessionActive(){
            document.write('Session Active. Please try again later')
        }

        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
    }


  async detectSmiles(video: HTMLVideoElement | null) {
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
      <video ref={ref => { this.peerVideo = ref; }} autoPlay={true} />
    </div>
    )}
}