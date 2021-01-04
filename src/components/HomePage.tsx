// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {WebcamComponentMemo} from './WebcamComponent'
import {VideoAnalyzerState} from './VideoAnalyzer'
import {connectionUnderThreeSeconds,leaveRoom, socket, socketStuff} from '../api/sockets';
import { animateScroll } from "react-scroll";


export type HomePageState = {
    // Gamestate:
    // -1 no camera, invalid position
    // 0 camera on, no connection, facial recognition active
    // 0.1 looking for opponent 
    // 0.5 3 second countdown
    // 1 -- game in session with another client
    // 1.5 Are you sure -- next button hit once 
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

    chatInput: string

    winstreak: number
  }

type HomePageProps = {}

export class HomePage extends Component<HomePageProps, HomePageState> {
    video: HTMLVideoElement | null = null
    peerVideo: HTMLVideoElement | null = null
    
    constructor(props: HomePageProps){
        super(props)
        this.handleWebcamChange = this.handleWebcamChange.bind(this);
        this.configureVideo = this.configureVideo.bind(this);
        this.changeGameState = this.changeGameState.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);

        this.state = {
            gameState: -1,
            cameraActive: false,
            faceDetectionActive: false,
            userSmiled: false,
            numFaces: 0,
            chatInput: '',
            winstreak:0,
        }

