import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import Book from '../models/Book.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

async function alignBooks() {
  await mongoose.connect(process.env.RMS_MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const books = await Book.find({});
  let updated = 0;
  for (const book of books) {
    let almirahNo = (book.almirahNo || '').toString().trim();
    let category = (book.category || book.subject || '').toString().trim();
    let found = false;
    // 1. If almirahNo matches reference, force category
    if (ALMIRAH_CATEGORY_MAP[almirahNo]) {
      category = ALMIRAH_CATEGORY_MAP[almirahNo];
      found = true;
    } else {
      // 2. Try to infer almirahNo from category text (contains)
      for (const [refNo, refCat] of Object.entries(ALMIRAH_CATEGORY_MAP)) {
        if (category.toLowerCase().includes(refCat.toLowerCase())) {
          almirahNo = refNo;
          category = refCat;
          found = true;
          break;
        }
      }
      // 3. Try to infer from category exact match
      if (!found && category) {
        for (const [refNo, refCat] of Object.entries(ALMIRAH_CATEGORY_MAP)) {
          if (category.toLowerCase() === refCat.toLowerCase()) {
            almirahNo = refNo;
            category = refCat;
            found = true;
            break;
          }
        }
      }
    }
    // 4. If not found, skip update
    if (!found) continue;
    // 5. Only update if values are different
    if (book.almirahNo !== almirahNo || book.category !== category) {
      book.almirahNo = almirahNo;
      book.category = category;
      await book.save();
      updated++;
    }
  }
  console.log(`Aligned ${updated} books to reference almirah/category mapping.`);
  await mongoose.disconnect();
}

alignBooks().catch(e => { console.error(e); process.exit(1); });
