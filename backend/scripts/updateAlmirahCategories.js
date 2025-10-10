// updateAlmirahCategories.js
// Usage: node backend/scripts/updateAlmirahCategories.js
import mongoose from 'mongoose';
import Book from '../models/Book.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/library';

const almirahCategoryMap = [
  { almirahNo: '1', category: 'FICTIONS' },
  { almirahNo: '2', category: 'ISC BOOKS' },
  { almirahNo: '3', category: 'MATHEMATICS' },
  { almirahNo: '4', category: 'SCIENCE' },
  { almirahNo: '5', category: 'ENGLISH' },
  { almirahNo: '6', category: 'HINDI LITERATURE' },
  { almirahNo: '7', category: 'HINDI LANGUAGE' },
  { almirahNo: '8', category: 'SOCIAL SCIENCE' },
  { almirahNo: '9', category: 'SPRITUAL/ PRE-PRIMARY' },
];

async function updateBooks() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  let updated = 0;
  for (const { almirahNo, category } of almirahCategoryMap) {
    // Find books that should belong to this category (by current category, or by almirahNo, or by some logic)
    // Here, we update all books with matching almirahNo OR category (case-insensitive)
    const filter = {
      $or: [
        { almirahNo: almirahNo },
        { category: new RegExp(`^${category}$`, 'i') },
      ],
    };
    const result = await Book.updateMany(filter, { almirahNo, category });
    updated += result.nModified || result.modifiedCount || 0;
    console.log(`Updated ${result.nModified || result.modifiedCount || 0} books to Almirah No: ${almirahNo}, Category: ${category}`);
  }
  await mongoose.disconnect();
  console.log(`Done. Total updated: ${updated}`);
}

updateBooks().catch(err => {
  console.error('Error updating books:', err);
  process.exit(1);
});
