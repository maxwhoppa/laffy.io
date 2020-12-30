const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http)
 
clients = 0

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

var privateKey  = fs.readFileSync('/etc/letsencrypt/live/laffy.io/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/laffy.io/fullchain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
app.use (function (req, res, next) {
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});

queue = {}
room = 0

io.on('connection', function(socket) {
  socket.on('NewClient', function() {
    io.to(socket.id).emit('new_message', {sender:'server',message : 'Looking for an opponent...'})
    if (Object.keys(queue).length > 0){
      room = Object.keys(queue)[0]
      peerSocket = queue[room]
      io.to(socket.id).emit('new_message', {sender:'server',message : 'Opponent Found!'})
      io.to(peerSocket.id).emit('new_message', {sender:'server',message : 'Opponent Found!'})
      io.to(room).emit('CreatePeer')
      socket.join(room);
      io.to(room).emit('CreatePeer')
      peerSocket.join(room)
      delete queue[room]
      
    }
    else {
      queue[socket.id+'chat'] = socket
      room++
      
    }
      clients++;
    });

  socket.on('Offer', SendOffer)
  socket.on('Answer', SendAnswer)

  socket.on('leave', function() {
    console.log('leave')

    room = Object.keys(socket.rooms).filter(item => item!=socket.id)
      console.log('leaving room: '+room)
      socket.to(room).emit('leave',{initiator:false})
      socket.leave(room)
      if (queue.hasOwnProperty(socket.id+'chat'))
        delete queue[socket.id+'chat']
              
  });

  socket.on('loss', function() {
    console.log('loss')

    room = Object.keys(socket.rooms).filter(item => item!=socket.id)

    io.in(room).clients((err , clients) => {
      for (const client of clients){
        if (client.id !== socket.id){
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
  
  socket.on('disconnect', function() {
    console.log('disconnect')
    if (clients > 0)
      clients--
    
    room = Object.keys(socket.rooms).filter(item => item!=socket.id)
    socket.to(room).emit('leave', {initiator:false})

    io.in(room).clients((err , clients) => {
      for (const client of clients){
        if (client.id !== socket.id){
          io.to(client).emit('win')
          io.to(client).emit('new_message',{sender:'server',message : 'You Win! Your Opponent Smiled First!'})
        }
        else {
          io.to(client).emit('loss')
          io.to(client).emit('new_message',{sender:'server',message : 'You Lose! You Smiled First!'})
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

// port = process.env.PORT || 8080
// http.listen(port, () => console.log(`Active on port ${port}`))

hostname = 'laffy.io'
// const httpsServer = https.createServer(credentials,app);
// httpsServer.listen(443, hostname)

// const httpServer =  http.createServer(app);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);