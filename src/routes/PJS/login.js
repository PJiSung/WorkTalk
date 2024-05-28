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

router.get('/enroll', async (req, res) => {
    res.render("PJS/enroll")
})

router.post('/enroll', async (req, res) => {

    // 암호화
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.pwd, salt);

    const employee = new Employee({
        empNo: req.body.empNo,
        pwd: hash
    })

    await employee.save();
    res.send(employee);

})

module.exports = router