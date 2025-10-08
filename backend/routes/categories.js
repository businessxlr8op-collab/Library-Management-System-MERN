import express from "express";
import BookCategory from "../models/BookCategory.js";

const router = express.Router();

router.get("/allcategories", async (req, res) => {
  try {
    const categories = await BookCategory.find({});
    res.status(200).json(categories);
  } catch (err) {
    return res.status(504).json(err);
  }
});

router.post("/addcategory", async (req, res) => {
  try {
  if(!req.body.isAdmin) return res.status(403).json({ message: 'Only admin can add categories' });
  const newcategory = new BookCategory({ name: req.body.name, description: req.body.description });
  const category = await newcategory.save();
  res.status(200).json(category);
  } catch (err) {
    return res.status(504).json(err);
  }
});

export default router;
