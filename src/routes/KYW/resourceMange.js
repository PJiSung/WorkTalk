const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const mongoose = require('../../database.js');
const Holiday = require('../../models/holiday.js');
const Employee = require('../../models/employee.js');
const { ObjectId } = require('mongodb');

require('dotenv').config();

// Employee 리스트를 가져오는 미들웨어 함수
const fetchEmpList = async (req, res, next) => {
    try {
        const empList = await Employee.find();
        req.empList = empList; // empList를 req 객체에 저장
        next(); // 다음 미들웨어 함수 또는 라우트로 이동
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch employee list');
    }
};

// 모든 라우트에서 미들웨어 사용
router.use(fetchEmpList);

router.get('/asd', (req, res) => {
    res.render('KYW/login.ejs', { empList: req.empList });
});

router.get('/applicate', (req, res) => {
    res.render('KYW/applicate.ejs', { empList: req.empList });
});

router.get('/vCalendar', (req, res) => {
    res.render('KYW/vCalendar.ejs', { empList: req.empList });
});

router.get('/vManage', (req, res) => {
    res.render('KYW/vManage.ejs', { empList: req.empList });
});

router.get('/myChatList', (req, res) => {
    res.render('KYW/chatList.ejs', { empList: req.empList });
});

router.get('/newEnroll', (req, res) => {
    res.render('KYW/enroll.ejs', { empList: req.empList });
});

router.post('/vRequest', async (req, res) => {
    try {
        const holiday = new Holiday({
            empNo: "202401001",
            dept: "어딘가",
            position: "모르겠다",
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            holidayType: req.body.kind,
            reason: req.body.reason,
            approve: false,
            check: false,
            appDate: new Date(),
            cancel: false
        });

        const saveHoliday = await holiday.save();
        res.send({ msg: "휴가 신청에 성공했습니다." });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/myVacation/:page?', async (req, res) => {
    let page = parseInt(req.params.page) || 1;
    const hList = await Holiday.find({ empNo: "202401001" }).skip((page - 1) * 15).limit(15);
    const forPaging = Math.ceil(await Holiday.countDocuments({ empNo: "202401001" }) / 15);
    res.render('KYW/myHoliday.ejs', { hList: hList, forPaging: forPaging, empList: req.empList });
});

router.post('/vCancel', async (req, res) => {
    try {
        let changeCancel = [];
        const cancelList = req.body.cancelList;

        for (const item of cancelList) {
            const updateDocument = await Holiday.findByIdAndUpdate(
                item,
                { $set: { cancel: true } },
                { new: true }
            );
            changeCancel.push(updateDocument);
        }
        res.send({ changeList: changeCancel });
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
