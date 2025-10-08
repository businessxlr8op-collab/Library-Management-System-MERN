import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  student_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  class: { type: String, required: true }, // e.g., 6,7,8... or 'Teacher'
  section: { type: String, default: '' },
  roll_number: { type: String, default: '' },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String, default: '' },
  parent_contact: { type: String, default: '' },
  address: { type: String, default: '' },
  photo: { type: String, default: '/assets/images/student_placeholder.png' },
  date_of_joining: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  activeTransactions: [{ type: mongoose.Types.ObjectId, ref: 'BookTransaction' }],
  prevTransactions: [{ type: mongoose.Types.ObjectId, ref: 'BookTransaction' }]
}, { timestamps: true });

export default mongoose.model('Student', StudentSchema);
