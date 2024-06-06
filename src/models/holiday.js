const mongoose = require('mongoose')

const holydaySchema = new mongoose.Schema({
  empNo: {
    type: String,
    required: true,
  },
  dept : {
    type: String,
    required: true
  },
  position:{
    type: String,
    required: true
  },
  startDate : {
    type: Date,
    required: true
  },
  endDate : {
    type: Date,
    required: true
  },
  holidayType : {
    type: String,
    required: true
  },
  reason : {
    type: String,
    required: true
  }
})

const holiday = mongoose.model('Holiday', holydaySchema)

module.exports = holiday;