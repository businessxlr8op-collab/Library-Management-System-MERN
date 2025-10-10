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

// Keywords for fuzzy matching
const CATEGORY_KEYWORDS = {
  '1': ['fiction', 'novel', 'story', 'tale', 'fable'],
  '2': ['isc', 'intermediate', 'senior secondary'],
  '3': ['mathematics', 'math', 'algebra', 'geometry', 'arithmetic'],
  '4': ['science', 'physics', 'chemistry', 'biology'],
  '5': ['english', 'grammar', 'literature', 'language'],
  '6': ['hindi literature', 'hindi sahitya', 'hindi lit'],
  '7': ['hindi language', 'hindi', 'bhasha'],
  '8': ['social science', 'history', 'civics', 'geography', 'political science', 'social studies'],
  '9': ['spiritual', 'pre-primary', 'moral', 'value education', 'religion', 'ethics'],
};

function fuzzyMatchCategory(title, subject, description) {
  const text = `${title} ${subject} ${description}`.toLowerCase();
  for (const [almirahNo, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (text.includes(kw)) {
        return almirahNo;
      }
    }
  }
  return null;
}

async function alignBooksFuzzy() {
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
      // 4. Fuzzy match using title, subject, description
      if (!found) {
        const fuzzyNo = fuzzyMatchCategory(book.title || '', book.subject || '', book.description || '');
        if (fuzzyNo && ALMIRAH_CATEGORY_MAP[fuzzyNo]) {
          almirahNo = fuzzyNo;
          category = ALMIRAH_CATEGORY_MAP[fuzzyNo];
          found = true;
        }
      }
    }
    // 5. If not found, skip update
    if (!found) continue;
    // 6. Only update if values are different
    if (book.almirahNo !== almirahNo || book.category !== category) {
      book.almirahNo = almirahNo;
      book.category = category;
      await book.save();
      updated++;
    }
  }
  console.log(`Fuzzy aligned ${updated} books to reference almirah/category mapping.`);
  await mongoose.disconnect();
}

alignBooksFuzzy().catch(e => { console.error(e); process.exit(1); });
