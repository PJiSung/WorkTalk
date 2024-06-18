const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema({
  empNo: { type: String },
  userName: { type: String },
  content: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

const chatContentSchema = new mongoose.Schema({
  chatRoomId: { type: mongoose.Schema.Types.ObjectId, required: true },
  messages: [chatMessageSchema]
});

const ChatContent = mongoose.model('ChatContent', chatContentSchema)

module.exports = ChatContent;