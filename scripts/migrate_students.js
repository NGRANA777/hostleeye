const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const students = await db.collection('students').find({}).toArray();
    console.log(`Found ${students.length} students in the "students" collection.`);
    
    for (const s of students) {
      // Check if already in users
      const exists = await db.collection('users').findOne({ 
        $or: [
          { _id: s._id },
          { name: s.name }
        ] 
      });
      
      if (!exists) {
        const newUser = {
          name: s.name,
          faceEncoding: s.embeddings, // map embeddings to faceEncoding
          role: 'student',
          createdAt: s.createdAt || new Date(),
          updatedAt: s.updatedAt || new Date()
        };
        
        // Use student ID if possible to maintain reference consistency
        if (s._id) newUser._id = s._id;

        await db.collection('users').insertOne(newUser);
        console.log(`Migrated: ${s.name}`);
      } else {
        console.log(`Skipping: ${s.name} (already exists in users collection)`);
        
        // If it exists but doesn't have faceEncoding or role student, update it
        if (exists.role !== 'student' && exists.role !== 'admin') {
           await db.collection('users').updateOne(
             { _id: exists._id },
             { $set: { role: 'student', faceEncoding: s.embeddings } }
           );
           console.log(`Updated existing user ${s.name} to student role.`);
        }
      }
    }
    
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
