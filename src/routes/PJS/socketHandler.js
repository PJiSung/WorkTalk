function log(socket) {
    return function () {
        let array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }
}

function handleMessage(socket, message) {
    log(socket)('Client said : ', message);
    socket.broadcast.emit('message', message);
}

function handleRoom(io, socket, room) {
    
    let clientsInRoom = io.of("/").adapter.rooms.get(room);
    let numClients = clientsInRoom ? clientsInRoom.size : 0;
    log(socket)('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
        console.log('create room!');
        socket.join(room);
        log(socket)('Client ID ' + socket.id + ' created room ' + room);
        socket.emit('created', room, socket.id);

    } else if (numClients === 1) {
        console.log('join room!');
        log(socket)('Client Id' + socket.id + 'joined room' + room);
        io.sockets.in(room).emit('join', room);
        socket.join(room);
        socket.emit('joined', room, socket.id);
        io.sockets.in(room).emit('ready');
    } else {
        socket.emit('full', room);
    }
}

function handleConnection(io, socket) {
    console.log("connect")
    socket.on('message', (message) => {
        //console.log(message);
        handleMessage(socket, message);
    });

    socket.on('create or join', (room) => {
        handleRoom(io, socket, room);
    });

    socket.on('reload video', (streamInfo, room) => {
        console.log(streamInfo)
        console.log(room)
        io.sockets.in(room).emit('reload video', streamInfo);
    });
}

module.exports = { handleConnection };
