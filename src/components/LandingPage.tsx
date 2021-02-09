// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
import logo from '../pics/LAFFY_APP_MODEL_COLOR.png'
import { HomePage } from './HomePage';
import { PrivatePage } from './PrivatePage';
import { socket} from '../api/sockets';


import { Terms } from './Terms';
import { FaceLandmarkNet } from 'face-api.js';




type LandingPageProps = {}

enum gametype {
    NONE = 0,
    PRIVATE= .9,
    PRIVATESTART = 1,
    PUBLIC = 2,
    TERMS = -1,
}
type LandingPageState = {
    game: gametype,
    id: string | null,
    inputValue: string,
    full: boolean,
    joined: boolean,
    width: any
}

export class LandingPage extends Component<LandingPageProps,LandingPageState> {
    
    constructor(props:LandingPageProps){
        super(props)
        this.state = {
            game: gametype.NONE,
            id : null,
            inputValue: '',
            full: false,
            joined: false,
            width: window.innerWidth,
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleWindowSizeChange = () => {
        this.setState({ width: window.innerWidth });
      };

    componentDidMount() {
        window.addEventListener('resize', this.handleWindowSizeChange);

        socket.on('roomFull', () =>{
            this.setState({full:true})
        })

        socket.on('roomOpen', () =>{
            this.setState({joined:true})
        })
    }

    componentDidUpdate(prevState: LandingPageState) {
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    }

    handleClick(val:gametype){
        if (this.state.game === gametype.PRIVATE){
        }
        this.setState({game: val})
    }

    handleChange(e: any){
        this.setState({
            inputValue: e.target.value,
            full:false
        })
    }
    
    render(){
        ($('[data-toggle="popover"]')as any).popover('dispose')
        if (this.state.joined)
            return(<PrivatePage width = {this.state.width} id={this.state.inputValue}/>)
        else if (this.state.game === gametype.NONE)
            return (
                <div className="container-fluid h-100 mx-auto" >
                <div className="w-100 h-100 row mx-auto">
                <div className="w-100 h-100 col-sm-4 mx-auto" style={{lineHeight: 'normal'}}>
                <img className="rounded mx-auto d-block" src={logo} alt='laffy logo' style={{width: "80%", marginBottom:'60px'}}/>

                <button type="button" className="btn btn-info" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Play With A Friend in a Private Room!" onClick={() => this.handleClick(gametype.PRIVATE)} style={{margin:'10px'}}>
                    Private Game
                </button>                  

                <button type="button" className="btn btn-info" data-container="body" data-trigger="hover" data-toggle="popover" data-placement="top" data-content="Play With A Random Opponnent!" onClick={() => this.handleClick(gametype.PUBLIC)} style={{margin:'10px'}}>
                    Public Game
                </button>             

                <p style={{marginTop:'50px'}}> 
                     Hi! Welcome To Laffy.io! <br/> <br/>
                    Laffy.io is a video chat website where the first person who smile loses! Match up with friends or strangers and try to make the other person laugh!
                    <br/>
                    <br/>
                    My name is Maxwell <a href='https://www.instagram.com/maxwhoppa/?hl=en'>(@Maxwhoppa)</a>. Laffy was created as a fun project idea that I wanted to turn into reality. If you like the game or want to send some feedback feel free to follow me / send me a message!
                    If people show interest, I will continue to make improvements and add new features!

                    <br/><br/>
                    <i>Works best in chrome. If you are stuck on the loading screen, ensure that your camera is properly set up. </i>
                </p>

                </div>
                </div>
                <div style={{position: 'fixed', bottom: 0, right: 10}}>
                    <p onClick={() => this.handleClick(gametype.TERMS)}style={{cursor: 'pointer'}} ><u>terms</u></p>
                </div>
                </div>
            )
        else if (this.state.game === gametype.PRIVATE)
            return (
                <div className="container-fluid h-100 mx-auto" >
                <div className="w-100 h-100 row mx-auto">
                <div className="w-100 h-100 col-sm-4 mx-auto">
                <img className="rounded mx-auto d-block" src={logo} alt='laffy logo' style={{width: "80%"}}/>

                {this.FullMessage()}
                <input type="text" id='textEntry' onChange={this.handleChange} value={this.state.inputValue} className="form-control" placeholder="Room ID" aria-label="Username" aria-describedby="basic-addon1" />
        
                <button type="button" className="btn btn-success w-100 " style={{marginTop:'5px'}}  onClick={() => socket.emit('checkFull',{id:this.state.inputValue})}>Join Room</button>  
                </div>
                </div>
                <div style={{position: 'fixed', bottom: 0, right: 10}}>
                    <p onClick={() => this.handleClick(gametype.TERMS)}style={{cursor: 'pointer'}} ><u>terms</u></p>
                </div>
                </div>
            )
        else if (this.state.game === gametype.PUBLIC)
            return (<HomePage width = {this.state.width}/>)
        else return (<Terms/>)
    }

    FullMessage(){
        var phrase = 'Enter Room ID'
        var color = 'black'
        if (this.state.full){
            phrase = 'Room Full'
            color = 'red'
        }

    return <p style={{marginTop:'50px',color:color}}>{phrase}</p>

    }
}