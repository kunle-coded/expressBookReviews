const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios').default;


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
      
    if (username && password) {
        if (!isValid(username)) { 
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
          return res.status(404).json({message: "User already exists!"});    
        }
      } 
    return res.status(404).json({message: "Unable to register user."});
      
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        return res.send(JSON.stringify(books));
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching book list' });
      }
  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {

    try {
        const isbn = req.params.isbn;
        for (const key in books) {
            if (books.hasOwnProperty(key)) {
            const book = books[key];
            if (book.isbn === isbn) {
                // Found the book with the matching ISBN
                return res.json(book);
            }
            }
        }
    } catch (error) {
        // Book not found
        return res.status(404).json({ error: 'Book not found' });
    }
  
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        const matchingBooks = [];

        for (const key in books) {
            if (books.hasOwnProperty(key)) {
            const book = books[key];
            if (book.author === author) {
                matchingBooks.push(book);
                
            }
            }
        }

        if (matchingBooks.length > 0) {
            return res.json(matchingBooks);
        }
    } catch (error) {
        // Book not found
        return res.status(404).json({ error: 'Book not found' });
    }

});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    
    try {
        const title = req.params.title;
        const matchingBooks = [];
  
        for (const key in books) {
        if (books.hasOwnProperty(key)) {
            const book = books[key];
            if (book.title === title) {
            matchingBooks.push(book);
            
            }
        }
        }
    
        if (matchingBooks.length > 0) {
        return res.json(matchingBooks);
        }
    } catch (error) {
        // Book not found
        return res.status(404).json({ error: 'Book not found' });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    for (const key in books) {
      if (books.hasOwnProperty(key)) {
        const book = books[key];
        if (book.isbn === isbn) {
          // Found the book with the matching ISBN
          return res.json(book.reviews);
        }
      }
    }
    
    // Book not found
    return res.status(404).json({ error: 'Book not found' });
});

module.exports.general = public_users;