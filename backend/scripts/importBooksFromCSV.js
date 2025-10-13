import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import Book from '../models/Book.js';
import csv from 'csv-parser';

dotenv.config({ path: path.resolve(process.cwd(), './.env') });

const ALMIRAH_CATEGORY_MAP = {
  '1': 'FICTIONS',
  '2': 'ISC BOOKS',
  '3': 'MATHEMATICS',
  '4': 'SCIENCE',
  '5': 'ENGLISH',
  '6': 'HINDI LITERATURE',
  '7': 'HINDI LANGUAGE',
  '8': 'SOCIAL SCIENCE',
  '9': 'SPRITUAL/ PRE-PRIMARY',
};

function getAlmirahCategory(almirahNo) {
  // Only allow valid mapping, else empty
  return ALMIRAH_CATEGORY_MAP[almirahNo] ? ALMIRAH_CATEGORY_MAP[almirahNo] : '';
}

async function main() {
  const mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.error('Missing RMS_MONGODB_URI in backend .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const csvPath = '/workspaces/Library-Management-System-MERN/frontend/public/lib.csv';
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at', csvPath);
    process.exit(1);
  }

  let inserted = 0;
  const stream = fs.createReadStream(csvPath).pipe(csv());
  for await (const row of stream) {
    const title = row['Title of the book']?.trim();
    if (!title) continue;
    const almirahNoRaw = row['Almirah no']?.trim();
    const almirahNo = ALMIRAH_CATEGORY_MAP[almirahNoRaw] ? almirahNoRaw : '';
    const category = getAlmirahCategory(almirahNoRaw);
    const doc = {
      title,
      author: row['Author ']?.trim() || '',
      subject: row['Subject']?.trim() || '',
      grade_level: row['class ']?.trim() || '',
      publication: row['Publication']?.trim() || '',
      edition: row['Edition']?.trim() || '',
      price: row['Price of the book in Rs']?.replace(/[^\d.]/g, '') || null,
      book_condition: row['Book Condition']?.trim() || '',
      almirahNo,
      reckNo: row['Reck no']?.trim() || '',
      category,
    };
    try {
      await Book.create(doc);
      inserted++;
      if (inserted % 100 === 0) process.stdout.write(`Imported ${inserted}\r`);
    } catch (e) {
      console.error('Failed to insert row:', e && e.message ? e.message : e);
    }
  }
  console.log(`\nImport complete. Total processed: ${inserted}`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
