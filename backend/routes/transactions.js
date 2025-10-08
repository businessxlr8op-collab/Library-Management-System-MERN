import express from "express"
import Book from "../models/Book.js"
import BookTransaction from "../models/BookTransaction.js"
import Student from "../models/Student.js"

const router = express.Router()

// Helper to calculate fine
const calculateFine = (dueDate, returnDate) => {
    if(!returnDate) return 0;
    const diffMs = returnDate - dueDate;
    const diffDays = Math.ceil(diffMs / (1000*60*60*24));
    return diffDays > 0 ? diffDays * 2 : 0; // ₹2 per day
}

// Add transaction (issue book)
router.post("/add-transaction", async (req, res) => {
    try {
        // Expecting student_id and book_id and issued_by
        const { student_id, book_id, issued_by, role } = req.body;
        const student = await Student.findOne({ student_id });
        const book = await Book.findOne({ bookId: book_id });
        if(!student) return res.status(404).json({ message: 'Student not found' });
        if(!book) return res.status(404).json({ message: 'Book not found' });
        // Check limits
        const maxAllowed = (!role || role === 'Student') ? 3 : 5;
        const daysAllowed = (!role || role === 'Student') ? 15 : 30;
        const activeCount = student.activeTransactions ? student.activeTransactions.length : 0;
        if(activeCount >= maxAllowed) return res.status(400).json({ message: 'Borrow limit reached' });
        if(book.available <= 0) return res.status(400).json({ message: 'Book not available' });

        const issueDate = new Date();
        const dueDate = new Date(issueDate.getTime() + daysAllowed*24*60*60*1000);

        const newtransaction = new BookTransaction({
            student_id,
            book_id,
            issue_date: issueDate,
            due_date: dueDate,
            transaction_type: 'Issue',
            issued_by
        });
        const transaction = await newtransaction.save();
        // Update book and student
        book.available = Math.max(0, book.available - 1);
        await book.save();
        await Student.updateOne({ _id: student._id }, { $push: { activeTransactions: transaction._id } });
        res.status(200).json(transaction)
    }
    catch (err) {
        res.status(504).json(err)
    }
})

// Return book endpoint
router.post('/return', async (req, res) => {
    try {
        const { transaction_id, returned_to } = req.body;
        const transaction = await BookTransaction.findById(transaction_id);
        if(!transaction) return res.status(404).json({ message: 'Transaction not found' });
        if(transaction.return_date) return res.status(400).json({ message: 'Already returned' });
        transaction.return_date = new Date();
        transaction.returned_to = returned_to;
        // calculate fine
        transaction.fine_amount = calculateFine(transaction.due_date, transaction.return_date);
        transaction.transaction_type = 'Return';
        transaction.transaction_status = 'Closed';
        await transaction.save();

        // update book available
        const book = await Book.findOne({ bookId: transaction.book_id });
        if(book){ book.available = (book.available || 0) + 1; await book.save(); }

        // move transaction from active to prev for student
        const student = await Student.findOne({ student_id: transaction.student_id });
        if(student){
            await Student.updateOne({ _id: student._id }, { $pull: { activeTransactions: transaction._id } });
            await Student.updateOne({ _id: student._id }, { $push: { prevTransactions: transaction._id } });
        }

        res.status(200).json(transaction);
    }
    catch (err) {
        res.status(504).json(err)
    }
})

router.get("/all-transactions", async (req, res) => {
    try {
        const transactions = await BookTransaction.find({}).sort({ _id: -1 })
        res.status(200).json(transactions)
    }
    catch (err) {
        return res.status(504).json(err)
    }
})

router.put("/update-transaction/:id", async (req, res) => {
    try {
        if (req.body.isAdmin) {
            await BookTransaction.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Transaction details updated successfully");
        }
    }
    catch (err) {
        res.status(504).json(err)
    }
})

router.delete("/remove-transaction/:id", async (req, res) => {
    if (req.body.isAdmin) {
        try {
            const data = await BookTransaction.findByIdAndDelete(req.params.id);
            const book = await Book.findOne({ bookId: data.book_id })
            if(book) await book.updateOne({ $pull: { transactions: req.params.id } })
            res.status(200).json("Transaction deleted successfully");
        } catch (err) {
            return res.status(504).json(err);
        }
    } else {
        return res.status(403).json("You dont have permission to delete a transaction!");
    }
})

// Barcode scanning simulation endpoints
router.post('/scan', async (req, res) => {
    // Accept { type: 'book'|'student', code: '...' }
    const { type, code } = req.body;
    try{
        if(type === 'book'){
            const book = await Book.findOne({ bookId: code }) || await Book.findOne({ isbn: code });
            return res.status(200).json(book || null);
        }
        const student = await Student.findOne({ student_id: code }) || await Student.findOne({ roll_number: code });
        return res.status(200).json(student || null);
    } catch(err){
        res.status(500).json(err)
    }
})

export default router