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
  if (!book) return res.status(404).json({ error: "Book not found" });

  if (book.owner.equals(req.user._id)) {
    return res.status(400).json({ error: "You cannot request your own book" });
  }

  if (book.status === "pending") {
    return res.status(400).json({ error: "Book already requested" });
  }

  book.requestedBy = req.user._id;
  book.status = "pending";
  await book.save();

  res.json({ success: true, message: "Trade requested" });
}

async function acceptTrade(req, res) {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Not logged in" });

  const book = await Book.findById(req.params.id);
  if (!book || !book.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "You don't own this book" });
  }

  if (book.status !== "pending" || !book.requestedBy) {
    return res.status(400).json({ error: "No pending trade to accept" });
  }

  book.owner = book.requestedBy;
  book.requestedBy = null;
  book.status = "available";
  await book.save();

  res.json({ success: true, message: "Trade accepted" });
}


async function cancelTrade(req, res) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not logged in" });

  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ error: "Book not found" });

  const isRequester = book.requestedBy?.equals(req.user._id);
  const isOwner = book.owner.equals(req.user._id);

  if (!isRequester && !isOwner) {
    return res.status(403).json({ error: "Not authorized to cancel this trade" });
  }

  book.requestedBy = null;
  book.status = "available";
  await book.save();

  res.json({ success: true, message: "Trade cancelled" });
}

module.exports = {
  getAllBooks,
  addBook,
  proposeTrade,
  acceptTrade,
  cancelTrade
};
