const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usn: { type: String, required: true, unique: true },
  phone: { type: String, required: true }, // Kept private, not sent in standard API responses
  password: { type: String, required: true },
  profileImage: { type: String, default: '' }
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
  description: { type: String, required: true },
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' }
}, { timestamps: true });

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Post: mongoose.model('Post', PostSchema),
  Message: mongoose.model('Message', MessageSchema)
};