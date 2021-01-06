const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const fs = require('fs');
const https = require('https')
const PROD = process.env.PROD || false

console.log('PROD:' +PROD)
if (PROD){
  console.log('it worked')
  var privateKey  = fs.readFileSync('/etc/letsencrypt/live/laffy.io/privkey.pem', 'utf8');
  var certificate = fs.readFileSync('/etc/letsencrypt/live/laffy.io/fullchain.pem', 'utf8');
  var credentials = {key: privateKey, cert: certificate};
}
else{
  var privateKey  = fs.readFileSync('./file.pem', 'utf8');
  var certificate = fs.readFileSync('./file.crt', 'utf8');
  var credentials = {key: privateKey, cert: certificate};
}

const httpsServer = https.createServer(credentials,app);
const io = require('socket.io')(httpsServer)


// const https = require('https').Server(app)
 
clients = 0

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

queue = {}

io.on('connection', function(socket) {
  socket.on('NewClient', function() {
    io.to(socket.id).emit('new_message', {sender:'server',message : 'Looking for an opponent...'})
    if (Object.keys(queue).length > 0){
      room = Object.keys(queue)[0]
      peerSocket = queue[room]
      io.to(socket.id).emit('new_message', {sender:'server',message : 'Opponent Found!'})
      io.to(peerSocket.id).emit('new_message', {sender:'server',message : 'Opponent Found!'})
      io.to(socket.id).emit('new_message', {sender:'server',message : 'Starting in... ' })
      io.to(peerSocket.id).emit('new_message', {sender:'server',message : 'Starting in... ' })
      io.to(room).emit('CreatePeer')
      socket.join(room);
      io.to(room).emit('CreatePeer')
      peerSocket.join(room)
      delete queue[room]
      
      io.to(room).emit('countdown')
    }
    else {
      queue[socket.id+'chat'] = socket      
    }
      clients++;
    });

  socket.on('Offer', SendOffer)
  socket.on('Answer', SendAnswer)

  socket.on('leave', function() {
    console.log('leave')

    room = Object.keys(socket.rooms).filter(item => item!=socket.id)
      console.log('leaving room: '+room)
      io.to(room).emit('leave',{initiator:false})
      socket.leave(room)
      socket.to(socket.id).emit('loss')
      socket.winstreak = 0

      io.in(room).clients((err , clients) => {
        for (const client of clients){
          if (client !== socket.id){
            io.to(client).emit('win') // change to abandoned, not win
            io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Left!'})
          }
        }
      })
        
      if (queue.hasOwnProperty(socket.id+'chat'))
        delete queue[socket.id+'chat']
              
  });

  socket.on('loss', function() {
    console.log('loss')

    room = Object.keys(socket.rooms).filter(item => item!=socket.id)

    io.in(room).clients((err , clients) => {
      for (const client of clients){
        if (client !== socket.id){
          io.to(client).emit('win')
          io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Smiled First!'})
        }
        else {
          io.to(client).emit('loss')
          io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Smiled First!'})
        }
      }
    })

  });
  
  socket.on('disconnecting', function() {
    console.log('disconnect')
    if (clients > 0)
      clients--
    
    room = Object.keys(socket.rooms).filter(item => item!=socket.id)
    socket.to(room).emit('leave', {initiator:false})

    io.in(room).clients((err , clients) => {
      for (const client of clients){
        if (client.id !== socket.id){
          io.to(client).emit('win')
          io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Left'})
          socket.winstreak = socket.winstreak + 1
          socket.wins = socket.wins + 1
        }
        else {
          io.to(client).emit('loss')
          io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Disconnected!'})
          socket.winstreak = 0
        }
      }
    })

    if (queue.hasOwnProperty(socket.id+'chat'))
      delete queue[socket.id+'chat']

  });


  socket.on('RandomLoss', RandomLoss)

  socket.on('new_message', (data) => {
    room = Object.keys(socket.rooms).filter(item => item!=socket.id)
    io.to(room).emit('new_message', {sender:socket.id ,message : data.message})
  })

  socket.on('typing', (data) => {
    socket.to(Object.keys(socket.rooms).filter(item => item!=socket.id)[0]).emit('typing')
  })

  socket.on('stopped_typing', (data) => {
    socket.to(Object.keys(socket.rooms).filter(item => item!=socket.id)[0]).emit('stopped_typing')
  })
})

function RandomLoss(){
  //TODO record the loss to the user's account if logged in 
  this.to(room).emit('RandomEndGame')
}

function SendOffer(offer) {
  this.to(room).emit("BackOffer", offer)
}

function SendAnswer(answer) {
  this.to(room).emit("BackAnswer", answer)
}

httpsPort = process.env.HTTPS_PORT || 8080
httpsServer.listen(httpsPort)

httpPort = process.env.HTTP_PORT || 8081
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(httpPort);

console.log('httpPort: '+ httpPort + ' httpsPort: '+ httpsPort)
