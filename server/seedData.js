const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // Get admin user id
  const admin = await db.collection('users').findOne({ email: 'admin@vote.com' });

  // Create election
  const electionResult = await db.collection('elections').insertOne({
    title: 'Best Programming Language 2026',
    description: 'Vote for your favourite programming language!',
    isActive: true,
    candidates: [],
    createdBy: admin._id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const electionId = electionResult.insertedId;

  // Create candidates
  const candidates = await db.collection('candidates').insertMany([
    { name: 'JavaScript', description: 'The language of the web', votes: 0, election: electionId },
    { name: 'Python', description: 'Simple and powerful', votes: 0, election: electionId },
    { name: 'Java', description: 'Write once, run anywhere', votes: 0, election: electionId },
    { name: 'TypeScript', description: 'JavaScript with superpowers', votes: 0, election: electionId },
  ]);

  // Link candidates to election
  const candidateIds = Object.values(candidates.insertedIds);
  await db.collection('elections').updateOne(
    { _id: electionId },
    { $set: { candidates: candidateIds } }
  );

  console.log('✅ Sample election created with 4 candidates!');
  process.exit(0);
}

seed().catch(console.error);
