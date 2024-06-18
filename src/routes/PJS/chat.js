require('dotenv').config();
const router = require('express').Router()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const Employee = require('../../models/employee');

router.get('/test', async (req, res) => {
    res.render('PJS/test')
});

router.get('/oneOnOne/:room', async (req, res) => {
    const { room } = req.params
    //res.render('PJS/client', {room})
    res.render('PJS/groupClient', {room})
});

module.exports = router