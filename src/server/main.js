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
app.use(express.json({ limit: "10gb" }));
app.use(express.urlencoded({ limit: "10gb", extended: true }));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const getFiles = async () => {
  const files = await fs.promises.readdir("uploads/");
  const fileStats = await Promise.all(
    files.map(async (file) => {
      const stats = await fs.promises.stat(path.join("uploads/", file));
      return {
        name: file,
        originalName: file,
        timestamp: stats.mtime.getTime(),
        size: stats.size,
      };
    }),
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

app.post("/upload", (req, res) => {
  upload.single("file")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "File is too large. Maximum size is 10GB",
        });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: "Error uploading file" });
    }

    handleFileUpload(req, res);
  });
});

async function handleFileUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const files = await getFiles();

    if (files.length > 5) {
      const oldestFile = files[files.length - 1];
      await fs.promises.unlink(path.join("uploads/", oldestFile.name));
    }

    const totalSize =
      files.reduce((sum, file) => sum + file.size, 0) + req.file.size;
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024 * 1024; // If over 10GB limit, remove oldest files
    if (totalSize > MAX_TOTAL_SIZE) {
      files.map((fileToDelete) => {
        if (fileToDelete.name !== req.file.filename)
          fs.promises.unlink(path.join("uploads/", fileToDelete.name));
      });
    }

    res.json({ message: "File uploaded successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Error uploading file" });
  }
}

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
    const filePath = path.join("uploads/", req.params.filename);
    res.download(filePath);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error downloading file" });
  }
});

app.delete("/files/:filename", async (req, res) => {
  try {
    const filePath = path.join("uploads/", req.params.filename);
    await fs.promises.unlink(filePath);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Error deleting file"
    });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
