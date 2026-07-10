import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Hostel from '../models/Hostel.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import Leave from '../models/Leave.js';
import Visitor from '../models/Visitor.js';
import Notice from '../models/Notice.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const generateTempPassword = () => {
  return 'temp-' + crypto.randomBytes(4).toString('hex'); // temp-a1b2c3d4
};

// ==========================================
// HOSTELS ROUTES (Write: Admin, Read: All)
// ==========================================
router.get('/hostels', requireAuth, async (req, res) => {
  try {
    const items = await Hostel.find({});
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/hostels', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = new Hostel(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/hostels/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await Hostel.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, error: 'Hostel not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/hostels/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await Hostel.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, error: 'Hostel not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ROOMS ROUTES (Write: Admin, Read: All)
// ==========================================
router.get('/rooms', requireAuth, async (req, res) => {
  try {
    const items = await Room.find({});
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/rooms', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = new Room(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/rooms/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await Room.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/rooms/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await Room.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SUBSCRIPTION PLANS ROUTES (Write: Admin, Read: All)
// ==========================================
router.get('/plans', requireAuth, async (req, res) => {
  try {
    const items = await SubscriptionPlan.find({});
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/plans', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = new SubscriptionPlan(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/plans/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await SubscriptionPlan.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/plans/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await SubscriptionPlan.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, error: 'Plan not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// FEES ROUTES (Write: Admin, Read: Filtered for student)
// ==========================================
router.get('/fees', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    const items = await Fee.find(query);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/fees', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = new Fee(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/fees/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await Fee.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, error: 'Fee record not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/fees/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await Fee.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, error: 'Fee record not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// NOTICES ROUTES (Write: Admin/Warden, Read: All)
// ==========================================
router.get('/notices', requireAuth, async (req, res) => {
  try {
    const items = await Notice.find({});
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/notices', requireAuth, requireRole('hostel-admin', 'warden'), async (req, res) => {
  try {
    const item = new Notice(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/notices/:id', requireAuth, requireRole('hostel-admin', 'warden'), async (req, res) => {
  try {
    const item = await Notice.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, error: 'Notice not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/notices/:id', requireAuth, requireRole('hostel-admin', 'warden'), async (req, res) => {
  try {
    const item = await Notice.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, error: 'Notice not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// COMPLAINTS ROUTES (Read/Write: Ownership/Role Checks)
// ==========================================
router.get('/complaints', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    const items = await Complaint.find(query);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/complaints', requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user.role === 'student') {
      payload.studentId = req.user.id;
      payload.studentName = req.user.name;
      payload.roomNo = req.user.roomNo;
      payload.status = 'Pending';
      payload.reply = null;
    }
    const item = new Complaint(payload);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /complaints/:id
router.put('/complaints/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Complaint.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found' });

    const payload = { ...req.body };

    if (req.user.role === 'student') {
      if (existing.studentId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot edit another resident\'s complaint' });
      }
      // Strip status and reply changes for tenant
      delete payload.status;
      delete payload.reply;
    }

    const item = await Complaint.findOneAndUpdate({ id: req.params.id }, payload, { new: true, runValidators: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/complaints/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Complaint.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'Complaint not found' });

    if (req.user.role === 'student' && existing.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Cannot delete another resident\'s complaint' });
    }

    await Complaint.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// LEAVES ROUTES (Read/Write: Ownership/Role Checks)
// ==========================================
router.get('/leaves', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    const items = await Leave.find(query);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/leaves', requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user.role === 'student') {
      payload.studentId = req.user.id;
      payload.studentName = req.user.name;
      payload.roomNo = req.user.roomNo;
      payload.status = 'Pending';
    }
    const item = new Leave(payload);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/leaves/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Leave.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'Leave request not found' });

    const payload = { ...req.body };

    if (req.user.role === 'student') {
      if (existing.studentId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot edit another resident\'s leave request' });
      }
      // Strip status approval for tenant
      delete payload.status;
    }

    const item = await Leave.findOneAndUpdate({ id: req.params.id }, payload, { new: true, runValidators: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/leaves/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Leave.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'Leave request not found' });

    if (req.user.role === 'student' && existing.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Cannot delete another resident\'s leave request' });
    }

    await Leave.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// VISITORS ROUTES (Read/Write: Ownership/Role Checks)
// ==========================================
router.get('/visitors', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }
    const items = await Visitor.find(query);
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/visitors', requireAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user.role === 'student') {
      payload.studentId = req.user.id;
      payload.studentName = req.user.name;
      payload.roomNo = req.user.roomNo;
    }
    const item = new Visitor(payload);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/visitors/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Visitor.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'Visitor pass not found' });

    const payload = { ...req.body };

    if (req.user.role === 'student') {
      if (existing.studentId !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot edit another resident\'s visitor pass' });
      }
      // Strip status check-out fields for tenant
      delete payload.status;
      delete payload.outTime;
    }

    const item = await Visitor.findOneAndUpdate({ id: req.params.id }, payload, { new: true, runValidators: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/visitors/:id', requireAuth, async (req, res) => {
  try {
    const existing = await Visitor.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'Visitor pass not found' });

    if (req.user.role === 'student' && existing.studentId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Cannot delete another resident\'s visitor pass' });
    }

    await Visitor.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// USER DIRECTORY ROUTES (Admin-Only and Self Profiling)
// ==========================================
router.get('/users', requireAuth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.role = 'student';
    }
    const items = await User.find(query).select('-password');
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new user account - Generates cryptographically secure temp password
router.post('/users', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const userData = { ...req.body };
    const tempPassword = generateTempPassword();

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(tempPassword, salt);
    userData.mustResetPassword = true;
    userData.status = 'Active';

    // Defaults
    userData.hostelId = userData.hostelId || 'hostel-1';
    userData.hostelName = userData.hostelName || 'Elite Residency PG';

    const item = new User(userData);
    await item.save();

    const safeUser = item.toObject();
    delete safeUser.password;

    res.status(201).json({ success: true, data: safeUser, tempPassword });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Update profile. Non-admins cannot update other accounts, change roles, or change hostelId.
router.put('/users/:id', requireAuth, async (req, res) => {
  try {
    const existing = await User.findOne({ id: req.params.id });
    if (!existing) return res.status(404).json({ success: false, error: 'User not found' });

    const userData = { ...req.body };
    
    // Explicitly prevent password updates via this endpoint
    delete userData.password;

    if (req.user.role !== 'hostel-admin') {
      if (req.params.id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot update other profiles' });
      }
      if (userData.role && userData.role !== req.user.role) {
        return res.status(403).json({ success: false, error: 'Forbidden: Cannot modify role attribute' });
      }
      
      // Strip restricted fields
      delete userData.role;
      delete userData.hostelId;
      delete userData.hostelName;
      delete userData.status;
      delete userData.mustResetPassword;
    } else {
      // Validate roles if admin is changing it
      if (userData.role && !['hostel-admin', 'warden', 'student'].includes(userData.role)) {
        return res.status(400).json({ success: false, error: 'Invalid user role specified' });
      }
    }

    const item = await User.findOneAndUpdate({ id: req.params.id }, userData, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Delete user account
router.delete('/users/:id', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const item = await User.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset user password - Generates cryptographically secure temp password
router.post('/users/:id/reset-password', requireAuth, requireRole('hostel-admin'), async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const tempPassword = generateTempPassword();
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(tempPassword, salt);
    user.mustResetPassword = true;
    await user.save();

    res.json({ success: true, tempPassword });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
