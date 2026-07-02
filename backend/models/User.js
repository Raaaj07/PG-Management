import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // 'hostel-admin', 'warden', 'student'
  hostelId: { type: String },
  hostelName: { type: String },
  roomId: { type: String, default: null },
  roomNo: { type: String, default: 'Not Allocated' },
  avatar: { type: String },
  phone: { type: String },
  emergencyContact: { type: String },
  college: { type: String, default: 'Not Specified' },
  address: { type: String },
  gender: { type: String, default: 'Not Specified' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
