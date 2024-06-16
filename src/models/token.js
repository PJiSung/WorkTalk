const mongoose = require('mongoose')

const refreshTokenSchema = new mongoose.Schema({
    empNo: {
        type: Number,
        required: true,
    },
    refreshToken: {
        type: String,
        required: true,
    }
})

const Employee = mongoose.model('RefreshToken', refreshTokenSchema)
module.exports = Employee;