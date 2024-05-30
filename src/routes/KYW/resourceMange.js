const router = require('express').Router();
const bcrypt = require('bcrypt');
require('dotenv').config();

router.get('/enroll', async (req, res) => {
    res.render('KYW/enrollEmp.ejs')
});

router.get('/applicate', async (req, res) => {
    res.render('KYW/applicate.ejs')
});

router.get('/vConfirm', async (req, res) => {
    res.render('KYW/vConfirm.ejs')
});

router.get('/vManage', async (req, res) => {
    res.render('KYW/vManage.ejs')
});


module.exports = router