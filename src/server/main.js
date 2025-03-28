import express from "express";
import ViteExpress from "vite-express";
import bodyParser from "body-parser";
import { getTexts, saveTextToDB, deleteFile } from "./db.js";
import * as mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config(); // to get environment variables

const dbHost = process.env.MONGO_URI || "mongodb://localhost:27017/yankPaste";
mongoose
  .connect(dbHost, { useNewUrlParser: true })
  .then(() => console.log(`Mongodb Connected`))
  .catch((error) => console.log(error));

const app = express(); // to get POST requests data
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/test", (req, res) => {
  res.send("Hello Vite + React from server!");
});

app.get("/saveUrlText", (req, res) => {
  try {
    saveTextToDB(req.query.text);
    res.json({ message: "Text saved in Database!" });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error saving text in Database!";
    res.json({ message: message });
  }
});

app.post("/saveText", (req, res) => {
  try {
    saveTextToDB(req.body.text);
    res.json({ message: "Text saved in DB!" });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error saving text in DB!";
    res.json({ message: message });
  }
});

app.get("/getTexts", async (req, res) => {
  try {
    const rows = await getTexts();
    res.json({ rows });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error getting text from DB!";
    res.json({ message: message });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    const { unixTime } = req.body;
    if (!unixTime) {
      res.status(400).json({ message: "Key(unixTime) is required" });
      return;
    }

    await deleteFile(unixTime);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error deleting item from DB!";
    res.json({ message });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
