const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
   const username = req.body.username;
    const password = req.body.password;
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.json(Object.values(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Obtém o ISBN a partir dos parâmetros da URL
  const isbn = req.params.isbn;

  // Encontra o livro correspondente ao ISBN fornecido
  const book = Object.values(books).find(b => b.isbn === isbn);

  // Verifica se o livro foi encontrado
  if (book) {
      // Retorna os detalhes do livro encontrado
      return res.json(book);
  } else {
      // Retorna um erro 404 se o livro não for encontrado
      return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    // Filtra os livros cujo autor corresponde ao fornecido
    const booksByAuthor = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());

    // Verifica se algum livro foi encontrado
    if (booksByAuthor.length > 0) {
        // Retorna a lista de livros encontrados
        return res.json(booksByAuthor);
    } else {
        // Retorna um erro 404 se nenhum livro for encontrado
        return res.status(404).json({ message: "No books found by this author" });
    }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    // Filtra os livros cujo título corresponde ao fornecido
    const booksByTitle = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());

    // Verifica se algum livro foi encontrado
    if (booksByTitle.length > 0) {
        // Retorna a lista de livros encontrados
        return res.json(booksByTitle);
    } else {
        // Retorna um erro 404 se nenhum livro for encontrado
        return res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Obtém o ISBN a partir dos parâmetros da URL
  const isbn = req.params.isbn;

  // Verifica se o livro com o ISBN fornecido existe
  const book = books[isbn];
  
  if (book) {
      // Retorna as resenhas do livro, ou uma mensagem indicando que não há resenhas
      if (Object.keys(book.reviews).length > 0) {
          return res.json(book.reviews);
      } else {
          return res.json({ message: "No reviews for this book" });
      }
  } else {
      // Retorna um erro 404 se o livro com o ISBN fornecido não for encontrado
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
