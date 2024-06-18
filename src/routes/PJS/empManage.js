require('dotenv').config();
const router = require('express').Router()
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const Employee = require('../../models/employee');
const RefreshToken = require('../../models/token');
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const io = require('socket.io-client')
const { encrypt, decrypt, convertDate, makeRefreshToken, makeAccessToken, verify} = require('./functions');

const upload = multer({
    storage: multer.diskStorage({
        filename(req, file, done) {
            done(null, req.body.empNo + path.extname(file.originalname))
        },
        destination(req, file, done) {
            done(null, path.join(__dirname, '..', '..', "public/upload"))
        },
    })
})

router.post('/login', async (req, res) => {
    const employee = await Employee.findOne({ empNo: req.body.empNo });
    if (employee != null) {
        
        const checkPwd = await bcrypt.compare(
            req.body.pwd,
            employee.pwd
        )

        if (checkPwd) {

            //access Token 발급
            const accessToken = await makeAccessToken(employee.empNo);
            //refresh Token 발급
            const refreshToken = await makeRefreshToken(employee.empNo);

            if(refreshToken){
                await RefreshToken.findOneAndUpdate(
                    {empNo: employee.empNo}, {refreshToken: refreshToken}, {upsert: true}
                )
            }

            res.cookie("accessToken", accessToken, {
                secure: false,
                httpOnly: true
            })

            res.cookie("refreshToken", refreshToken, {
                secure: false,
                httpOnly: true
            })

            if(req.body.pwd == decrypt(employee.regNumber).split('-')[0]){
                res.redirect('/emp/changePwd/' + req.body.empNo)
            } else {
                //메인으로 이동
                //res.render('KYW/vCalendar.ejs')
                res.redirect('/emp/enroll')
            }
        } else {
            res.render('index', { msg: "비밀번호가 일치하지 않습니다." })
        }
    } else {
        res.render('index', { msg: "사원번호가 일치하지 않습니다." });
    }
});

router.get('/enroll/:empNo?', async (req, res) => {

    const myInfo = await verify(req, res);
    let { column, value } = req.query;
    let employees = {};
    let empInfo = {};
    let date = {};
    if (typeof column != 'undefined') {
        if (column == 'empNo') value = parseInt(value);
        employees = await Employee.find({ [column]: { $regex: value }, status: 'Y' });
    }
    else employees = await Employee.find({ status: 'Y' });


    //주민번호 복호화
    for (let i = 0; i < employees.length; i++) {
        employees[i].regNumber = decrypt(employees[i].regNumber).substring(0, 8) + '******';
        if (employees[i].empNo == req.params.empNo) {
            empInfo = employees[i];
            date.hireDate = convertDate(employees[i].hireDate);
            date.outDate = convertDate(employees[i].outDate);
        }
    }

    // if (req.params.empNo) res.render("PJS/empManage", { employees, empInfo, date })
    // else res.render("PJS/empManage", { employees })
    if (req.params.empNo) res.render("PJS/callTest", { employees, empInfo, date })
    else res.render("PJS/callTest", { employees, empNo: myInfo.empNo })
})

router.post('/enroll', upload.single('picture'), async (req, res) => {

    const { empNo, dept, position, workType, name, address, phoneNumber, homeNumber, email, status, hireDate, outDate } = req.body;

    const employee = new Employee({
        empNo,
        pwd: encrypt(req.body.regNumber.split('-')[0], 'bcrypt'),
        picture: empNo + path.extname(req.file.originalname),
        dept, position, workType, name,
        regNumber: encrypt(req.body.regNumber, 'crypto'),
        address, phoneNumber, homeNumber, email, status, hireDate, outDate
    })

    await employee.save();
    res.redirect("/emp/enroll");
})

router.post('/update', upload.single('picture'), async (req, res) => {

    const updateEmpInfo = req.body;
    const existingEmpInfo = await Employee.findOne({ empNo: req.body.empNo });
    let updateColumn = {};

    const empInfoKeys = Object.keys(updateEmpInfo);
    if (convertDate(existingEmpInfo.hireDate) == updateEmpInfo.hireDate) {
        empInfoKeys.splice(empInfoKeys.indexOf('hireDate'), 1);
    }
    if ((existingEmpInfo.outDate != null && updateEmpInfo.outDate == '') || convertDate(existingEmpInfo.outDate) == updateEmpInfo.outDate) {
        empInfoKeys.splice(empInfoKeys.indexOf('outDate'), 1);
    }
    if (!updateEmpInfo.regNumber.includes('*')) {
        updateColumn.regNumber = encrypt(updateEmpInfo.regNumber, 'crypto');
    }
    empInfoKeys.splice(empInfoKeys.indexOf('regNumber'), 1);
    empInfoKeys.splice(empInfoKeys.indexOf('empNo'), 1);
    empInfoKeys.splice(empInfoKeys.indexOf('picture'), 1);

    if (req.file != null && req.file.filename != existingEmpInfo.picture) {
        fs.unlinkSync(__dirname + "../../../public/upload/" + existingEmpInfo.picture);
        updateColumn.picture = req.file.filename;
    }

    for (let i = 0; i < empInfoKeys.length; i++) {
        const key = empInfoKeys[i];
        if (updateEmpInfo[key] != existingEmpInfo[key]) {
            updateColumn[key] = updateEmpInfo[key]
        }
    }

    if (updateColumn != null) {
        const updateResult = await Employee.findOneAndUpdate(
            { empNo: req.body.empNo },
            { $set: updateColumn },
            { new: true },
        )
        if (updateResult) res.redirect("/emp/enroll/" + req.body.empNo);
        else res.status(404).send("update fail")
    }
})

router.get('/deleteEmp/:empNo', async (req, res) => {

    const deleteResult = await Employee.findOneAndUpdate(
        { empNo: req.params.empNo },
        { $set: { status: 'N' } },
        { new: true },
    )
    if (deleteResult) res.redirect("/emp/enroll/");
    else res.status(404).send("delete fail")
})

router.get('/changePwd/:empNo', async (req, res) => {
    const { empNo } = req.params
    res.render('PJS/changePwd', { empNo })
})

router.post('/changePwd', async (req, res) => {

    const { empNo, pwd, newPwd } = req.body;
    const empInfo = await Employee.findOne({ empNo: empNo }, 'pwd')
    let msg = "";

    const checkPwd = await bcrypt.compare(
        pwd,
        empInfo.pwd
    )

    if (checkPwd){
        await Employee.findOneAndUpdate(
            { empNo: empNo },
            { $set: { pwd: encrypt(newPwd, 'bcrypt') }}
        )
        const checkNewPwd = await bcrypt.compare(
            newPwd,
            empInfo.pwd
        )
        if(checkNewPwd) {
            msg = "기존 비밀번호와 동일하게 설정할 수 없습니다."
            res.render('PJS/changePwd', { empNo, msg })
        }
        else res.render("index")
    } else {
        msg = "현재 비밀번호가 일치하지 않습니다."
        res.render('PJS/changePwd', { empNo, msg })
    }
})

router.post('/verify', verify)

module.exports = router