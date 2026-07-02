import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  status: { type: String, required: true }, // 'Paid', 'Unpaid', 'Pending Review'
  date: { type: String, default: null },
  invoiceNo: { type: String, required: true }
}, { timestamps: true });

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
