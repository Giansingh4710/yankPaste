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

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10GB
const MAX_FILE_SIZE_FORMATTED = "10GB";

// Simple button component
function ActionButton({
  icon: Icon,
  onClick,
  variant = "default",
  ariaLabel,
  disabled,
}) {
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
        disabled={disabled}
        className={`p-3 rounded-full ${variants[variant]} transition-colors
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
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
      <h2 className="text-white text-lg mb-2">
        Text History: ({items.length})
      </h2>
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

// Add this helper function
function formatFileSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

function FileList({ files, isUploading, onDelete }) {
  const [selectedFile, setSelectedFile] = useState(null);

  if (files.length === 0) return null;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="w-full mb-4">
      {selectedFile && (
        <FilePreview
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-white text-lg mb-1">Files: ({files.length})</h2>
          <p className="text-gray-400 text-sm">
            Total size: {formatFileSize(totalSize)}
          </p>
        </div>
        <ActionButton
          icon={FaUpload}
          onClick={() => document.getElementById("fileUpload").click()}
          ariaLabel="Upload File"
          disabled={isUploading}
        />
      </div>
      <div className="bg-gray-800 rounded-lg shadow p-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-2 mb-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            <div
              className="truncate max-w-xs cursor-pointer"
              onClick={() => setSelectedFile(file)}
            >
              <div className="text-white">{file.originalName}</div>
              <div className="text-sm text-gray-300">
                {formatFileSize(file.size)}
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`/download/${file.name}`}
                download
                className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
              >
                <FaDownload />
              </a>
              <button
                onClick={() => onDelete(file)}
                className="bg-red-600 hover:bg-red-700 p-2 rounded"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add this new component near the top of the file
function Notification({ message, type, onClose }) {
  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  }[type];

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
}

// Add this new component for file preview
function FilePreview({ file, onClose }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFilePreview();

    // Add event listener for escape key
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [file]);

  async function loadFilePreview() {
    try {
      setLoading(true);
      const response = await axios.get(`/download/${file.name}`, {
        responseType: "blob",
      });
      const blob = response.data;
      const fileType = blob.type;

      // Handle different file types
      if (fileType.startsWith("image/")) {
        setContent(
          <img
            src={URL.createObjectURL(blob)}
            alt={file.name}
            className="max-w-full max-h-[70vh]"
          />,
        );
      } else if (fileType === "application/pdf") {
        setContent(
          <iframe
            src={URL.createObjectURL(blob)}
            className="w-full h-[70vh]"
            title={file.name}
          />,
        );
      } else if (
        fileType.startsWith("text/") ||
        fileType === "application/json"
      ) {
        const text = await blob.text();
        setContent(
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-[70vh] text-sm">
            {text}
          </pre>,
        );
      } else if (fileType.startsWith("video/")) {
        setContent(
          <video controls className="max-w-full max-h-[70vh]">
            <source src={URL.createObjectURL(blob)} type={fileType} />
            Your browser does not support the video tag.
          </video>,
        );
      } else if (fileType.startsWith("audio/")) {
        setContent(
          <audio controls className="w-full">
            <source src={URL.createObjectURL(blob)} type={fileType} />
            Your browser does not support the audio tag.
          </audio>,
        );
      } else {
        setContent(
          <pre className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-[70vh] text-sm">
            Unsupported file type
          </pre>,
        );
      }
    } catch (err) {
      setError("Error loading file preview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg">{file.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : (
          content
        )}
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
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);

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

  async function saveText(theText = text) {
    if (!theText.trim()) {
      alert("No text to save!");
      return;
    }

    if (currItem.current && currItem.current.text === theText) {
      alert("Text already saved (no changes made)");
      return;
    }

    try {
      const res = await axios.post(
        "/saveText",
        { text: theText },
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
      saveText(clipText);
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

    if (file.size > MAX_FILE_SIZE) {
      showNotification(
        `File too large. Maximum size is ${MAX_FILE_SIZE_FORMATTED}`,
        "error",
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData, file);
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

    if (file.size > MAX_FILE_SIZE) {
      showNotification(
        `File too large. Maximum size is ${MAX_FILE_SIZE_FORMATTED}`,
        "error",
      );
      return;
    }

    if (confirm(`Do you want to upload "${file.name}"?`)) {
      const formData = new FormData();
      formData.append("file", file);
      uploadFile(formData, file);
    }
  }

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  async function uploadFile(formData, file) {
    setIsUploading(true);
    const startTime = Date.now();

    try {
      const res = await axios.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          const elapsedTime = (Date.now() - startTime) / 1000;
          const uploadSpeed = progressEvent.loaded / elapsedTime; // bytes per second

          showNotification(
            `Uploading ${file.name}: ${percentCompleted}%\n` +
              `Speed: ${formatFileSize(uploadSpeed)}/s`,
            "info",
          );
        },
        // Increase timeout for large files
        timeout: 3600000, // 1 hour
      });

      showNotification(`${file.name} uploaded successfully!`, "success");
      loadData();
    } catch (err) {
      let errorMessage;
      if (err.response?.status === 413) {
        errorMessage = `File too large. Maximum size is ${MAX_FILE_SIZE_FORMATTED}`;
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Upload timed out. Please try again.";
      } else {
        errorMessage =
          err.response?.data?.message || `Error uploading ${file.name}`;
      }
      showNotification(errorMessage, "error");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteFile(file) {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        await axios.delete(`/files/${file.name}`);
        showNotification(`${file.name} deleted successfully`, "success");
        await loadData();
      } catch (err) {
        showNotification(
          err.response?.data?.message || `Error deleting ${file.name}`,
          "error",
        );
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-900"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Add notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Update the loading overlay to handle both initial load and upload states */}
      {(isLoading || isUploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white">
              {isUploading ? "Uploading file..." : "Loading..."}
            </p>
          </div>
        </div>
      )}

      {isDragging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <FaUpload className="mx-auto text-3xl mb-2 text-blue-400" />
            <p className="text-white">Drop file to upload</p>
          </div>
        </div>
      )}

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
              onClick={() => saveText(text)}
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
                ariaLabel="Upload"
              />
            </div>
          </div>

          <HistoryList
            items={list}
            onSelect={handleSelectHistoryItem}
            activeItemId={currItem.current?.unixTime}
          />

          <FileList
            files={files}
            isUploading={isUploading}
            onDelete={handleDeleteFile}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
