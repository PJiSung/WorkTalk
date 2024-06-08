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
  },
  approve : {
    type: Boolean,
    required: true
  },
  check : {
    type: Boolean,
    required: true
  },
  appDate : {
    type: Date,
    required: true
  },
  cancel : {
    type: Boolean,
    required: true
  }
})

const holiday = mongoose.model('Holiday', holydaySchema)

module.exports = holiday;