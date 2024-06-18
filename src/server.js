const express = require('express')
const expressApp = express()
const ejs = require('ejs');
const path = require('path')
const cors = require('cors')
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(expressApp);
const { handleConnection } = require('./routes/PJS/socketHandler.js');

const io = socketIO(server, {
  cors: {
      origin: '*',
      methods: ['GET', 'POST'] 
  }
});

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());
expressApp.set('view engine', 'ejs');
expressApp.set('views', './src/view/ejs');
expressApp.use('/hRManage', require('./routes/KYW/resourceMange.js'));
expressApp.use('/emp', require('./routes/PJS/empManage.js'));
expressApp.use('/chat', require('./routes/PJS/chat.js'));
expressApp.use(express.static(__dirname + '/public'));
expressApp.use(cors());
expressApp.use('/static', express.static(path.join(__dirname, 'node_modules')));

expressApp.get('/', function (req, res) {
    //res.redirect('/emp/enroll')
    //res.redirect('/emp/changePwd/202405003') //888888
    //res.render('PJS/client') //화상
    res.render('PJS/test')
    //res.render('index')
})

io.on('connection', (socket) => {
  handleConnection(io, socket);
});

server.listen(8080, function () {
    console.log('server : http://localhost:8080/');
});

require('electron-reload')([
  __dirname,
  path.join(__dirname, 'routes')
], {
  electron: require(path.join(__dirname, '../node_modules/electron'))
});

