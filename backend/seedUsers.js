import './dns-setup.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { initialUsers } from './data/seedData.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Error: MONGODB_URI env variable is not set.');
  process.exit(1);
}

const seed = async () => {
  console.log('Connecting to MongoDB database to seed users...');
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected. Dropping old user accounts...');
    await User.deleteMany({});
    console.log(`Inserting ${initialUsers.length} initial users with password hashes...`);
    await User.insertMany(initialUsers);
    console.log('User seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database users:', err);
    process.exit(1);
  }
};

seed();
