import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  roomNo: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // 'Pending', 'Approved', 'Rejected'
  date: { type: String, required: true }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
export default Leave;
