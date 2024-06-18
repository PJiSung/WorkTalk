// const empSocketMap = new Map()
// function log(socket) {
//     return function () {
//         let array = ['Message from server:'];
//         array.push.apply(array, arguments);
//         socket.emit('log', array);
//     }
// }

// function handleMessage(socket, message, room) {
//     log(socket)('Client said : ', message);
//     socket.broadcast.to(room).emit('message', message);
// }

// function handleRoom(io, socket, room) {

//     let clientsInRoom = io.of("/").adapter.rooms.get(room);
//     let numClients = clientsInRoom ? clientsInRoom.size : 0;
//     log(socket)('Room ' + room + ' now has ' + numClients + ' client(s)');

//     if (numClients === 0) {
//         console.log('create room!');
//         socket.join(room);
//         log(socket)('Client ID ' + socket.id + ' created room ' + room);
//         socket.emit('created', room, socket.id);

//     } else if (numClients === 1) {
//         console.log('join room!');
//         log(socket)('Client Id ' + socket.id + 'joined room ' + room);
//         io.in(room).emit('join', room);
//         socket.join(room);
//         io.in(room).emit('joined', room, socket.id);
//         io.in(room).emit('ready');
//     } else {
//         socket.emit('full', room);
//     }
// }


// function handleConnection(io, socket) {
//     console.log("connect")

//     socket.on('message', (message, room) => {
//         handleMessage(socket, message, room);
//     });

//     socket.on('create or join', (room) => {
//         handleRoom(io, socket, room);
//     });

//     socket.on('close', (room) => {
//         io.sockets.in(room).emit('close')
//     })

//     socket.on('login', (empNo) => {
//         empSocketMap.set(empNo.toString(), socket.id)
//     })

//     socket.on('call', (data) => {
//         socket.to(empSocketMap.get(data.to)).emit('call', { from: data.from });
//     });

//     socket.on('acceptCall', (data) => {
//         socket.to(empSocketMap.get(data.to)).emit('acceptCall', { from: data.from });
//     });
// }


const empSocketMap = new Map()
const log = (socket) => {
    return function () {
        let array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }
}

const handleMessage = (io, socket, message, room) => {
    if(message.hasOwnProperty('chatRoomId')){
        io.to(message.chatRoomId).emit('message', message);
    }else{
        log(socket)('Client said : ', message);
        if(message.type === 'offer' || message.type === 'answer' || message.type === 'candidate'){
            socket.broadcast.to(room).emit('message', message);
        }else{
            socket.broadcast.to(room).emit('message', {msg: message, userId: socket.id}); 
        }
    }
}

const handleRoom = (io, socket, room) => {

    let clientsInRoom = io.of("/").adapter.rooms.get(room);
    let numClients = clientsInRoom ? clientsInRoom.size : 0;
    log(socket)('Room ' + room + ' now has ' + numClients + ' client(s)');

    if (numClients === 0) {
        console.log('create room!');
        socket.join(room);
        log(socket)('Client ID ' + socket.id + ' created room ' + room);
        socket.emit('created', room, socket.id);

    } else if (numClients !== 0) {
        console.log('join room!');
        log(socket)('Client Id ' + socket.id + 'joined room ' + room);
        io.in(room).emit('join', room, socket.id);
        socket.join(room);
        io.in(room).emit('joined', room, socket.id);
        io.in(room).emit('ready');
    }
}


const handleConnection = (io, socket) => {
    console.log("connect")

    socket.on('message', (message, room) => {
        handleMessage(socket, message, room);
    });

    socket.on('message', (message) => {
        handleMessage(io, socket, message);//io추가
    });

    socket.on('create or join', (room) => {
        handleRoom(io, socket, room);
    });

    socket.on('close', (room) => {
        io.sockets.in(room).emit('close')
    })

    socket.on('login', (empNo) => {
        empSocketMap.set(empNo.toString(), socket.id)
    })

    socket.on('call', (data) => {
        socket.to(empSocketMap.get(data.to)).emit('call', { from: data.from });
    });

    socket.on('acceptCall', (data) => {
        socket.to(empSocketMap.get(data.to)).emit('acceptCall', { from: data.from });
    });
}

module.exports = { handleConnection };
