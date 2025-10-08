import mongoose from 'mongoose';

const BookCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    books: [{ type: mongoose.Types.ObjectId, ref: 'Book' }]
}, { timestamps: true });

export default mongoose.model('BookCategory', BookCategorySchema);