import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  createdBy: { type: String, required: true }, // 'Hostel Admin', 'Warden'
  target: { type: String, default: 'All' } // 'All', 'Students', 'Staff'
}, { timestamps: true });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
