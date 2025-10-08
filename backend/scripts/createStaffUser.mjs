import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Student from '../models/Student.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const STUDENT_ID = process.env.NEW_STAFF_ID || 'xlr8tooop';
const PASSWORD = process.env.NEW_STAFF_PW || '706155';

async function main(){
  const mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL;
  if(!mongoUri){
    console.error('No Mongo URI in backend .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo');

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(PASSWORD, salt);

  const data = {
    student_id: STUDENT_ID,
    name: 'Staff Member',
    class: 'Teacher',
    section: 'Staff',
    email: `${STUDENT_ID}@example.com`,
    password: hashed,
    isAdmin: true,
    phone: '0000000000'
  };

  const res = await Student.findOneAndUpdate({ student_id: STUDENT_ID }, { $set: data }, { upsert: true, new: true });
  console.log('Upserted student:', res.student_id, 'isAdmin:', res.isAdmin);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
