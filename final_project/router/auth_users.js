const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ 
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.session.authorization?.username; // Acesso ao nome de usuário a partir da sessão

    // Verifique se o livro existe
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Verifique se a revisão está presente no corpo da solicitação
    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    // Inicialize o objeto de resenhas se não existir
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Adicione ou atualize a revisão para o ISBN fornecido
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.authorization?.username; // Acesso ao nome de usuário a partir da sessão

    // Verifique se o livro existe
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Verifique se o livro tem resenhas
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Exclua a resenha do usuário para o ISBN fornecido
    delete books[isbn].reviews[username];

    // Se não houver mais resenhas para o livro, você pode opcionalmente remover o objeto de resenhas
    if (Object.keys(books[isbn].reviews).length === 0) {
        delete books[isbn].reviews;
    }

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews || {}
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
