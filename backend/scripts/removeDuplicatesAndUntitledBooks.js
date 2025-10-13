import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import Book from '../models/Book.js';

dotenv.config({ path: path.resolve(process.cwd(), './.env') });

async function main() {
  const mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.error('Missing RMS_MONGODB_URI in backend .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // Remove books with title 'Untitled'
  const untitledResult = await Book.deleteMany({ title: 'Untitled' });
  console.log(`Removed ${untitledResult.deletedCount} books with title 'Untitled'`);

  // Remove duplicate books by title and author, keeping the first occurrence
  const allBooks = await Book.find({}).lean();
  const seen = new Set();
  let duplicates = [];
  for (const book of allBooks) {
    const key = `${book.title}||${book.author}`;
    if (seen.has(key)) {
      duplicates.push(book._id);
    } else {
      seen.add(key);
    }
  }
  if (duplicates.length > 0) {
    const dupResult = await Book.deleteMany({ _id: { $in: duplicates } });
    console.log(`Removed ${dupResult.deletedCount} duplicate books`);
  } else {
    console.log('No duplicate books found');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
