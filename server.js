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

app.get('/a', function (req, res) {
    res.send('Welcome')
  });

queue = []

io.on('connection', function(socket) {
  socket.on('NewClient', function() {
    if (queue.length > 0){
      room = Math.floor(Math.random()*100000000)
      io.to(room).emit('CreatePeer')
      socket.join(room);
      queue[0].join(room)
      queue.shift()
    }
      clients++;
    });

  socket.on('Offer', SendOffer)
  socket.on('Answer', SendAnswer)
  socket.on('disconnect', Disconnect)
  socket.on('RandomLoss', RandomLoss)
})

function RandomLoss(){
  //TODO record the loss to the user's account if logged in 
  this.to(room).emit('RandomEndGame')
}

function Disconnect() {
  if (clients > 0)
    clients--
}

function SendOffer(offer) {
  this.to(room).emit("BackOffer", offer)
}

function SendAnswer(answer) {
  this.to(room).emit("BackAnswer", answer)
}

port = process.env.PORT || 8080
http.listen(port, () => console.log(`Active on port ${port}`))