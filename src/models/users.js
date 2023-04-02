import mongoose from "mongoose";
const Schema = mongoose.Schema;
export const Users = mongoose.model("users", new Schema({ username: String, password: String}));
