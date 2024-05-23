const express = require('express')
const expressApp = express()
const ejs = require('ejs');
const bcrypt = require('bcrypt');
const path = require('path')

expressApp.set('view engine', 'ejs');
expressApp.set('views', './src/view/ejs');
//expressApp.use('/', require('./routes/KYW/.js'));
//expressApp.use('/', require('./routes/PJS/.js'));
expressApp.use(express.static(__dirname + '/public'));

expressApp.get('/', function (req, res) {
    res.render('index.ejs')
})

expressApp.listen(8080, function () {
    console.log('test : http://localhost:8080/');
});

require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/../node_modules/electron`)
});

require('dotenv').config();