// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {WebcamComponent} from './WebcamComponent'


type HomePageState = {
    renderChoice: number
  }

type HomePageProps = {}

export class HomePage extends Component<HomePageProps, HomePageState> {
    interval : any

    
    constructor(props: HomePageProps){
        super(props)
        this.state = {
            renderChoice: -1
        }

        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        this.setState({
            renderChoice: -1
        })
    }

    componentDidUpdate(prevProps: HomePageProps) {

    }

    componentWillUnmount() {
    }

    handleClick(){
        this.setState({
            renderChoice: 0
        })
    }

    Choices(props: any) {
        if (props.renderChoice === 0){
            return <WebcamComponent/>
        }
        else {
            return (
                <div>
                    <button onClick={props.handleClick}/>
                </div>
            )
        }
    }
    
    render(){
        return (
            <div>
                <this.Choices renderChoice={this.state.renderChoice} handleClick={this.handleClick}/>
            </div>
        )
    }
}