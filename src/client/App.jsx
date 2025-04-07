import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Label, Textarea } from "flowbite-react";
import {
  FaPaste,
  FaRegCopy,
  FaSave,
  FaTimesCircle,
  FaTrash,
  FaUpload,
  FaDownload,
} from "react-icons/fa";

// Simple button component
function ActionButton({ icon: Icon, onClick, variant = "default", ariaLabel }) {
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700",
    danger: "bg-red-600 hover:bg-red-700",
    success: "bg-green-600 hover:bg-green-700",
    warning: "bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        aria-label={ariaLabel}
        className={`p-3 rounded-full ${variants[variant]} transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
      >
        <Icon />
      </button>
      <p>{ariaLabel}</p>
    </div>
  );
}

// Simple text area
function TextEditor({ text, setText }) {
  return (
    <Textarea
      placeholder="Type or paste your text here..."
      // rows={8}
      value={text}
      onChange={(e) => setText(e.target.value)}
      className="w-full rounded-lg resize-y shadow-md bg-gray-800 text-white border-gray-700"
    />
  );
}

// Simplified history list
function HistoryList({ items, onSelect, activeItemId }) {
  if (items.length === 0) return null;

  return (
    <div className="w-full mb-4 mt-4">
      <h2 className="text-white text-lg mb-2">Text History: ({items.length})</h2>
      <div className="bg-gray-800 rounded-lg shadow p-2 max-h-60 overflow-y-auto">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-2 mb-1 rounded cursor-pointer ${
              activeItemId === item.unixTime
                ? "bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            onClick={() => onSelect(item)}
          >
            <div className="text-sm text-gray-300">
              {new Date(parseInt(item.unixTime)).toLocaleString()}
            </div>
            <div className="text-white truncate">
              {item.text.length > 60
                ? `${item.text.substring(0, 60)}...`
                : item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simplified file list
function FileList({ files }) {
  if (files.length === 0) return null;

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-white text-lg mb-2">Files ({files.length})</h2>
        <ActionButton
          icon={FaUpload}
          onClick={() => document.getElementById("fileUpload").click()}
          ariaLabel="Upload File"
        />
      </div>
      <div className="bg-gray-800 rounded-lg shadow p-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2 mb-1 bg-gray-700 rounded"
          >
            <div className="truncate max-w-xs">
              <div className="text-white">{file.originalName}</div>
              <div className="text-sm text-gray-300">
                {Math.round(file.size / 1024)} KB •{" "}
                {new Date(file.timestamp).toLocaleString()}
              </div>
            </div>
            <a
              href={`/download/${file.name}`}
              download
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
            >
              <FaDownload />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App component
function App() {
  const [text, setText] = useState("");
  const [list, setList] = useState([]);
  const currItem = useRef();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [textsRes, filesRes] = await Promise.all([
        axios.get("/getTexts"),
        axios.get("/files"),
      ]);

      setList(textsRes.data.rows);
      if (textsRes.data.rows.length > 0) {
        setText(textsRes.data.rows[0]?.text || "");
        currItem.current = textsRes.data.rows[0];
      }
      setFiles(filesRes.data.files);
    } catch (err) {
      console.error("Error loading data:", err);
      alert(err.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectHistoryItem(item) {
    setText(item.text);
    currItem.current = item;
  }

  function clearText() {
    setText("");
    currItem.current = null;
  }

  async function saveText() {
    if (!text.trim()) {
      alert("No text to save!");
      return;
    }

    if (currItem.current && currItem.current.text === text) {
      alert("Text already saved (no changes made)");
      return;
    }

    if (!confirm("Are you sure you want to save this text?")) {
      return;
    }

    try {
      const res = await axios.post(
        "/saveText",
        { text },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      alert(res.data.message);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving text");
    }
  }

  function copyText() {
    if (!text.trim()) {
      alert("No text to copy!");
      return;
    }

    navigator.clipboard.writeText(text);
    alert("Text copied to clipboard!");
  }

  async function pasteText() {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
    } catch (err) {
      console.error("Clipboard error:", err);
      alert("Unable to read from clipboard");
    }
  }

  async function deleteText() {
    if (!currItem.current) {
      alert("No text selected to delete!");
      return;
    }

    if (!confirm("Are you sure you want to DELETE this text?")) {
      return;
    }

    try {
      const res = await axios.delete("/delete", {
        data: { unixTime: currItem.current.unixTime },
        headers: { "Content-Type": "application/json" },
      });

      alert(res.data.message);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting text");
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  async function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (confirm(`Do you want to upload "${file.name}"?`)) {
      const formData = new FormData();
      formData.append("file", file);
      uploadFile(formData);
    }
  }

  async function uploadFile(formData) {
    try {
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Error uploading file");
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-900"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <FaUpload className="mx-auto text-3xl mb-2 text-blue-400" />
            <p className="text-white">Drop file to upload</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            Yank Paste
          </h1>

          <div className="max-w-lg mx-auto">
            <TextEditor text={text} setText={setText} />

            <div className="flex justify-center gap-3 my-4">
              <ActionButton
                icon={FaPaste}
                onClick={pasteText}
                ariaLabel="Paste"
              />
              <ActionButton
                icon={FaRegCopy}
                onClick={copyText}
                ariaLabel="Copy"
              />
              <ActionButton
                icon={FaSave}
                onClick={saveText}
                variant="success"
                ariaLabel="Save"
              />
              <ActionButton
                icon={FaTimesCircle}
                onClick={clearText}
                variant="warning"
                ariaLabel="Clear"
              />
              <ActionButton
                icon={FaTrash}
                onClick={deleteText}
                variant="danger"
                ariaLabel="Delete"
              />
              <div>
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <ActionButton
                  icon={FaUpload}
                  onClick={() => document.getElementById("fileUpload").click()}
                  ariaLabel="Upload File"
                />
              </div>
            </div>

            <HistoryList
              items={list}
              onSelect={handleSelectHistoryItem}
              activeItemId={currItem.current?.unixTime}
            />

            <FileList files={files} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
