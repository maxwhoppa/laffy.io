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
      console.log('joining room; ' +room )

      io.to(room).emit('countdown')
    }
    else {
      console.log('queuing room; ' +socket.id+'chat' )
      queue[socket.id+'chat'] = socket      
    }
      clients++;
    });

  socket.on('checkFull', data =>{
    if (data && data.id !== null)
    io.in(data.id).clients((err , clients) => {
      if (clients.length > 1)
        io.to(socket.id).emit('roomFull')
      else
        io.to(socket.id).emit('roomOpen')
    })
  })

  socket.on('NewPrivateClient', data =>{
    io.in(data.id).clients((err , clients) => {
      if (data.id !== null){
        console.log('data.id not null')
        if (clients.length > 1){
          io.to(socket.id).emit('new_message', {sender:'server', message : 'Room ' + data.id + ' full.'})
          console.log('room full '+data.id)
        }
        else{
          io.to(data.id).emit('CreatePeer')
          socket.join(data.id)
          io.to(socket.id).emit('new_message', {sender:'server', message : 'Room: '+data.id})
          console.log('joining '+data.id)
        }
      }
    })
  })

  socket.on('Offer', SendOffer)
  socket.on('Answer', SendAnswer)

  socket.on('leave', function() {
    console.log('leave')

    room = Object.keys(socket.rooms).filter(item => item!=socket.id)
      console.log('leaving room: '+room)

      io.in(room).clients((err , clients) => {
        for (const client of clients){
          if (client !== socket.id){
            if (io.sockets.connected[client].started){
              io.sockets.connected[client].wins += 1
              io.sockets.connected[client].winstreak += 1
              io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Left!'})
            }
            else{
              io.to(client).emit('new_message',{sender:'server',message : 'Your Opponent Left.'})
            }
          }
          else {
            if (io.sockets.connected[client]){
              if (io.sockets.connected[client].started){
                io.sockets.connected[client].winstreak = 0
                io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Left During The Game!'})
              }
              else
                io.to(client).emit('new_message',{sender:'server',message : 'You Left.'})
            }
          }
          // remember this is needed on replay
          if (io.sockets.connected[client])
            io.sockets.connected[client].started = false
        }
      })
        
      if (room){
        io.to(room).emit('leave',{initiator:false})
        io.in(room).clients((err , clients) => {
          for (const client of clients){
            if (io.sockets.connected[client])
              io.sockets.connected[client].leave(room)
          }
        });
      }

      if (queue.hasOwnProperty(socket.id+'chat'))
        delete queue[socket.id+'chat']
              
  });

  socket.on('loss', data => {
    console.log('loss')

    room = Object.keys(socket.rooms).filter(item => item!=socket.id)

    io.in(room).clients((err , clients) => {
      for (const client of clients){
        if (client !== socket.id){
          if (io.sockets.connected[client].started){
            io.sockets.connected[client].winstreak += 1
            io.sockets.connected[client].win += 1
          }
          io.to(client).emit('win')
          if (data.type === 'smiled')
            io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Smiled First!'})
          else if (data.type ==='no_face')
            io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Hid Their Face!'})

        }
        else {
          if (io.sockets.connected[client].started){
            io.sockets.connected[client].winstreak = 0
          }
          io.to(client).emit('loss')
          if (data.type === 'smiled')
            io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Smiled First!'})
          else if (data.type ==='no_face')
            io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Hid Your Face!'})

        }
        if (io.sockets.connected[client])
          io.sockets.connected[client].started = false
      }
    })

  });

  socket.on('play_again', function() {
    console.log('started')

    socket.again = true
    socket.started = false
    room = Object.keys(socket.rooms).filter(item => item!=socket.id)

    io.in(room).clients((err , clients) => {
      for (const client of clients){
        console.log(client)
        if (client !== socket.id){
          if (io.sockets.connected[client].again){
            socket.started = false
            io.sockets.connected[client].started = false
            socket.again = false
            io.sockets.connected[client].again = false
            io.to(room).emit('new_message', {sender:'server',message : 'Starting in... ' })
            io.to(room).emit('countdown')
          }
        }
      }
    })


  });

  socket.on('started', function() {
    socket.started = true
  });
  
  socket.on('disconnecting', function() {
    console.log('disconnecting')
    if (clients > 0)
      clients--
    
    room = Object.keys(socket.rooms).filter(item => item!=socket.id)


    io.in(room).clients((err , clients) => {
      for (const client of clients){
        if (client !== socket.id){
          if (io.sockets.connected[client] && io.sockets.connected[client].started){
            io.sockets.connected[client].winstreak += 1
            io.sockets.connected[client].wins += 1
            io.to(client).emit('win')
            io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Left'})
          }
          else {
            io.to(client).emit('new_message',{sender:'server',message : 'Your Opponent Left.'})
          }
        }
        else {
          if (io.sockets.connected[client] && io.sockets.connected[client].started){
            io.sockets.connected[client].winstreak = 0
            io.to(client).emit('loss')
            io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Disconnected!'})
          }
          else {
            io.to(client).emit('new_message',{sender:'server',message : 'You Disconnected.'})
          }
        }
        if (io.sockets.connected[client])
          io.sockets.connected[client].started = false
      }
    })

    if (room){
      io.to(room).emit('leave',{initiator:false})
      io.in(room).clients((err , clients) => {
        for (const client of clients){
          if (io.sockets.connected[client])
          io.sockets.connected[client].leave(room)
        }
      });
    }

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
