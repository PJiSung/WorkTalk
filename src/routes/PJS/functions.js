require('dotenv').config();
const bcrypt = require('bcrypt')
const crypto = require('crypto');

const algorithm = process.env.ALGORITHM;
const key = Buffer.from(process.env.KEY, 'base64');
const iv = Buffer.from(process.env.IV, 'base64')

const encrypt = (data, type) => {
    if(type == 'bcrypt'){
        //bcrypt 암호화
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(data.split('-')[0], salt);
        return hash;
    } else {
        //crypto 암호화
        let cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
}

const decrypt = (data) => {
    //crypto 복호화
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
}

const convertDate = (data) =>{
    //date 형변환
    if(!data) return '';
    return data.toISOString().split('T')[0];
}

module.exports = {encrypt, decrypt, convertDate}
