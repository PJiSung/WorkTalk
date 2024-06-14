const mongoose = require('mongoose')

const empSchema = new mongoose.Schema({
    empNo: {
        type: Number,
        required: true,
    },
    pwd: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    workType: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    regNumber: {
        type: String,
        required: true
    },
    address: {
        type: String
        
    },
    phoneNumber: {
        type: String,
        required: true
    },
    homeNumber: {
        type: String,
        required: true,
        default: null
    },
    email: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "Y"
    },
    hireDate: {
        type: Date,
        required: true
    },
    outDate: {
        type: Date,
        default: null
    },
})

const Employee = mongoose.model('Employee', empSchema)
module.exports = Employee;