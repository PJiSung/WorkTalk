require('dotenv').config();
const router = require('express').Router()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const Employee = require('../../models/employee');
const {encrypt, decrypt, convertDate} = require('./functions')

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
    let date = {};
    
    //주민번호 복호화
    for(let i=0; i<employees.length; i++){
        employees[i].regNumber = decrypt(employees[i].regNumber).substring(0, 8) + '******';

        if(employees[i].empNo == req.params.empNo){
            empInfo = employees[i];
            date.hireDate = convertDate(employees[i].hireDate);
            date.outDate = convertDate(employees[i].outDate);
        }
    }

    if(req.params.empNo) res.render("PJS/enroll", {employees, empInfo, date})
    else res.render("PJS/enroll", {employees})

})

router.post('/enroll', async (req, res) => {

    const { empNo, picture, dept, position, workType, name, address, phoneNumber, homeNumber, email, status, hireDate, outDate } = req.body;

    const employee = new Employee({
        empNo,
        pwd: encrypt(req.body.regNumber.split('-')[0], 'bcrypt'),
        picture,
        dept,
        position,
        workType,
        name,
        regNumber: encrypt(req.body.regNumber, 'crypto'),
        address,
        phoneNumber,
        homeNumber,
        email,
        status,
        hireDate,
        outDate
    })
    const saveResult = await employee.save();
    console.log(saveResult)
    res.redirect("/emp/enroll");
})

router.post('/update', async (req, res) => {

    const updateEmpInfo = req.body;
    const existingEmpInfo = await Employee.findOne({empNo : req.body.empNo});
    let updateColumn = {};

    const empInfoKeys = Object.keys(updateEmpInfo);
    if(convertDate(existingEmpInfo.hireDate) == updateEmpInfo.hireDate){
        empInfoKeys.splice(empInfoKeys.indexOf('hireDate'), 1);
    }
    if((existingEmpInfo.outDate != null && updateEmpInfo.outDate == '') || convertDate(existingEmpInfo.outDate) == updateEmpInfo.outDate){
        empInfoKeys.splice(empInfoKeys.indexOf('outDate'), 1);
    }
    if(updateEmpInfo.regNumber.includes('*')){
        empInfoKeys.splice(empInfoKeys.indexOf('regNumber'), 1);
    }else{
        updateEmpInfo.regNumber = encrypt(updateEmpInfo.regNumber, 'crypto');
    }
    empInfoKeys.splice(empInfoKeys.indexOf('empNo'), 1);

    for(let i=0; i<empInfoKeys.length; i++){
        const key = empInfoKeys[i];
        if(updateEmpInfo[key] != existingEmpInfo[key]) updateColumn[key] = updateEmpInfo[key]
    }
    
    if(updateColumn != null){
        const updateResult = await Employee.findOneAndUpdate(
            {empNo : req.body.empNo},
            {$set : updateColumn},
            {new : true},
        )
        if(updateResult) res.redirect("/emp/enroll/" + req.body.empNo);
        else res.status(404).send("update fail")
    }
})

module.exports = router