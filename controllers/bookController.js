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

async function proposeTrade(req, res) {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Not logged in" });

  const book = await Book.findById(req.params.id);
  if (!book || book.owner.equals(req.user._id)) {
    return res.status(400).json({ error: "Invalid trade request" });
  }

  book.requestedBy = req.user._id;
  book.status = "pending";
  await book.save();

  res.json({ success: true, message: "Trade proposed" });
}

async function acceptTrade(req, res) {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Not logged in" });

  const book = await Book.findById(req.params.id);
  if (!book || !book.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "You don't own this book" });
  }

  book.owner = book.requestedBy;
  book.requestedBy = null;
  book.status = "available";
  await book.save();

  res.json({ success: true, message: "Trade accepted" });
}

module.exports = {
  getAllBooks,
  addBook,
  proposeTrade,
  acceptTrade,
};
