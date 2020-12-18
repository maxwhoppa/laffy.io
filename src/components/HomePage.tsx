// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {WebcamComponentMemo} from './WebcamComponent'
import {VideoAnalyzerState} from './VideoAnalyzer'


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
    interval : any

    
    constructor(props: HomePageProps){
        super(props)
        this.handleWebcamChange = this.handleWebcamChange.bind(this);
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

    componentDidUpdate(prevProps: HomePageProps) {

    }

    componentWillUnmount() {
    }

    nextButtonClick(gameState : number){
        this.setState({
            gameState: gameState
        })
    }

    handleWebcamChange(VideoAnalyzerState: VideoAnalyzerState){
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
        });

    }
    
    render(){
        return (
            // <div>
            //     {(this.state.gameState === -1) ?this.Home(this.props) : <WebcamComponent/>} 
            // </div>
            <div className="container-fluid" style={{height:"100%", padding: "0px"}}>
            <div className="w-100 h-100 row"style={{marginLeft:"-10px"}}>
              <div className="w-100 h-100 col-sm-4">
              {(this.state.gameState === -1) ?this.Home() : <WebcamComponentMemo
              handleWebcamChange={this.handleWebcamChange}
              />
              } 
              </div>
              <div className="col-6 h-100">
                <div className="mb-2 h-100">
                  <h1 className="Display text-center">Win Streak</h1>
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
                        <button type="button" className="btn btn-secondary w-100 " onClick={() => this.nextButtonClick(0)}>Next</button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )
    }

    Home(){
        return (
        <div className="h-100 media-body">
            <video autoPlay={true} style={{backgroundColor:"black"}} className="h-50 w-100 border rounded">
            </video>   
            <video autoPlay={true} style={{backgroundColor:"black"}} className="h-50 w-100 border rounded">
            </video>
        </div>
        )
    }
}