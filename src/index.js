import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + "/client"));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'client/index.html'));
});

let players = []

io.on('connection', (socket) => {
  console.log('a user connected ==> ' + socket.id);

  const newPlayer = {
    id: socket.id,
    x: Math.random() * 255,
    y: Math.random() * 255
  };
  socket.broadcast.emit('addPlayer', newPlayer);
  socket.emit('init', players);
  players.push(newPlayer);
  
  socket.on('move', (mouse) => {
    const index = players.findIndex(x => x.id == socket.id);
    players[index].x = mouse.x;
    players[index].y = mouse.y;

    socket.broadcast.emit('players', players);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected ==> ' + socket.id);
    const index = players.findIndex(x => x.id == socket.id);
    players.splice(index, 1);
    socket.broadcast.emit('removePlayer', socket.id);
  });
});

server.listen(3000, () => {
  console.log('servidor online!')
});