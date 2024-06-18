const mongoose = require('mongoose')

const chatMemberTitle = new mongoose.Schema({
  memberId : {type : String, required: true},
  title : {type : String}
})

const chatMemberSchema = new mongoose.Schema({
  empNo: [chatMemberTitle]
})

const ChatMember = mongoose.model('ChatMember', chatMemberSchema)

module.exports = ChatMember;