require('dotenv').config();
const bcrypt = require('bcrypt')
const crypto = require('crypto');

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
const convertDate = (data) =>{
    if(!data) return '';
    return data.toISOString().split('T')[0];
}

module.exports = {encrypt, decrypt, convertDate}
