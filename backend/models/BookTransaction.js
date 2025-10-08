import mongoose from 'mongoose';

const BookTransactionSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    book_id: { type: String, required: true },
    issue_date: { type: Date, required: true },
    due_date: { type: Date, required: true },
    return_date: { type: Date },
    fine_amount: { type: Number, default: 0 },
    issued_by: { type: String, default: '' },
    returned_to: { type: String, default: '' },
    transaction_type: { type: String, enum: ['Issue', 'Return', 'Renew'], required: true },
    transaction_status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model('BookTransaction', BookTransactionSchema);