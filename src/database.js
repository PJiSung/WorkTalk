const mongoose = require("mongoose");
require('dotenv').config();

    mongoose
        .connect(
            process.env.DB_HOST,{
                serverSelectionTimeoutMS: 500000 // 서버 선택 타임아웃 설정 (기본값: 30000ms)
            }
        )
        .then(() => console.log("MongoDB connect"))
        .catch((err) => console.log(err));

module.exports = mongoose;
