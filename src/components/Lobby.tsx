// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';

type LobbyProps = {
    userVideo: HTMLVideoElement | null
    userSmiled: boolean
    numFaces: number
  }

enum gameModes {
    RANDOM1v1 = 0,
    RANDOMGROUP= 1,
    FRIEND1v1 = 2,
    FRIENDGROUP = 3
}

type LobbyState = {
    gameMode: gameModes
    matchMake: boolean
}

export class Lobby extends Component<LobbyProps, LobbyState> {
    video: HTMLVideoElement | null = null
    peerVideo1: HTMLVideoElement | null = null
    peerVideo2: HTMLVideoElement | null = null
    peerVideo3: HTMLVideoElement | null = null
    peerVideo4: HTMLVideoElement | null = null


    
    constructor(props:LobbyProps){
        super(props)
        this.state = {
            gameMode: gameModes.FRIEND1v1,
            matchMake: false
        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps: LobbyProps) {
    }

    componentWillUnmount() {
    }

    
    render(){
        return (
            <div>
                <button onClick={() => this.setState({matchMake:true})}>Start</button>
                <video ref={ref => { this.video = ref; }} muted autoPlay={true} />
                <video style={{backgroundColor: 'white', }}ref={ref => { this.peerVideo1 = ref; }} muted autoPlay={true} />    
           

            </div>
        )
    }
}