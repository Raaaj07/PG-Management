import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  roomNo: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, default: 'Medium' }, // 'Low', 'Medium', 'High'
  status: { type: String, default: 'Pending' }, // 'Pending', 'In Progress', 'Resolved'
  date: { type: String, required: true },
  reply: { type: String, default: null }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
