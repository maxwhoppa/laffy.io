// This component is the logic behind the random video chat given the video data and socket data provided in props 
import React, {Component} from 'react';
// import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {WebcamComponent} from './WebcamComponent'
import logo from '../logo.svg';


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
            <p>
            Welcome to Laffy.io
            </p>
              <img src={logo} className="App-logo" alt="logo" />
                <div>
                    <button onClick={props.handleClick}/>
                </div>
            </div>

            )
        }
    }
    
    render(){
        return (
            <div>
                {(this.state.renderChoice === -1) ?this.Home(this.props) : <WebcamComponent/>} 
            </div>
        )
    }

    Home(props: any){
        return (
            <div>
            <p>
            NEXT OBJECTIVE: OMEGLE-LIKE CSS FORMAT
            </p>
              <img src={logo} className="App-logo" alt="logo" />
                <div>
                    <button onClick={() => this.setState({renderChoice: 0})}/>
                </div>
            </div>
        )
    }
}