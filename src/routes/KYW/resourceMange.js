const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const mongoose = require('../../database.js');
const Holiday = require('../../models/holiday.js');
const Employee = require('../../models/employee.js');
const ChatMember = require('../../models/chatMember.js');
const ChatContent = require('../../models/chatContent.js');
const detectEmp = require('./detectEmp.js');

require('dotenv').config();

router.use(detectEmp);

// Change Stream 설정
const changeStream = Employee.watch();

// 변경 사항 감지
changeStream.on('change', change => {
    router.use(detectEmp);
});

router.get('/applicate', (req, res) => {
    res.render('KYW/applicate.ejs');
});

//휴가 달력
router.get('/vCalendar', (req, res) => {
    res.render('KYW/vCalendar.ejs');
});

//휴가 관리
router.get('/vManage', (req, res) => {
    res.render('KYW/vManage.ejs');
});

//내 채팅 리스트
router.get('/myChatList', async (req, res) => {
    try {
        const cList = await ChatMember.find({ 'empNo.memberId' : "202401001" });

        let lastChat = [];

        for (const item of cList) {
            const chats = await ChatContent.findOne({ chatRoomId: item._id })
                .limit(1)
                .select('messages')
                .exec();
            
            console.log(chats);
            lastChat.push(chats);
        }

        console.log(lastChat);
        res.render('KYW/chatList.ejs', { cList: cList, lastChat: lastChat });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//휴가 신청
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

// 내 휴가 신청 기록
router.get('/myVacation/:page?', async (req, res) => {
    let page = parseInt(req.params.page) || 1;
    const hList = await Holiday.find({ empNo: "202401001" }).skip((page - 1) * 15).limit(15);
    const forPaging = Math.ceil(await Holiday.countDocuments({ empNo: "202401001" }) / 15);
    res.render('KYW/myHoliday.ejs', { hList: hList, forPaging: forPaging});
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

//채팅방 만들기
router.get('/makeChatRoom', async (req, res) => {
    try {
        // JSON 문자열 배열을 객체 배열로 파싱
        const members = req.query.member.map(str => JSON.parse(str));

        let mem = "";

        // 멤버 정보를 memberId와 title 형태로 매핑
        const empNoArray = await Promise.all(members.map(async (member) => {
            const memberId = Object.keys(member)[0];
            const title = member[memberId]; // 회원 번호에 해당하는 title

            console.log("312dsa", title);

            // Employee 모델에서 직원 정보 조회
            const employee = await Employee.findOne({ empNo: memberId });
            if (!employee) {
                throw new Error(`Employee not found for empNo: ${memberId}`);
            }

            mem += `${employee.name}님, `;

            // memberId와 title을 객체로 반환
            return { memberId: memberId, title: title };
        }));

        // 마지막 쉼표(,) 제거
        if (mem.endsWith(', ')) {
            mem = mem.slice(0, -2); // 마지막 쉼표(,)와 공백( ) 제거
        }

        console.log("mem", mem);
        console.log("empNoArray : ", empNoArray);

        // 새로운 ChatMember 인스턴스 생성
        const chatMember = new ChatMember({ empNo: empNoArray });

        console.log("chatMember", chatMember);

        // 데이터베이스에 저장
        const makeChatRoom = await chatMember.save();

        let chatContent;

        // 채팅 컨텐츠 생성 로직
        if (req.query.member.length > 2) {
            const firstAnnounce = { userName: "admin", content: "님이" + mem + "을 단체 채팅에 초대하셨습니다." };
            chatContent = new ChatContent({
                chatRoomId: makeChatRoom._id,
                messages: [firstAnnounce]
            });
        } else {
            // 다른 로직 추가 가능
        }

        const makeChatContent = await chatContent.save();

        res.render('KYW/chatInside.ejs', { chatRoomId: makeChatRoom._id });
    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/test', async (req, res) => {
    console.log(req.query.member);
    res.render('KYW/chatInside.ejs');
});


module.exports = router;
