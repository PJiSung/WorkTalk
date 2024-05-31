const router = require('express').Router();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const Employee = require('../../models/employee')
require('dotenv').config();

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
            console.log("성공")
            res.render('test')
        } else {
            res.render('index', {msg : "비밀번호가 일치하지 않습니다."})
        }
    } else {
        res.render('index', {msg : "사원번호가 일치하지 않습니다."});
    }
});

router.get('/enroll/:empNo', async (req, res) => {
    const employees = await Employee.find();
    const empInfo = await Employee.findOne({empNo : req.params.empNo});
    res.render("PJS/enroll", {employees, empInfo})
})

router.post('/enroll', async (req, res) => {

    // 암호화(비밀번호 변경에서 사용)
    //const salt = bcrypt.genSaltSync(10);
    //const hash = bcrypt.hashSync(req.body.pwd, salt);

    const employee = new Employee({
        empNo: req.body.empNo,
        pwd: req.body.regNumber.split('-')[0],
        picture: req.body.picture,
        dept: req.body.dept,
        position: req.body.position,
        workType: req.body.workType,
        name: req.body.name,
        regNumber: req.body.regNumber,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        homeNumber: req.body.homeNumber,
        email: req.body.email,
        status: req.body.status,
        hireDate: req.body.hireDate,
        outDate: req.body.outDate
    })

    await employee.save();
    res.redirect("/enroll");

})

module.exports = router