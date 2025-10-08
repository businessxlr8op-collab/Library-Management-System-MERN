import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Student from '../models/Student.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const excelPath = process.env.IMPORT_FILE || path.resolve(process.cwd(), '../frontend/public/IX-A.xlsx');

function mapRowToStudent(row) {
  // Actual headers in IX-A.xlsx: 'admissionnumber' and 'studentname'
  const admission = String(row['admissionnumber'] || row['AdmissionNumber'] || row['AdmissionNo'] || '').trim();
  const name = row['studentname'] || row['studentName'] || row['Student Name'] || row['Name'] || '';
  const cls = '9';
  const phone = '';
  const email = admission ? `${admission}@example.com` : '';
  return { admission, name: String(name).trim(), cls: String(cls).trim(), phone: String(phone).trim(), email };
}

async function main(){
  if(!fs.existsSync(excelPath)){
    console.error('Student Excel not found at', excelPath);
    process.exit(1);
  }
  const mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL;
  if(!mongoUri){ console.error('Missing RMS_MONGODB_URI'); process.exit(1); }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo for student import');

  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  console.log('Rows found:', rows.length);

  let processed = 0;
  for(const row of rows){
    const s = mapRowToStudent(row);
    if(!s.admission || !s.name) continue;
    try{
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(s.admission, salt); // default password = admission number
      const doc = {
        student_id: s.admission,
        name: s.name,
        class: s.cls || '9',
        section: '',
        password: hashed,
        isAdmin: false,
        phone: s.phone || '',
        email: s.email || ''
      };
      await Student.updateOne({ student_id: s.admission }, { $set: doc }, { upsert: true });
      processed += 1;
      if(processed % 100 === 0) process.stdout.write(`Processed ${processed}\r`);
    }catch(e){ console.error('Failed row', s, e && e.message); }
  }

  console.log('\nImport complete. Processed:', processed);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
