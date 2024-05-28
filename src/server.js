const express = require('express')
const expressApp = express()
const ejs = require('ejs');
const path = require('path')

expressApp.use(express.urlencoded({ extended: true }));
expressApp.use(express.json());
expressApp.set('view engine', 'ejs');
expressApp.set('views', './src/view/ejs');
//expressApp.use('/', require('./routes/KYW/.js'));
expressApp.use('/emp', require('./routes/PJS/login.js'));
expressApp.use(express.static(__dirname + '/public'));

expressApp.get('/', function (req, res) {
    res.render('index', {msg : req.query.msg})
})

expressApp.listen(8080, function () {
    console.log('server : http://localhost:8080/');
});

require('electron-reload')([
  __dirname,
  path.join(__dirname, 'routes')
  
], {
  electron: require(path.join(__dirname, '../node_modules/electron')),
  awaitWriteFinish: true
});

