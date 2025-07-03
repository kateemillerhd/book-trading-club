const Book = require("../models/Book");

async function getAllBooks(req, res) {
  const books = await Book.find().populate("owner", "username");
  res.json(books);
}

async function addBook(req, res) {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Not logged in" });

  const book = new Book({
    title: req.body.title,
    owner: req.user._id,
  });

  await book.save();
  res.json(book);
}

module.exports = {
  getAllBooks,
  addBook,
};
