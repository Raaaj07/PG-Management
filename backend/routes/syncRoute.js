import express from 'express';
import Hostel from '../models/Hostel.js';
import Room from '../models/Room.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import Leave from '../models/Leave.js';
import Visitor from '../models/Visitor.js';
import Notice from '../models/Notice.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

import {
  initialHostels,
  initialRooms,
  initialFees,
  initialComplaints,
  initialLeaves,
  initialVisitors,
  initialNotices,
  initialSubscriptionPlans
} from '../data/seedData.js';

const router = express.Router();

const modelMap = {
  hostels: Hostel,
  rooms: Room,
  fees: Fee,
  complaints: Complaint,
  leaves: Leave,
  visitors: Visitor,
  notices: Notice,
  plans: SubscriptionPlan
};

const initialDataMap = {
  hostels: initialHostels,
  rooms: initialRooms,
  fees: initialFees,
  complaints: initialComplaints,
  leaves: initialLeaves,
  visitors: initialVisitors,
  notices: initialNotices,
  plans: initialSubscriptionPlans
};

// GET /api/sync - Retrieve all collections, seed if empty
router.get('/', async (req, res) => {
  try {
    const payload = {};
    for (const [key, Model] of Object.entries(modelMap)) {
      let data = await Model.find({});
      if (data.length === 0 && initialDataMap[key]) {
        console.log(`Seeding collection: ${key}...`);
        await Model.insertMany(initialDataMap[key]);
        data = await Model.find({});
      }
      payload[key] = data;
    }
    res.json({ success: true, data: payload });
  } catch (error) {
    console.error('Error during database synchronization:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/sync/:collection - Overwrite collection with updated front-end state
router.post('/:collection', async (req, res) => {
  const { collection } = req.params;
  const { data } = req.body;

  const Model = modelMap[collection];
  if (!Model) {
    return res.status(400).json({ success: false, error: `Collection ${collection} not found.` });
  }

  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, error: 'Data payload must be an array.' });
  }

  try {
    // Overwrite database documents
    await Model.deleteMany({});
    if (data.length > 0) {
      // Map data properties to strip standard MongoDB fields if they are sent back with _id, __v
      const cleanedData = data.map(item => {
        const cleaned = { ...item };
        delete cleaned._id;
        delete cleaned.__v;
        delete cleaned.createdAt;
        delete cleaned.updatedAt;
        return cleaned;
      });
      await Model.insertMany(cleanedData);
    }
    res.json({ success: true, message: `Collection ${collection} synchronized successfully.` });
  } catch (error) {
    console.error(`Error synchronizing collection ${collection}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
