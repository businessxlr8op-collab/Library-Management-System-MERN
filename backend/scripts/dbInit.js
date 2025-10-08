import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';
import BookCategory from '../models/BookCategory.js';

dotenv.config();

let mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL || '';
if (!mongoUri && process.env.RMS_MONGO_USER && process.env.RMS_MONGO_PASS && process.env.RMS_MONGO_HOST) {
  const user = process.env.RMS_MONGO_USER;
  const pass = encodeURIComponent(process.env.RMS_MONGO_PASS);
  const host = process.env.RMS_MONGO_HOST;
  const db = process.env.RMS_MONGO_DB || 'rms_library';
  mongoUri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority&appName=Cluster0`;
  console.log('Mongo URI constructed from environment components (user + host)');
}
if (!mongoUri) {
  console.error('Set RMS_MONGODB_URI or RMS_MONGO_* vars in .env');
  process.exit(1);
}

const categories = [
  'Academic Books',
  'Reference Books',
  'Fiction',
  'Science',
  'Mathematics',
  'History',
  'Geography',
  'Literature',
  'Competitive Exams',
  'Magazines'
];

const connect = async () => {
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to Mongo for initialization');
};

const init = async () => {
  try {
    await connect();
    // Create categories if not exist
    for (const name of categories) {
      const exists = await BookCategory.findOne({ name });
      if (!exists) {
        await BookCategory.create({ name });
        console.log('Created category', name);
      }
    }

    // Create a sample book cover file reference (no file ops here)
    const sample = await Book.findOne({ title: 'Sample RMS Book' });
    if (!sample) {
      await Book.create({
        bookId: 'RMS-BOOK-000',
        title: 'Sample RMS Book',
        author: 'RMS Library',
        isbn: 'RMS000',
        category: null,
        quantity: 1,
        available: 1,
        grade_level: 'General',
        subject: 'General',
        coverImage: '/assets/images/bookcover.JPG'
      });
      console.log('Created sample book');
    }

    console.log('Database initialization complete');
    process.exit(0);
  } catch (err) {
    console.error('Init error', err);
    process.exit(1);
  }
};

init();
