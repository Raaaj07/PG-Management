import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('--- System & DNS Info ---');
console.log('Node version:', process.version);
console.log('Default DNS servers:', dns.getServers());

// Set DNS servers to Google and Cloudflare public DNS
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('Overridden DNS servers:', dns.getServers());
} catch (e) {
  console.error('Failed to set DNS servers:', e);
}

dns.resolveSrv('_mongodb._tcp.cluster0.igezfws.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV lookup failed:', err);
  } else {
    console.log('DNS SRV lookup succeeded:', addresses);
  }
});

const mongoUri = process.env.MONGODB_URI;
console.log('\n--- Mongoose Connection Test ---');
console.log('URI:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection failed:', err);
    process.exit(1);
  });
