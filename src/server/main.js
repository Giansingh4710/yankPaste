import express from "express";
import ViteExpress from "vite-express";
import bodyParser from "body-parser";
import { getDynamoDBItems, saveTextToDB, deleteFromDB } from "./db.js";

const app = express(); // to get POST requests data
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.get("/api/test", (req, res) => {
  res.send("Hello Vite + React from server!");
});

app.get("/saveUrlText", async (req, res) => {
  try {
    await saveTextToDB(req.query.text, "GET");
    res.json({ message: "Text saved in Database!" });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error saving text in Database!";
    res.json({ message: message });
  }
});

app.post("/saveText", async (req, res) => {
  try {
    await saveTextToDB(req.body.text, "POST");
    res.json({ message: "Text saved in DB!" });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error saving text in DB!";
    res.json({ message: message });
  }
});

app.get("/getRows", async (req, res) => {
  try {
    const rows = await getDynamoDBItems();
    res.json({ rows });
  } catch (error) {
    res.status(500);
    const message = error.message || "Error getting text from DB!";
    res.json({ message: message });
  }
});

app.delete("/delete", async (req, res) => {
  try {
    console.log(req.data)
    const { unixTime } = req.body;
    if (!unixTime) {
      res.status(400).json({ message: "Key(unixTime) is required" });
      return;
    }

    await deleteFromDB(unixTime);
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
