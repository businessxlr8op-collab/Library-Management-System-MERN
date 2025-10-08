import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import Book from '../models/Book.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// allow override of the path to the Excel file via IMPORT_FILE env var
const excelPath = process.env.IMPORT_FILE || path.resolve(process.cwd(), '../frontend/public/library books( 4618)_095733.xlsx');

function mapRowToBook(row) {
  // Map common column names. If your sheet uses different headers, adjust these keys.
  return {
    title: row['Title'] || row['Book Title'] || row['title'] || row['Book Name'] || 'Untitled',
    author: row['Author'] || row['Authors'] || 'Unknown',
    isbn: row['ISBN'] || row['Isbn'] || '',
    category: row['Category'] || row['Subject'] || '',
    quantity: Number(row['Quantity'] || row['quantity'] || row['Qty'] || 1) || 1,
    available: Number(row['Available'] || row['available'] || row['available_count'] || 1) || 1,
    slNo: Number(row['slNo'] || row['SL No'] || row['S.No'] || row['Sr No'] || '') || undefined,
  isAvailable: (typeof row['isAvailable'] !== 'undefined') ? Boolean(row['isAvailable']) : (typeof row['isAvailable'] === 'string' ? row['isAvailable'].toLowerCase() === 'true' : undefined),
    grade_level: row['Class'] || row['Grade'] || row['class'] || '',
    subject: row['Subject'] || '',
    description: row['Description'] || '',
    publication_year: Number(row['Publication Year'] || row['Year'] || '') || null,
    publication: row['Publication'] || row['Publisher'] || '',
    edition: row['Edition'] || '',
    almirahNo: row['Almirah No'] || row['AlmirahNo'] || row['almirahNo'] || '',
    reckNo: row['Rack No'] || row['reckNo'] || row['RackNo'] || '',
  addedOn: row['Added On'] ? new Date(row['Added On']) : (row['addedOn'] ? new Date(row['addedOn']) : undefined),
    price: row['Price'] ? Number(row['Price']) : null,
    book_condition: row['Condition'] || row['Book Condition'] || '',
  };
}

async function main() {
  if (!fs.existsSync(excelPath)) {
    console.error('Excel file not found at', excelPath);
    process.exit(1);
  }

  // connect to mongo using backend .env
  const mongoUri = process.env.RMS_MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.error('Missing RMS_MONGODB_URI in backend .env');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for import');

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  console.log('Rows to import:', rows.length);
  let inserted = 0;
  for (const row of rows) {
    const doc = mapRowToBook(row);
    try {
      // Prefer upsert by ISBN when available; otherwise fallback to title+slNo
      const query = {};
      if (row['ISBN'] || row['Isbn'] || row['isbn']) {
        query.isbn = String(row['ISBN'] || row['Isbn'] || row['isbn']).trim();
      } else {
        if (doc.slNo) query.slNo = doc.slNo;
        if (doc.title) query.title = doc.title;
      }
      await Book.updateOne(query, { $set: doc }, { upsert: true });
      inserted += 1;
      if (inserted % 100 === 0) process.stdout.write(`Imported ${inserted}\r`);
    } catch (e) {
      console.error('Failed to insert row:', e && e.message ? e.message : e);
    }
  }

  console.log('\nImport complete. Total processed:', rows.length);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
