const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
    let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ 
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 * 24});
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!isbn || !review || !username) {
    return res.status(400).json({ message: "Invalid request. Please provide ISBN, review, and ensure you are logged in." });
  }

  const book = books[isbn];
  if (book) {
    if (!book.reviews[username]) {
      // Add new review for the ISBN
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully." });
    } else {
      // Modify existing review for the ISBN
      book.reviews[username] = review;
      return res.status(200).json({ message: "Review modified successfully." });
    }
  } else {
    return res.status(404).json({ message: "Book not found.", isbn: isbn });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const bookIsbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!bookIsbn || !username) {
    return res.status(400).json({ message: "Invalid request. Please provide book ISBN and ensure you are logged in." });
  }

  // Convert the bookISBN to a number
  const id = parseInt(bookIsbn);

  if (books[id]) {
    if (books[id].reviews[username]) {
      // Delete the review for the book
      delete books[id].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully." });
    } else {
      return res.status(404).json({ message: "Review not found for the book." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;