const router = require('express').Router();
const bcrypt = require('bcrypt');

const db = require('../../database.js');

require('dotenv').config();

router.get('/asd', (req, res) => {
    res.render('KYW/login.ejs')
});

router.get('/applicate', (req, res) => {
    res.render('KYW/applicate.ejs')
});

router.get('/vCalendar', (req, res) => {
    res.render('KYW/vCalendar.ejs')
});

router.get('/vManage', (req, res) => {
    res.render('KYW/vManage.ejs')
});

router.get('/myChatList', (req, res) => {
    res.render('KYW/chatList.ejs')
});

router.get('/newEnroll', (req, res) => {
    res.render('KYW/enroll.ejs')
});

router.post('/vRequest', (req, res) =>{
    console.log(req.body);
    console.log(123);
});


module.exports = router