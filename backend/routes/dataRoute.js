import express from 'express';
import bcrypt from 'bcryptjs';
import Hostel from '../models/Hostel.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import Leave from '../models/Leave.js';
import Visitor from '../models/Visitor.js';
import Notice from '../models/Notice.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to register standard CRUD endpoints for a model
const registerCRUD = (path, Model) => {
  // GET all
  router.get(path, requireAuth, async (req, res) => {
    try {
      const items = await Model.find({});
      res.json({ success: true, data: items });
    } catch (err) {
      console.error(`Error GET ${path}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST create
  router.post(path, requireAuth, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      console.error(`Error POST ${path}:`, err);
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // PUT update by custom string ID
  router.put(`${path}/:id`, requireAuth, async (req, res) => {
    try {
      const item = await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
      if (!item) {
        return res.status(404).json({ success: false, error: `${Model.modelName} not found` });
      }
      res.json({ success: true, data: item });
    } catch (err) {
      console.error(`Error PUT ${path}/${req.params.id}:`, err);
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // DELETE by custom string ID
  router.delete(`${path}/:id`, requireAuth, async (req, res) => {
    try {
      const item = await Model.findOneAndDelete({ id: req.params.id });
      if (!item) {
        return res.status(404).json({ success: false, error: `${Model.modelName} not found` });
      }
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
      console.error(`Error DELETE ${path}/${req.params.id}:`, err);
      res.status(500).json({ success: false, error: err.message });
    }
  });
};

// Register CRUD for standard models
registerCRUD('/hostels', Hostel);
registerCRUD('/rooms', Room);
registerCRUD('/fees', Fee);
registerCRUD('/complaints', Complaint);
registerCRUD('/leaves', Leave);
registerCRUD('/visitors', Visitor);
registerCRUD('/notices', Notice);
registerCRUD('/plans', SubscriptionPlan);

// GET /api/users - Securely get all users (excluding password)
router.get('/users', requireAuth, async (req, res) => {
  try {
    const items = await User.find({}).select('-password');
    res.json({ success: true, data: items });
  } catch (err) {
    console.error('Error GET /users:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users - Securely create a new user (hash password)
router.post('/users', requireAuth, async (req, res) => {
  try {
    const userData = { ...req.body };
    if (!userData.password) {
      userData.password = 'student123'; // Default password for admin-created users
    }
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    const item = new User(userData);
    await item.save();

    const safeUser = item.toObject();
    delete safeUser.password;

    res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    console.error('Error POST /users:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT /api/users/:id - Securely update user (hash password if changing)
router.put('/users/:id', requireAuth, async (req, res) => {
  try {
    const userData = { ...req.body };
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    const item = await User.findOneAndUpdate({ id: req.params.id }, userData, { new: true, runValidators: true }).select('-password');
    if (!item) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    console.error(`Error PUT /users/${req.params.id}:`, err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', requireAuth, async (req, res) => {
  try {
    const item = await User.findOneAndDelete({ id: req.params.id });
    if (!item) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error(`Error DELETE /users/${req.params.id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
