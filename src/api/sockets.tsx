import socketIOClient from "socket.io-client";
export const socket = socketIOClient('http://localhost:8080/')


let Peer = require('simple-peer')

let client = {
  peer: new Peer(),
  gotAnswer:false,
  RandomEndGame: false
}

// caller loses the game
export function userSmiled(){
    
}

export function socketStuff(stream : any , peerVideo: any) {

    console.log('socket stuff')
    
    //just remove this and call it seperately :) 
    socket.emit('NewClient')


        function InitPeer(type: any ){
            let peer = new Peer({initiator:(type === 'init')? true: false, stream: stream, trickle: false})
            peer.on('stream', function (stream : any){
              peerVideo.srcObject = stream
            })
            peer.on('close', function(){
                // document.getElementById('peerVideo').remove();
                peer.destroy() 
            })
            return peer
        }

        // Peer that will send the offer (peer of type init)
        function MakePeer(){
            // when sending offer we must wait for offer from other user
            client.gotAnswer = false
            let peer = InitPeer('init')
            peer.on('signal', function(data: any){
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
                socket.emit('Answer', data)
            })
            peer.signal(offer)
        }

        function SignalAnswer(answer : any){
            client.gotAnswer = true
            let peer = client.peer
            peer.signal(answer)
        }

        function SessionActive(){
            document.write('Session Active. Please try again later')
        }

        function RandomEndGame(){
            client.RandomEndGame = true;
        }

        socket.on('BackOffer', FrontAnswer)
        socket.on('BackAnswer', SignalAnswer)
        socket.on('SessionActive', SessionActive)
        socket.on('CreatePeer', MakePeer)
}

export default client

export function RandomChatLoss(){
    socket.emit('RandomLoss')
}



