import express from "express";
import Student from "../models/Student.js";
import bcrypt from "bcrypt";

const router = express.Router();

/* Student Registration (Admin can create students) */
router.post("/register", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password || 'changeme123', salt);

    // auto-generate student_id if not provided
    const nextId = req.body.student_id || `RMS${new Date().getFullYear()}${Math.floor(Math.random() * 9000 + 1000)}`;

    const newStudent = new Student({
      student_id: nextId,
      name: req.body.name,
      class: req.body.class,
      section: req.body.section,
      roll_number: req.body.roll_number,
      email: req.body.email,
      phone: req.body.phone,
      parent_contact: req.body.parent_contact,
      address: req.body.address,
      password: hashedPass,
      isAdmin: req.body.isAdmin || false
    });

    const student = await newStudent.save();
    res.status(200).json(student);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/* Student Login */
router.post("/signin", async (req, res) => {
  try {
    const student = await Student.findOne({ student_id: req.body.student_id }) || await Student.findOne({ email: req.body.email });
    if(!student) return res.status(404).json({ message: 'Student not found' });
    const validPass = await bcrypt.compare(req.body.password, student.password);
    if(!validPass) return res.status(400).json({ message: 'Wrong password' });
    res.status(200).json(student);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
