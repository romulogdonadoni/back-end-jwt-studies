import express from "express";
import mongoose from "mongoose";
import { Users } from "./models/users.js";
import jwt from "jsonwebtoken";
const SECRET = "5lBRWNHZJDIgeL1gtBLFzalN4DXl79DO";
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
mongoose
  .connect("mongodb+srv://romegd:s88Oc4G36gMIOZyQ@dbestuds.wojdxiz.mongodb.net/?retryWrites=true&w=majority")
  .then(() => {
    app.listen(3333);
    console.log("Connected!");
  })
  .catch((error) => console.log(error));

/* function authHomePage(req, res, next) {
  const token = req.headers["Authorization"];
  jwt
    .verify(token)
    .then(() => {
      console.log('ok')
      next();
    })
    .catch(() => {
      return res.status(401).end();
    });
}
app.get("/homepage", authHomePage, (req, res) => {
  return res.status(200).json({msg: "Autorizado"}).end()
}); */

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!req.body.username || !req.body.password) {
    return res.status(400).end("Insira os dados!");
  }
  const user = await Users.findOne({ username: username });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" }).end();
  }
  const checkpassword = await password === user.password;
  if (!checkpassword) {
    return res.status(400).json({ msg: "Senha inválida!" }).end();
  }
  try {
    const token = jwt.sign(
      {
        id: user._id,
      },
      SECRET
    );
    return res.status(200).json({ msg: "Usuário logado com sucesso!", token }).end();
  } catch (error) {
    res.status(500).json({ msg: "Erro ao logar" }).end();
  }
  return res.status(500).end();
});

app.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  if (!req.body.username || !req.body.password) {
    return res.status(400).end("Insira os dados!");
  }
  const userExists = await Users.findOne({ username: username });
  if (userExists) {
    return res.status(400).end("Email já cadastrado!");
  }
  try {
    await Users.create({ username, password });
    res.status(201).end("Usuário criado com sucesso!");
  } catch (error) {
    res.status(500).json({ msg: "Insira os dados" }).end();
  }
  return res.status(500).end();
});
