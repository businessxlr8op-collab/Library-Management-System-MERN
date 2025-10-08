import express from "express";
import Student from "../models/Student.js";
import bcrypt from 'bcrypt';

const router = express.Router()

/* Getting user by id */
router.get("/getstudent/:id", async (req, res) => {
    try {
    const student = await Student.findById(req.params.id).populate("activeTransactions").populate("prevTransactions")
    if(!student) return res.status(404).json({ message: 'Student not found' });
    const { password, updatedAt, ...other } = student._doc;
    res.status(200).json(other);
    } 
    catch (err) {
        return res.status(500).json(err);
    }
})

/* Getting all members in the library */
router.get("/allstudents", async (req,res)=>{
    try{
        const students = await Student.find({}).populate("activeTransactions").populate("prevTransactions").sort({_id:-1})
        res.status(200).json(students)
    }
    catch(err){
        return res.status(500).json(err);
    }
})

/* Update user by id */
router.put("/updatestudent/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            await Student.findByIdAndUpdate(req.params.id, { $set: req.body });
            res.status(200).json("Student account has been updated");
        } catch (err) {
            return res.status(500).json(err);
        }
    }
    else {
        return res.status(403).json("You can update only your account!");
    }
})

/* Adding transaction to active transactions list */
router.put("/:id/move-to-activetransactions" , async (req,res)=>{
    if(req.body.isAdmin){
        try{
            const student = await Student.findById(req.body.userId);
            await student.updateOne({$push:{activeTransactions:req.params.id}})
            res.status(200).json("Added to Active Transaction")
        }
        catch(err){
            res.status(500).json(err)
        }
    }
    else{
        res.status(403).json("Only Admin can add a transaction")
    }
})

/* Adding transaction to previous transactions list and removing from active transactions list */
router.put("/:id/move-to-prevtransactions", async (req,res)=>{
    if(req.body.isAdmin){
        try{
            const student = await Student.findById(req.body.userId);
            await student.updateOne({$pull:{activeTransactions:req.params.id}})
            await student.updateOne({$push:{prevTransactions:req.params.id}})
            res.status(200).json("Added to Prev transaction Transaction")
        }
        catch(err){
            res.status(500).json(err)
        }
    }
    else{
        res.status(403).json("Only Admin can do this")
    }
})

/* Delete user by id */
router.delete("/deletestudent/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await Student.findByIdAndDelete(req.params.id);
            res.status(200).json("Student account has been deleted");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account!");
    }
})

export default router