        this.nextButtonClick = this.nextButtonClick.bind(this)
    }

    onKeyPress(event: any){
        if(event.keyCode === 27) {
            this.nextButtonClick();
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyPress, false);
        // window.addEventListener("beforeunload", ()=>{
        //     if (this.state.gameState> 1)
        //         leaveRoom({initiator:true});
        // });

        socket.on('win', () =>{
            this.setState({gameState:2,winstreak:this.state.winstreak+1})
        });

        socket.on('loss', ()=> {
            this.setState({gameState:2, winstreak:0});
        });

    }

    componentDidUpdate(prevState: HomePageState) {
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyPress, false);
        // window.removeEventListener("beforeunload", ()=>{
        //     if (this.state.gameState> 1)
        //         leaveRoom({initiator:true});
        // });
    }

    nextButtonClick(){
        if (this.state.gameState === 0 && this.state.faceDetectionActive){
            socketStuff(this.video?.srcObject, this.peerVideo)
            this.setState({gameState:1})
        }
        else if (this.state.gameState === .5){

        }
        else if (this.state.gameState === 1){
            this.setState({gameState:1.5})
        }
        else if (this.state.gameState === 1.5){
            var winstreak = 0;
            leaveRoom({initiator:true})
            this.setState({gameState:0, winstreak: winstreak})
            
        }
        else if (this.state.gameState === 2){
            leaveRoom({initiator:true})
            this.setState({gameState:0})
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
            else if (gameState === 1 || gameState === 1.5){
                if (VideoAnalyzerState.userSmiled){
                    socket.emit('loss')
                    console.log('user smiled, emitting loss')
                }
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

    changeGameState(gs: number){
        this.setState({gameState:gs})
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
                    <h1 className="Display text-center">Players Detected</h1>
                    <h3 className="Display text-center">{this.state.numFaces}</h3>
                    <h1 className="Display text-center">Winstreak: {this.state.winstreak}</h1>
                    <Chat gameState={this.state.gameState}/>
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
        var phrase = "";
        if (this.state.gameState === -1){
            if (this.state.faceDetectionActive === false){
                phrase = "Loading..."
            }
            else if (this.state.numFaces === 0){
                phrase = "No Faces Detected"
            }
            return (
            <button type="button" className="btn btn-secondary w-100 " disabled onClick={() => this.nextButtonClick()}>{phrase}</button>
            )
        }
        else if (this.state.gameState === 0 ){
            phrase = "Start (esc)"
            return (
                <button type="button" className="btn btn-success w-100 " onClick={() => this.nextButtonClick()}>{phrase}</button>
            )
        } 
        else if (this.state.gameState === 1){
            phrase = "Next (esc)"
            return (
                <button type="button" className="btn btn-danger w-100 " onClick={() => this.nextButtonClick()}>{phrase}</button>
            )
        }
        else if (this.state.gameState === 1.5){
            phrase = "Are You Sure? (esc)"
            return (
                <button type="button" className="btn btn-danger w-100 " onClick={() => this.nextButtonClick()}>{phrase}</button>
            )
        }
        else if (this.state.gameState === 2){
            phrase = "Next"
            return (
                <button type="button" className="btn btn-secondary w-100 " onClick={() => this.nextButtonClick()}>{phrase}</button>
            )
        }
    }


    Chatbox(){
        if (this.state.gameState >= 1 ){
            return(
                <input type="text" id='textEntry' onKeyDown={this.onKeyPress} className="form-control" placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>
            )
        }
        else {
            return(
                <input type="text" id='textEntry' onKeyDown={this.onKeyPress} className="form-control" disabled placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>
            )
        }
    }
}

type ChatProps = {
    gameState: number
}
type ChatState = {
    log: Array<string>,
    inputValue: string,
    typing: boolean,
}

export class Chat extends Component<ChatProps,ChatState> {
    constructor(props: ChatProps){
        super(props);
        this.state = ({
            log: [],
            inputValue: '',
            typing: false,
        })
        this.onKeyPress = this.onKeyPress.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    scrollToBottom() {
        animateScroll.scrollToBottom({
          containerId: "chatlog"
        });
    }

    onKeyPress(event: any){
        if ( (event.key === "Enter" || event.key === "NumpadEnter")){
            this.sendMessage(this.state.inputValue)
            this.setState({
                inputValue: ''
            })
        }
    }

    componentDidMount(){
        socket.on('typing', (data : any) =>{
            this.setState({typing:true})
        })
        socket.on('stopped_typing', (data : any) =>{
            this.setState({typing:false})
        })
        socket.on('new_message', (data: any) => {
            if (data.sender === 'server')
                var log = this.state.log.concat('SERVER: '+ data.message);
            else if (data.sender === socket.id)
                var log = this.state.log.concat('YOU: '+ data.message);
            else 
                var log = this.state.log.concat('OPPONENT: '+ data.message);

            this.setState({log:log});
        })
        this.scrollToBottom();
    }

    componentDidUpdate(prevProps: ChatProps){
        if (prevProps.gameState !== 0 && this.props.gameState === 0 )
            this.setState({log:[]})
    }

    sendMessage(message: string){
        socket.emit('new_message', {message: message});
    }

    handleChange(e: any){
        if (e.target.value !== ''){
            socket.emit('typing')
        }
        else {
            socket.emit('stopped_typing')
        }
        this.setState({
            inputValue: e.target.value
        })
    }

    render(){
        var chatbox =  <input type="text" id='textEntry' value={this.state.inputValue} onChange={this.handleChange} onKeyDown={this.onKeyPress} className="form-control" disabled placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>
        
        if (this.props.gameState > 1)
            chatbox =  <input type="text" id='textEntry' value={this.state.inputValue} onChange={this.handleChange} onKeyDown={this.onKeyPress} className="form-control" placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>

        return(
            <div className="input-group mb-3 fixed-bottom" style={{position : "absolute", bottom: 0}}>
                <div style={{marginBottom:"10px",backgroundColor:"whitesmoke", height:"40vh"}} className="overflow-auto border w-100">
                <ul id='chatlog' className="list-group">
                    {this.state.log.map((message,i) => <li className="list-group-item" key={i} style={{textAlign:'left', border:'none', backgroundColor:"whitesmoke"}}>
                        {this.NameTag(message)}
                        {message.split(':').pop()}
                        </li>)}
                </ul>
                </div>
                {chatbox}
            </div>
        )
    }

    NameTag(message:string){
        if (message.split(':')[0] === "SERVER")
            var tag = <p style={{color:"grey"}}>SERVER:</p>
        else if (message.split(':')[0] === "YOU")
            var tag = <p style={{color:"blue"}}>YOU:</p>
        else
            var tag = <p style={{color:"red"}}>OPPONENT:</p>

        return tag
    }

}