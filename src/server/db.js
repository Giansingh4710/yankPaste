import * as fs from "node:fs";
import * as path from "node:path";

const dir_of_texts = "./pasted_text/";
// Function to save text as a file
function saveTextToDB(text) {
  const fileName = Date.now().toString() + ".txt";
  const theTextFiles = fs
    .readdirSync(dir_of_texts)
    .filter((file) => path.extname(file) === ".txt")
    .sort();
  const fileCount = theTextFiles.length;
  if (fileCount >= 10) {
    deleteFile(path.parse(theTextFiles[0]).name);
  }
  try {
    fs.writeFileSync(path.join(dir_of_texts, fileName), text); // Sync file write
  } catch (err) {
    console.error(err);
  }
}

function getFiles() {
  const files = [];
  try {
    fs.readdirSync(dir_of_texts)
      .filter((file) => path.extname(file) === ".txt")
      .sort()
      .reverse()
      .forEach((file) => {
        files.push({
          unixTime: path.parse(file).name, // Get the file name without extension
          text: fs.readFileSync(path.join(dir_of_texts, file), {
            encoding: "utf8",
          }),
        });
      });
  } catch (err) {
    console.error("Error reading files:", err);
  }

  return files;
}

// Function to delete a file based on its name (unixTime)
function deleteFile(unixTime) {
  const filePath = path.join(dir_of_texts, unixTime + ".txt");
  try {
    fs.unlinkSync(filePath); // Sync file delete
  } catch (err) {
    console.error("Error deleting file:", err);
  }
}

export { getFiles, saveTextToDB, deleteFile };
