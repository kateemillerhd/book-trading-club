const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/", bookController.getAllBooks);
router.post("/", bookController.addBook);
router.post('/:id/request', bookController.proposeTrade);
router.post('/:id/accept', bookController.acceptTrade);

module.exports = router;
