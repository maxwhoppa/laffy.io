// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {WebcamComponentMemo} from './WebcamComponent'
import {VideoAnalyzerState} from './VideoAnalyzer'
import {socketStuff} from '../api/sockets';


type HomePageState = {
    // Gamestate:
    // -1 no camera, invalid position
    // 0 camera on, no connection
    // 1 camera on, connected with facial recognition -- game in session with another client
    // 2 camera on, connected with other client, no game in session
    gameState: number

    // CameraActive:
    // True if camera is on
    // False if camera is off
    cameraActive: boolean

    // FaceDetectionActive:
    // true if facial recognition model is active
    // false if not (can be due to no video)
    faceDetectionActive: boolean

    // UserSmiled:
    // true if a user is smiling
    // false if none are
    userSmiled: boolean

    // NumFaces:
    // number of people currently being analized by the model
    numFaces: number
  }

type HomePageProps = {}

export class HomePage extends Component<HomePageProps, HomePageState> {
    video: HTMLVideoElement | null = null
    peerVideo: HTMLVideoElement | null = null
    
    constructor(props: HomePageProps){
        super(props)
        this.handleWebcamChange = this.handleWebcamChange.bind(this);
        this.configureVideo = this.configureVideo.bind(this);
        this.state = {
            gameState: -1,
            cameraActive: false,
            faceDetectionActive: false,
            userSmiled: false,
            numFaces: 0
        }

        this.nextButtonClick = this.nextButtonClick.bind(this)
    }

    componentDidMount() {
    }

    componentDidUpdate(prevState: HomePageState) {
        // if (this.state.gameState === 1 && prevState.gameState !== 1)
        //     socketStuff(this.video?.srcObject, this.peerVideo)
    }

    componentWillUnmount() {
    }

    nextButtonClick(){
        if (this.state.gameState === 0 && this.state.faceDetectionActive){
            socketStuff(this.video?.srcObject, this.peerVideo)
        }
    }

    handleWebcamChange(VideoAnalyzerState: VideoAnalyzerState){
        var gameState = this.state.gameState;
        if (VideoAnalyzerState.faceDetectionActive){

            if (gameState === -1 && VideoAnalyzerState.numFaces !== 0){
                gameState = 0
            }
            else if (gameState === 0 && VideoAnalyzerState.numFaces === 0){
                gameState = -1
            }
            else if (gameState === 1){

            }
            else if (gameState === 2){

            }

            if (VideoAnalyzerState.userSmiled && !this.state.userSmiled)
            console.log('printed from homepage: YOU SMILeD BiTCh')

            if (VideoAnalyzerState.numFaces === 0 && this.state.numFaces !== 0)
                console.log('no faces detected')

            if (VideoAnalyzerState.numFaces !== 0 && this.state.numFaces === 0)
                console.log('face detected')

            this.setState({
                cameraActive: VideoAnalyzerState.cameraActive,
                faceDetectionActive: VideoAnalyzerState.faceDetectionActive,
                userSmiled: VideoAnalyzerState.userSmiled,
                numFaces: VideoAnalyzerState.numFaces,
                gameState: gameState
            });
        }
    }

    configureVideo(video: HTMLVideoElement, peerVideo: HTMLVideoElement){
        this.video = video;
        this.peerVideo = peerVideo;
    }
    
    render(){
        return (
            // <div>
            //     {(this.state.gameState === -1) ?this.Home(this.props) : <WebcamComponent/>} 
            // </div>
            <div className="container-fluid" style={{height:"100%", padding: "0px"}}>
            <div className="w-100 h-100 row"style={{marginLeft:"-10px"}}>
              <div className="w-100 h-100 col-sm-4">
             <WebcamComponentMemo
              handleWebcamChange={this.handleWebcamChange}
              configureVideo={this.configureVideo}
              />
              
              </div>
              <div className="col-6 h-100">
                <div className="mb-2 h-100">
                  <h1 className="Display text-center">Faces Detected</h1>
            <h3 className="Display text-center">{this.state.numFaces}</h3>
                  <div className="input-group mb-3 fixed-bottom" style={{position : "absolute", bottom: 0}}>
                    <div style={{marginBottom:"10px",backgroundColor:"whitesmoke", height:"40vh"}} className="border w-100">
                    </div>
                    <input type="text" className="form-control" placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>
                  </div>
                </div>
              </div>
              <div className="col" >
                <div className="mb-2 h-100" >
                  <img className="rounded mx-auto d-block" src="LAFFY_APP_MODEL.png" alt='laffy logo' style={{width: "100%",position:"absolute", top:0, paddingRight: "20px"}}/>
                    <div className="input-group mb-3" style={{position:"absolute", bottom:0, paddingRight: "20px"}}>
                        {this.Button()} 
                    </div>
                </div>
              </div>
            </div>
          </div>
        )
    }

    Button(){
        if (this.state.gameState === -1)
            return (
                    <button type="button" className="btn btn-secondary w-100 " disabled onClick={() => this.nextButtonClick()}>Next</button>
                )
        else 
            return (
                    <button type="button" className="btn btn-secondary w-100 " onClick={() => this.nextButtonClick()}>Next</button>
            )
    }
}