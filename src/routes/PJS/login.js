require('dotenv').config();
const router = require('express').Router()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const cookieParser = require("cookie-parser")
const crypto = require('crypto');
const Employee = require('../../models/employee');
const { takeHeapSnapshot } = require('process');

const algorithm = process.env.ALGORITHM;
const key = Buffer.from(process.env.KEY, 'base64');
const iv = Buffer.from(process.env.IV, 'base64')

//const key = crypto.randomBytes(32).toString('base64');
//const iv = crypto.randomBytes(16).toString('base64');

router.post('/login', async (req, res) => {

    const employee = await Employee.findOne({ empNo: req.body.empNo });
    if (employee != null) {

        const checkPwd = await bcrypt.compare(
            req.body.pwd,
            employee.pwd
        )

        if (checkPwd) {

            //access Token 발급
            const accessToken = jwt.sign({
                empNo: employee.empNo,
            }, process.env.ACCESS_SECRET, {
                expiresIn : "1m",
                issuer : "workTalk"
            });

            //refresh Token 발급
            const refreshToken = jwt.sign({
                empNo: employee.empNo,
            }, process.env.REFRESH_SECRET, {
                expiresIn : "24h",
                issuer : "workTalk"
            });

            res.cookie("accessToken", accessToken, {
                secure : false,
                httpOnly : true
            })

            res.cookie("refreshToken", accessToken, {
                secure : false,
                httpOnly : true
            })

            res.render('test')
        } else {
            res.render('index', {msg : "비밀번호가 일치하지 않습니다."})
        }
    } else {
        res.render('index', {msg : "사원번호가 일치하지 않습니다."});
    }
});

router.get('/enroll/:empNo?', async (req, res) => {

    const employees = await Employee.find();
    let empInfo = {};

    //주민번호 복호화
    for(let i=0; i<employees.length; i++){
        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(employees[i].regNumber, 'hex', 'utf8') + decipher.final('utf8');
        employees[i].regNumber = decrypted;

        if(employees[i].empNo == req.params.empNo){
            empInfo = employees[i];
        }
    }

    if(req.params.empNo) res.render("PJS/enroll", {employees, empInfo})
    else res.render("PJS/enroll", {employees})
})

router.post('/enroll', async (req, res) => {

    //비밀번호 암호화(단방향)
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.regNumber.split('-')[0], salt);

    //주민번호 암호화(양방향)
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(req.body.regNumber, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const employee = new Employee({
        empNo: req.body.empNo,
        pwd: hash,
        picture: req.body.picture,
        dept: req.body.dept,
        position: req.body.position,
        workType: req.body.workType,
        name: req.body.name,
        regNumber: encrypted,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        homeNumber: req.body.homeNumber,
        email: req.body.email,
        status: req.body.status,
        hireDate: req.body.hireDate,
        outDate: req.body.outDate
    })
    await employee.save();
    res.redirect("/emp/enroll");
})

router.post('/update', async (req, res) => {
    console.log("update");
})

module.exports = router