require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const result = await mongoose.connection.db
    .collection('users')
    .updateMany({}, { $set: { isVerified: true, isApproved: true } });
  console.log('✅ All users verified + approved:', result.modifiedCount);
  process.exit(0);
});
