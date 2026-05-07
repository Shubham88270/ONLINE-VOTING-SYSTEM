const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/.env' });

async function createAdmin() {
  // Use MONGO_URI from .env or pass directly
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');

  const db = mongoose.connection.db;

  // Check if admin already exists
  const existing = await db.collection('users').findOne({ email: 'admin@vote.com' });
  if (existing) {
    // Just make sure isAdmin is true
    await db.collection('users').updateOne(
      { email: 'admin@vote.com' },
      { $set: { isAdmin: true, isVerified: true, isApproved: true } }
    );
    console.log('✅ Existing user updated to admin!');
    process.exit(0);
  }

  // Create new admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  await db.collection('users').insertOne({
    name:       'Admin',
    email:      'admin@vote.com',
    password:   hashedPassword,
    isAdmin:    true,
    isVerified: true,
    isApproved: true,
    voterId:    'VOTER-00001',
    photo:      '',
    branch:     '',
    college:    '',
    university: '',
    rollNo:     '',
    phone:      '',
    votedElections: [],
    createdAt:  new Date(),
    updatedAt:  new Date(),
  });

  console.log('✅ Admin created successfully!');
  console.log('📧 Email:    admin@vote.com');
  console.log('🔑 Password: Admin@123');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
