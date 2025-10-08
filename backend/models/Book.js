import mongoose from 'mongoose';

// Schema aligned to the collection shape used by the cluster
const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, default: '' },
    isbn: { type: String, default: '' },
    category: { type: String, default: '' }, // many existing DBs store category as string
    quantity: { type: Number, default: 1 },
    available: { type: Number, default: 1 },
    // common fields present in the Excel / Atlas documents
    slNo: { type: Number },
    isAvailable: { type: Boolean, default: true },
    grade_level: { type: String, default: '' },
    subject: { type: String, default: '' },
    description: { type: String, default: '' },
    publication_year: { type: Number, default: null },
    cover_image: { type: String, default: '/assets/images/bookcover.JPG' },
    rack_location: { type: String, default: '' },
    book_condition: { type: String, default: 'Good' },
    publication: { type: String, default: '' },
    edition: { type: String, default: '' },
    almirahNo: { type: String, default: '' },
    reckNo: { type: String, default: '' },
    addedOn: { type: Date },
    price: { type: Number, default: null },
    // legacy/backwards compatibility
    coverImage: { type: String, default: '/assets/images/bookcover.JPG' },
    bookId: { type: String, default: null },
}, { timestamps: true, collection: 'books' });

export default mongoose.model('Book', BookSchema);