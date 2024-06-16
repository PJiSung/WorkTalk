require('dotenv').config();
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const Employee = require('../../models/employee');
const RefreshToken = require('../../models/token');

const algorithm = process.env.ALGORITHM;
const key = Buffer.from(process.env.KEY, 'base64');
const iv = Buffer.from(process.env.IV, 'base64')

//암호화
const encrypt = (data, type) => {
    if(type == 'bcrypt'){
        //bcrypt 
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(data.split('-')[0], salt);
        return hash;
    } else {
        //crypto 
        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
}

//crypto 복호화
const decrypt = (data) => {
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}

//date 형변환
const convertDate = (data) => {
    if(!data) return '';
    return data.toISOString().split('T')[0];
}

//accessToken 발급
const makeAccessToken = async (empNo) => {
    const employee = await Employee.findOne({ empNo: empNo });
    return jwt.sign({
        empNo: employee.empNo,
        picture: employee.picture,
        dept: employee.dept,
        position: employee.position,
        name: employee.name,
    }, process.env.ACCESS_SECRET, {
        expiresIn: "10m",
        issuer: "workTalk"
    });
}

//refreshToken 발급
const makeRefreshToken = async (empNo) => {

    const employee = await Employee.findOne({ empNo: empNo });
    return jwt.sign({
        empNo: employee.empNo
    }, process.env.REFRESH_SECRET, {
        expiresIn: "24h",
        issuer: "workTalk"
    });
}


//accessToken 유효성 검사
const accessVerify = (token) => {

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET)
        return {
            ok: true,
            empNo: decoded.empNo,
            picture: decoded.picture,
            dept: decoded.dept,
            position: decoded.position,
            name: decoded.name,
        };
    } catch (err) {
        return {
            ok: false,
            message: err.message,
        }
    }
}

//refreshToken 유효성 검사
const refreshVerify = async (token, empNo) => {

    try {
        const { refreshToken } = await RefreshToken.findOne(empNo);
        if (token === refreshToken) {
            try {
                jwt.verify(token, process.env.REFRESH_SECRET);
                return true;
            } catch (err) {
                return false;
            }
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

const verify = async (req, res) => {
     
    if(req.headers.cookie !== 'undefined'){
        const token = req.headers.cookie.split(';')[0].split('=')[1];
        const refresh = req.headers.cookie.split(';')[1].split('=')[1];

        //accessToken 유효성 검증
        const authResult = accessVerify(token);

        //token 복호화 데이터
        const decoded = jwt.decode(token);

        //refreshToken 유효성 검증
        const refreshResult = await refreshVerify(refresh, decoded.empNo);

        //accessToken 유효기간이 만료되었을때
        if(authResult.ok === false && authResult.message === 'jwt expired'){
            // refreshToken 유효기간이 만료되었을때 재로그인
            if(refreshResult === false) {
                res.redirect('/emp/login')
            } else { //refreshToken으로 새로운 accessToken 생성 후 클라이언트에게 전달
                const newAccessToken = makeAccessToken({empNo: decoded.empNo})

                res.cookie("accessToken", newAccessToken, {
                    secure: false,
                    httpOnly: true
                })

                return jwt.decode(newAccessToken);
            }
        } else { //accessToken refreshToken 둘다 문제 없을때
            return decoded;
        }
    } else {
        res.redirect('/emp/login')
    }
}



module.exports = {encrypt, decrypt, convertDate, accessVerify, refreshVerify, makeAccessToken, makeRefreshToken, verify}
