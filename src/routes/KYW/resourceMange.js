const router = require('express').Router();
const bcrypt = require('bcrypt');

const mongoose = require('../../database.js');
const Holiday = require('../../models/holiday.js');
const Employee = require('../../models/employee.js');
const { ObjectId } = require('mongodb');

require('dotenv').config();

router.get('/asd', async (req, res) => {
    const empList = await getAllEmp();
    res.render('KYW/login.ejs',{empList : empList})
});

router.get('/applicate', async (req, res) => {
    const empList = await getAllEmp();
    res.render('KYW/applicate.ejs',{empList : empList})
});

router.get('/vCalendar', async (req, res) => {
    const empList = await getAllEmp();
    res.render('KYW/vCalendar.ejs',{empList : empList})
});

router.get('/vManage', async (req, res) => {
    const empList = await getAllEmp();
    res.render('KYW/vManage.ejs',{empList : empList})
});

router.get('/myChatList', async (req, res) => {
    const empList = await getAllEmp();
    res.render('KYW/chatList.ejs',{empList : empList})
});

router.get('/newEnroll', async (req, res) => {
    const empList = await getAllEmp();
    res.render('KYW/enroll.ejs',{empList : empList})
});

router.post('/vRequest', async (req, res) =>{
    try{
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
        })

        const saveHoliday = await holiday.save()
        .then(res.send({ msg : "휴가 신청에 성공했습니다."}));
    }catch(err){
        console.error(err);
        res.status(500).send(err);
    }
});

router.get('/myVacation/:page?', async (req, res) =>{
    const empList = await getAllEmp();
    console.log("qweqweqwe", empList);
    let page = parseInt(req.params.page) || 1;
    const hList = await Holiday.find({empNo : "202401001"}).skip((page - 1) * 15).limit(15);
    forPaging = Math.ceil(await Holiday.countDocuments({empNo : "202401001"}) / 15);
    res.render('KYW/myHoliday.ejs',{hList: hList, forPaging : forPaging, empList : empList})
})


router.post('/vCancel', async (req, res) =>{
    try {
        let changeCancel = [];
        const cancelList = req.body.cancelList;

        for (const item of cancelList) {
            const updateDocument = await Holiday.findByIdAndUpdate(
                item,
                { $set: { cancel: true } },
                { new: true }
            )
            changeCancel.push(updateDocument);
        }
        res.send({ changeList: changeCancel });
    } catch (err) {
        res.status(500).send(err);
    }
})

async function getAllEmp(){
    const empList = await Employee.find();
    return empList;
}

module.exports = router