import mongoose from 'mongoose';

const hostelSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  address: { type: String, required: true },
  roomsCount: { type: Number, default: 0 },
  activeStudents: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  curfewTime: { type: String },
  lateFine: { type: String },
  guestPolicy: { type: String }
}, { timestamps: true });

const Hostel = mongoose.model('Hostel', hostelSchema);
export default Hostel;
