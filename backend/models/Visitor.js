import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  roomNo: { type: String, required: true },
  visitorName: { type: String, required: true },
  relation: { type: String, required: true },
  date: { type: String, required: true },
  inTime: { type: String, required: true },
  outTime: { type: String, default: null },
  purpose: { type: String, required: true },
  status: { type: String, default: 'Checked In' } // 'Checked In', 'Checked Out'
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;
