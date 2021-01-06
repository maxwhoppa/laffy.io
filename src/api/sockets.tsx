import socketIOClient from "socket.io-client";

const url = process.env.REACT_APP_URL || 'https://localhost:8080/'

// export const socket = socketIOClient('https://laffy.io', {secure: true})

export const socket = socketIOClient(url, {secure:true})


let Peer = require('simple-peer')
var stream :any, peerVideo:any;
var connectionTime :any = null;

let client = {
  peer: new Peer(),
  gotAnswer:false,
}

// caller loses the game
export function leaveRoom(data: any){
    if (data.initiator){
        socket.emit('leave')
    }

    console.log('leaving')
    client.peer.destroy()
    connectionTime = null;
}

export function connectionUnderThreeSeconds(){
    if (connectionTime == null || Date.now() - connectionTime < 5*1000){
        return true
    }

    return false
}

export function socketStuff(s : any , pv: any) {
    stream = s;
    peerVideo = pv;

    console.log('socket stuff')
    
    //just remove this and call it seperately :) 
    socket.emit('NewClient')
}

export default client

function InitPeer(type: any ){
    let peer = new Peer({initiator:(type === 'init')? true: false, stream: stream, trickle: false})
    peer.on('stream', function (stream : any){
      peerVideo.srcObject = stream
    //   connectionTime = Date.now()
    })
    peer.on('close', function(){
        // document.getElementById('peerVideo').remove();
        peer.destroy() 
        connectionTime = null;

    })
    return peer
}

// Peer that will send the offer (peer of type init)
function MakePeer(){
    // when sending offer we must wait for offer from other user
    client.gotAnswer = false
    let peer = InitPeer('init')
    peer.on('signal', function(data: any){
        if (data.renegotiate || data.transceiverRequest) return
        if (!client.gotAnswer){
            socket.emit('Offer', data)
        }
    })
    client.peer = peer
}

//when we get an offer from another client (peer of type notinit)
function FrontAnswer(offer:any){
    let peer = InitPeer("notInit")
    peer.on('signal', (data :any) => {
        if (data.renegotiate || data.transceiverRequest) return
        socket.emit('Answer', data)
    })
    peer.signal(offer)
}

function SignalAnswer(answer : any){
    client.gotAnswer = true
    let peer = client.peer
    peer.signal(answer)
}


socket.on('BackOffer', FrontAnswer)
socket.on('BackAnswer', SignalAnswer)
socket.on('CreatePeer', MakePeer)
socket.on('leave', leaveRoom)

export function RandomChatLoss(){
    socket.emit('RandomLoss')
}



