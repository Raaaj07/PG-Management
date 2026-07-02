import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  interval: { type: String, default: 'month' },
  features: { type: [String], required: true },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
export default SubscriptionPlan;
