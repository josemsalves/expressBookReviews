const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
   // Verifique se há um token na sessão
   const token = req.session.token; // Supondo que o token JWT está armazenado na sessão

   if (!token) {
       return res.status(401).json({ message: "Não autorizado. Token não encontrado." });
   }

   // Verifique a validade do token
   jwt.verify(token, 'seu_segredo_jwt', (err, decoded) => {
       if (err) {
           return res.status(401).json({ message: "Não autorizado. Token inválido." });
       }

       // Se o token for válido, anexe os dados decodificados à solicitação
       req.user = decoded;
       next(); // Continue para o próximo middleware ou rota
   });
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
