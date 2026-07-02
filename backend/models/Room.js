import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNo: { type: String, required: true },
  type: { type: String, required: true },
  floor: { type: String, required: true },
  ac: { type: Boolean, default: false },
  rent: { type: Number, required: true },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  hostelId: { type: String, required: true }
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
