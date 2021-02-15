// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {WebcamComponentMemo} from './WebcamComponent'
import {VideoAnalyzerState} from './VideoAnalyzer'
import {leaveRoom, socket, socketStuff, privateSocketStuff} from '../api/sockets';
import Background from '../pics/background.png';
import BlackBackground from '../pics/black_background.png';

import logo from '../pics/lineup.png'
import loading from '../pics/Animation_2.gif'


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

    strikes: number

    chatInput: string

    winstreak: number

    countdown: number

    started: boolean
  }

type HomePageProps = {
    width: any,
    id: string | null
}

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
            countdown:4,
            strikes: 5,
            started: false,
        }

        this.nextButtonClick = this.nextButtonClick.bind(this)
        this.rematchButtonClick = this.rematchButtonClick.bind(this)

    }

    onKeyPress(event: any){
        if(event.keyCode === 27) {
            if (this.props.id !== null)
                this.rematchButtonClick();
            else
                this.nextButtonClick();
        }
    }

    componentDidMount() {
        window.onorientationchange = function () {
            window.scroll(0, document.documentElement.scrollHeight)
        } 
        if (this.props.width <= 500){
            window.scroll(0, document.documentElement.scrollHeight)
        }

        var intervalID : any;
        document.addEventListener("keydown", this.onKeyPress, false);

        socket.on('leave', () =>{
            leaveRoom({initiator:false})
            this.setState({gameState:0, countdown:4, started: false})
            if (intervalID){
                window.clearInterval(intervalID);
            }
        });

        socket.on('win', () =>{
            this.setState({gameState:2,winstreak:this.state.winstreak+1,countdown:4})
            if (intervalID){
                window.clearInterval(intervalID);
            }
        });

        socket.on('loss', ()=> {
            this.setState({gameState:2, winstreak:0,countdown:4});
            if (intervalID){
                window.clearInterval(intervalID);
            }
        });

        socket.on('countdown', ()=> {
            this.setState({gameState: .5});

            intervalID = setInterval(() => {
                var countdown = this.state.countdown;
                var gameState = this.state.gameState;
                countdown -= 1;

                if (countdown === 0){
                    countdown = 4
                    gameState = 1
                    window.clearInterval(intervalID);
                    intervalID = null
                }
                    
                this.setState({countdown:countdown, gameState: gameState});

            }, 1000);
            
        });
    
    }

    componentDidUpdate(prevProps: HomePageProps, prevState: HomePageState) {
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
            this.setState({gameState:.1})
        }
        else if (this.state.gameState === .1 || this.state.gameState === .5){
            leaveRoom({initiator:true})
            this.setState({gameState:0})
        }
        else if (this.state.gameState === 1){
            this.setState({gameState:1.5})
        }
        else if (this.state.gameState === 1.5){
            var winstreak = 0;
            leaveRoom({initiator:true})
            this.setState({gameState:0, winstreak: winstreak})
            
        }
        else if (this.state.gameState === 2 || this.state.gameState === 2.5){
            leaveRoom({initiator:true})
            this.setState({gameState:0})
        }
    }

    handleWebcamChange(VideoAnalyzerState: VideoAnalyzerState){
        var gameState = this.state.gameState;
        var strikes = this.state.strikes;
        var started = this.state.started;

        if (VideoAnalyzerState.faceDetectionActive){

            if (this.props.id !== null && !started){
                privateSocketStuff(this.video?.srcObject, this.peerVideo, this.props.id)
                started = true
            }

            if (gameState === -1 && VideoAnalyzerState.numFaces !== 0){
                if (this.props.id !== null)
                    gameState = 2
                else 
                    gameState = 0
            }
            else if (gameState === 0 && VideoAnalyzerState.numFaces === 0){
                gameState = -1
            }
            else if (gameState === 1 || gameState === 1.5){
                if (VideoAnalyzerState.userSmiled){
                    socket.emit('loss', {type: 'smiled'})
                    console.log('user smiled, emitting loss')
                }
                if (this.state.numFaces === 0){
                    strikes -=  1;
                    if (strikes === 0){
                        socket.emit('loss', {type: 'no_face'})
                        strikes = 5
                    }
                } else {
                    strikes = 5
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
                gameState: gameState,
                strikes:strikes,
                started:started
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
        const { width } = this.props;
        const isMobile = width <= 500;
        var tag;
        
        var buttons = <div className="input-group mb-3" style={{position:"absolute", bottom:0, paddingRight: "20px", lineHeight: 'normal'}}>
        <p className="w-100">Players Detected: {this.state.numFaces}</p>
        {this.Rematch()}
        {this.Button()}
        </div>

        if (isMobile){
            buttons =<div className="input" style={{position:"fixed", width:'50%', left:'50%', bottom:0, paddingRight: "10px", paddingLeft:'10px', lineHeight: 'normal'}}>
                {this.Rematch()}
                {this.Button()}
                </div>

            if (this.state.userSmiled){
                tag = <img className="rounded mx-auto d-block" src={loading} alt='laffy logo' style={{
                    width: '15%',
                    top: '10px',
                    right:'0px',
                    position: 'fixed',
                }}/>
            }
            else {
                tag = <img className="rounded mx-auto d-block" src={logo} alt='laffy logo' style={{
                    width: '15%',
                    top: '10px',
                    right:'0px',
                    position: 'fixed',
                }}/>
            }
        }
        else {
            if (this.state.userSmiled){
                tag = <img className="rounded mx-auto d-block" src={loading} alt='laffy logo' style={{width: "100%",position:"absolute", top:0, paddingRight: "0px"}}/>
            }
            else 
                tag = <img className="rounded mx-auto d-block" src={logo} alt='laffy logo' style={{width: "100%",position:"absolute", top:0, paddingRight: "0px"}}/>
        }

        if (isMobile){
            return (
                // <div>
                //     {(this.state.gameState === -1) ?this.Home(this.props) : <WebcamComponent/>} 
                // </div>
                <div className="container-fluid h-100" >
                <div className="w-100 h-100 row">
                  <div className="w-100 h-100" style={{paddingLeft:0}}>
                 <WebcamComponentMemo
                  handleWebcamChange={this.handleWebcamChange}
                  configureVideo={this.configureVideo}
                  width={this.props.width}
                  />
                  
                  </div>
                  <div className="h-100">
                    <div className="mb-2 h-100">
                        <Chat gameState={this.state.gameState} countdown={this.state.countdown} width={this.props.width}/>
                    </div>
                  </div>
                  <div className="" >
                    <div className="" style={{ position: 'fixed', top:'90%', bottom: '0px', lineHeight: 'normal', width: '100%', height: '10%',left: '0%'}}>
                        {tag}
                        {buttons}
                    </div>
                  </div>
                </div>
              </div>
            )
        }
        return (
            // <div>
            //     {(this.state.gameState === -1) ?this.Home(this.props) : <WebcamComponent/>} 
            // </div>
            <div className="container-fluid h-100" >
            <div className="w-100 h-100 row">
              <div className="w-100 h-100 col-sm-4" style={{paddingLeft:0}}>
             <WebcamComponentMemo
              handleWebcamChange={this.handleWebcamChange}
              configureVideo={this.configureVideo}
              width={this.props.width}
              />
              
              </div>
              <div className="col-6 h-100">
                <div className="mb-2 h-100">
                    <Chat gameState={this.state.gameState} countdown={this.state.countdown} width={this.props.width}/>
                </div>
              </div>
              <div className="col" >
                <div className="mb-2 h-100" >
                    {tag}
                    {buttons}
                </div>
              </div>
            </div>
          </div>
        )
    }

    rematchButtonClick(){
        if (this.state.gameState === 2 && this.state.numFaces > 0){
            socket.emit('play_again')
            this.setState({gameState:2.5})
        }
    }

    Rematch(){
        var button;
        const { width } = this.props;
        const isMobile = width <= 500;
        
        if (this.props.id !== null){
            var phrase = "Loading..."
            if (this.state.gameState === -1){
                if (this.state.faceDetectionActive){
                    phrase = "No Faces Detected"
                }
                button = <button type="button" className="btn btn-secondary w-100 h-100" disabled >{phrase}</button>
            }
            else if (this.state.gameState === 2){
                    button = <button type="button" className="btn btn-success w-100 h-100" onClick={() => this.rematchButtonClick()}>{'Ready Up'}</button>
            }

            if (this.state.faceDetectionActive && this.state.numFaces === 0)
                button = <button type="button" className="btn btn-secondary w-100 h-100" disabled >{'No Faces Detected'}</button>

            if (this.state.numFaces > 0 && (this.state.gameState === 2.5 || this.state.gameState === .5 || this.state.gameState === 1))
                button = <button type="button" className="btn btn-secondary w-100 h-100" disabled >{'Ready!'}</button>

            if (isMobile){
                button = <div style={{position: 'fixed', height: '10%', bottom: '0px', lineHeight: 'normal', width: '100%', left: 0,}}>
                    {button}
                </div>
            }

            return button
        }


        button = <button style={{marginBottom:'5px'}} type="button" className="btn btn-success w-100 h-100" onClick={() => this.rematchButtonClick()}>{'Rematch'}</button>

        if (isMobile){
            button = <div style={{position: 'fixed', height: '10%', bottom: '0px', lineHeight: 'normal', width: '50%', left: 0,}}>
            {button}
        </div>
        }
        if (this.state.gameState === 2)
            return button
        else 
            return

    }

    Logo(){
        if (this.state.userSmiled === true)
         return  <img className="rounded mx-auto d-block" src={loading} alt='laffy logo' style={{width: "100%",position:"absolute", top:0, paddingRight: "0px"}}/>

        else
        return  <img className="rounded mx-auto d-block" src={logo} alt='laffy logo' style={{width: "100%",position:"absolute", top:0, paddingRight: "0px"}}/>
    }

    Button(){
        const { width } = this.props;
        const isMobile = width <= 500;

        if (this.props.id !== null)
            return 
        
        var phrase = "";
        var overhead = "Number of Players: " + this.state.numFaces;
        var button;
        if (this.state.gameState === -1){
            if (this.state.faceDetectionActive === false){
                phrase = "Loading..."
            }
            else if (this.state.numFaces === 0){
                phrase = "No Faces Detected"
            }
            button = <button type="button" className="btn btn-secondary w-100 h-100" disabled onClick={() => this.nextButtonClick()}>{phrase}</button>
            
        }
        else if (this.state.gameState === 0 ){
            phrase = "Start"
            
            button = <button type="button" className="btn btn-success w-100 h-100" onClick={() => this.nextButtonClick()}>{phrase}</button>
            
        } 
        else if (this.state.gameState > 0 && this.state.gameState < 1){
            phrase = "Cancel And Leave"
            
            button = <button type="button" className="btn btn-secondary w-100 h-100" onClick={() => this.nextButtonClick()}>{phrase}</button>
            
        }
        else if (this.state.gameState === 1){
            phrase = "Leave Room"
            
            button =   <button type="button" className="btn btn-danger w-100 h-100" onClick={() => this.nextButtonClick()}>{phrase}</button>
            
        }
        else if (this.state.gameState === 1.5){
            phrase = "Are You Sure?"
            button =     <button type="button" className="btn btn-danger w-100 h-100" onClick={() => this.nextButtonClick()}>{phrase}</button>
            
        }
        else if (this.state.gameState === 2 || this.state.gameState === 2.5 ){
            phrase = "Leave Room"
            button =     <button type="button" className="btn btn-secondary w-100 h-100" onClick={() => this.nextButtonClick()}>{phrase}</button>

        }
        if (isMobile){
            if (this.state.gameState !== 2){
                button = <div style={{position: 'fixed', height: '10%', bottom: '0px', lineHeight: 'normal', width: '100%', left: 0,}}>
                    {button}
                </div>
            }
            else {
                button = <div style={{position: 'fixed', height: '10%', bottom: '0px', lineHeight: 'normal', width: '50%', right: 0,}}>
                {button}
            </div>
            }
        }

        return(
            button
        )
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
    gameState: number,
    countdown: number,
    width: any
}
type ChatState = {
    log: Array<string>,
    inputValue: string,
    typing: boolean,
}

export class Chat extends Component<ChatProps,ChatState> {
    messagesEndRef = React.createRef<HTMLDivElement>()

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
        if (this.messagesEndRef.current)
            this.messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    onKeyPress(event: any){
        if ( (event.key === "Enter" || event.key === "NumpadEnter") && this.state.inputValue !== ''){
            this.sendMessage(this.state.inputValue)
            this.setState({
                inputValue: ''
            })
        }
    }

    componentDidMount(){
        this.scrollToBottom()

        socket.on('typing', (data : any) =>{
            this.setState({typing:true})
        })
        socket.on('stopped_typing', (data : any) =>{
            this.setState({typing:false})
        })
        socket.on('new_message', (data: any) => {
            var log;
            if (data.sender === 'server')
                log = this.state.log.concat('SERVER: '+ data.message);
            else if (data.sender === socket.id)
                log = this.state.log.concat('YOU: '+ data.message);
            else 
                log = this.state.log.concat('OPPONENT: '+ data.message);

            this.setState({log:log});
            this.scrollToBottom();
        })

    }

    componentDidUpdate(prevProps: ChatProps){

        if (prevProps.gameState !== 0 && this.props.gameState === 0 )
            this.setState({log:[]})

        if (this.props.gameState === .5 && this.props.countdown !== prevProps.countdown){
            var log = this.state.log
            log[log.length-1] = log[log.length-1] +  this.props.countdown + "... "

            this.setState({log:log});
        }
        if (this.props.gameState === 1 && this.props.countdown !== prevProps.countdown){
            var log = this.state.log
            log[log.length-1] = log[log.length-1] + "Go!"
            this.setState({log:log});

            socket.emit('started')
        }

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
        const { width } = this.props;
        const isMobile = width <= 500;

        var chatbox =  <input type="text" id='textEntry' value={this.state.inputValue} onChange={this.handleChange} onKeyDown={this.onKeyPress} className="form-control" disabled placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>
        
        if (this.props.gameState >= 1)
            chatbox =  <input type="text" id='textEntry' value={this.state.inputValue} onChange={this.handleChange} onKeyDown={this.onKeyPress} className="form-control" placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>

        if (isMobile)
            return (
                <div className="input-group mb-3 fixed-bottom" style={{position : "fixed", width:'100%',height:'35%', top: '50%'}}>
                <div style={{backgroundColor:"whitesmoke", height:"100%"}} className="overflow-auto border w-100">
                <ul id='chatlog' className="list-group" style={{ maxWidth: "100%", overflowX: "hidden", lineHeight: "normal"}}>
                    {this.state.log.map((message,i) => <li className="list-group-item" key={i} style={{textAlign:'left', border:'none', backgroundColor:"whitesmoke"}}>
                        {this.NameTag(message)}
                        {message.substring(message.indexOf(":") + 1)}
                        </li>)}
                        <div ref={this.messagesEndRef}/>
                </ul>
                </div>
                {chatbox}
            </div>
            )
        else 
            return (
                <div className="input-group mb-3 fixed-bottom" style={{position : "absolute", bottom: 0}}>
                    <div style={{marginBottom:"5px",backgroundColor:"whitesmoke", height:"90vh"}} className="overflow-auto border w-100">
                    <ul id='chatlog' className="list-group" style={{ maxWidth: "100%", overflowX: "hidden", lineHeight: "normal"}}>
                        {this.state.log.map((message,i) => <li className="list-group-item" key={i} style={{textAlign:'left', border:'none', backgroundColor:"whitesmoke"}}>
                            {this.NameTag(message)}
                            {message.substring(message.indexOf(":") + 1)}
                            </li>)}
                            <div ref={this.messagesEndRef}/>
                    </ul>
                    </div>
                    {chatbox}
                </div>
            )
    }

    NameTag(message:string){
        var tag;
        if (message.split(':')[0] === "SERVER")
            tag = <b style={{color:"grey"}}>SERVER:</b>
        else if (message.split(':')[0] === "YOU")
            tag = <b style={{color:"blue"}}>YOU:</b>
        else
            tag = <b style={{color:"red"}}>OPPONENT:</b>

        return tag
    }

}