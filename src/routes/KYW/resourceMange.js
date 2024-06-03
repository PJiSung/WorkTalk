const router = require('express').Router();
const bcrypt = require('bcrypt');

const db = require('../../database.js'); // mongoose 설정 파일 경로에 맞게 변경하세요.
const user = require('../../models/user.js'); // Employee 모델 파일 경로에 맞게 변경하세요.

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

router.post('/forLogin', async (req, res) => {
    console.log(req.body)
    const loginUser = await user.findOne({id: req.body.id, pw : req.body.pw});

    req.session.user = {
        id: loginUser.id,
    };

    res.render('KYW/applicate.ejs')
});


module.exports = router