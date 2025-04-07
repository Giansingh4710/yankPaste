import express from "express";
import ViteExpress from "vite-express";
import bodyParser from "body-parser";
import { getTexts, saveTextToDB, deleteFile } from "./db.js";
import * as mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
dotenv.config(); // to get environment variables

const dbHost = process.env.MONGO_URI || "mongodb://localhost:27017/yankPaste";
mongoose
  .connect(dbHost, { useNewUrlParser: true })
  .then(() => console.log(`Mongodb Connected`))
  .catch((error) => console.log(error));

const app = express(); // to get POST requests data
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const upload = multer({ dest: 'uploads/' });
const MAX_FILES = 3;

const getFiles = async () => {
  const files = await fs.promises.readdir('uploads/');
  const fileStats = await Promise.all(
    files.map(async (file) => {
      const stats = await fs.promises.stat(path.join('uploads/', file));
      return {
        name: file,
        originalName: file,
        timestamp: stats.mtime.getTime(),
        size: stats.size
      };
    })
  );
  return fileStats.sort((a, b) => b.timestamp - a.timestamp);
};

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

app.post("/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const files = await getFiles();
    if (files.length > MAX_FILES) {
      const oldestFile = files[files.length - 1];
      await fs.promises.unlink(path.join('uploads/', oldestFile.name));
    }

    // Rename file to original name
    const newPath = path.join('uploads/', req.file.originalname);
    await fs.promises.rename(req.file.path, newPath);

    res.json({ message: "File uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error uploading file" });
  }
});

app.get("/files", async (req, res) => {
  try {
    const files = await getFiles();
    res.json({ files });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error getting files" });
  }
});

app.get("/download/:filename", async (req, res) => {
  try {
    const filePath = path.join('uploads/', req.params.filename);
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error downloading file" });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
