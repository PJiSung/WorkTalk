const mongoose = require('mongoose')

const empSchema = new mongoose.Schema({
    empNo:{
        type : Number,
        required : true,
        
    },
    pwd:{
        type : String,
        required : true
    }
})

const Employee = mongoose.model('Employee', empSchema)
module.exports = Employee;