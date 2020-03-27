// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';

type RandomChatProps = {
    userSmiled: boolean
    numFaces: number
  }

type RandomChatState = {
    ex: boolean
}

export class RandomChat extends Component<RandomChatProps, RandomChatState> {
    interval : any

    
    constructor(props:RandomChatProps){
        super(props)
        this.state = {
            ex: false
        }
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps: RandomChatProps) {
    }

    componentWillUnmount() {
    }

    
    render(){
        return (
            <div>

            </div>
        )
    }
}