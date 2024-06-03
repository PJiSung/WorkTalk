const express = require('express')
const expressApp = express()
const ejs = require('ejs');
const path = require('path')

const session = require('express-session');
expressApp.use(session({
  secret: 'your-secret-key', // 세션 암호화를 위한 키
  resave: true, // 세션을 항상 저장할 지 여부
  saveUninitialized: false // 초기화되지 않은 세션을 저장할 지 여부
}));

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());
expressApp.set('view engine', 'ejs');
expressApp.set('views', './src/view/ejs');
expressApp.use('/hRManage', require('./routes/KYW/resourceMange.js'));
expressApp.use('/emp', require('./routes/PJS/login.js'));
expressApp.use(express.static(__dirname + '/public'));

expressApp.use('/static', express.static(path.join(__dirname, 'node_modules')));

expressApp.get('/', function (req, res) {
    //res.redirect('/emp/enroll')
    res.render('index')
})

expressApp.listen(8080, function () {
    console.log('server : http://localhost:8080/');
});

require('electron-reload')([
  __dirname,
  path.join(__dirname, 'routes')
  
], {
  electron: require(path.join(__dirname, '../node_modules/electron'))
});

