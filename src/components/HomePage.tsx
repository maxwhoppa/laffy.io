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
            // <div>
            //     {(this.state.renderChoice === -1) ?this.Home(this.props) : <WebcamComponent/>} 
            // </div>
            <div className="container-fluid" style={{height:"100%", padding: "0px"}}>
            <div className="w-100 h-100 row"style={{marginLeft:"-10px"}}>
              <div className="w-100 h-100 col-sm-4">
              {(this.state.renderChoice === -1) ?this.Home(this.props) : <WebcamComponent/>} 
              </div>
              <div className="col-6 h-100">
                <div className="mb-2 h-100">
                  <h1 className="Display text-center">Win Streak</h1>
                  <h3 className="Display text-center">0</h3>
                  <div className="input-group mb-3 fixed-bottom" style={{position : "absolute", bottom: 0}}>
                    <div style={{marginBottom:"10px",backgroundColor:"whitesmoke", height:"40vh"}} className="border w-100">
                    </div>
                    <input type="text" className="form-control" placeholder="Press Enter To Send Message" aria-label="Username" aria-describedby="basic-addon1"/>
                  </div>
                </div>
              </div>
              <div className="col" >
                <div className="mb-2 h-100" >
                  <img className="rounded mx-auto d-block" src="LAFFY_APP_MODEL.png" style={{width: "100%",position:"absolute", top:0, paddingRight: "20px"}}/>
                    <div className="input-group mb-3" style={{position:"absolute", bottom:0, paddingRight: "20px"}}>
                        <button type="button" className="btn btn-secondary w-100 " onClick={() => this.handleClick()}>Next</button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )
    }

    Home(props: any){
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