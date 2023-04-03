import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();
import { Users } from "./models/users.js";
import jwt from "jsonwebtoken";
import cors from "cors";
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origem: "*",
  })
);
const SECRET = process.env.SECRET;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
mongoose
  .connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@dbestuds.wojdxiz.mongodb.net/?retryWrites=true&w=majority`)
  .then(() => {
    app.listen(3333);
    console.log("Connected!");
  })
  .catch((error) => console.log(error));

function auth(req, res, next) {
  const token = req.headers["authorization"].split(" ")[1];
  jwt.verify(token, SECRET, function (err, decoded) {
    if (err) {
      console.log("Falha na verificação do token");
      return res.status(401).json({ message: "Não autorizado" }).end();
    } else {
      /* console.log(decoded); */
      next();
    }
  });
}

app.get("/homepage", auth, (req, res) => {
  res.status(200).json({ message: "Autorizado" }).end();
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!req.body.username || !req.body.password) {
    return res.status(400).end("Insira os dados!");
  }
  const user = await Users.findOne({ username: username });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" }).end();
  }
  const checkpassword = (await password) === user.password;
  if (!checkpassword) {
    return res.status(400).json({ msg: "Senha inválida!" }).end();
  }
  try {
    const token = jwt.sign(
      {
        id: user._id,
      },
      "5lBRWNHZJDIgeL1gtBLFzalN4DXl79DO",
      { expiresIn: 3600 }
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
