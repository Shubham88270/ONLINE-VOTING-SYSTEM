const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

async function makeAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const result = await mongoose.connection.db
    .collection('users')
    .updateOne({ email: 'admin@vote.com' }, { $set: { isAdmin: true } });
  console.log('Updated:', result.modifiedCount, 'user -> isAdmin: true');
  process.exit(0);
}

makeAdmin().catch(console.error);
