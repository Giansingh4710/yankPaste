import { Button } from "flowbite-react";
import { Label, Table, Textarea } from "flowbite-react";
import {
  FaPaste,
  FaRegCopy,
  FaSave,
  FaTimesCircle,
  FaTrash,
  FaUpload,
  FaDownload,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { ButtonLabel } from "./helperComps";
import { displayHistoryText } from "./helperFuncs";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [list, setList] = useState([]);
  const currItem = useRef();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    Promise.all([axios.get("/getTexts"), axios.get("/files")])
      .then(([textsRes, filesRes]) => {
        setList(textsRes.data.rows);
        setText(textsRes.data.rows[0]?.text || "");
        currItem.current = textsRes.data.rows[0];
        setFiles(filesRes.data.files);
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error fetching data");
      });
  }, []);

  function clearText() {
    setText("");
  }

  function saveText() {
    if (!confirm("Are you sure you want to save this text?")) {
      return;
    }
    if (text === "") {
      alert("No text to save!");
      return;
    }
    if (currItem.current && currItem.current.text === text) {
      alert("Text already saved (no changes made)");
      return;
    }

    axios({
      url: "/saveText",
      method: "POST",
      data: { text: text },
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        alert(res.data.message);
        window.location.reload();
      })
      .catch((err) => {
        alert(err.response.data.message);
      });
  }

  function copyText() {
    if (text === "") {
      alert("No text to copy!");
      return;
    }
    navigator.clipboard.writeText(text);
    alert("Text copied!");
  }

  function pasteText() {
    navigator.clipboard
      .readText()
      .then((clipText) => setText(clipText))
      .catch((err) => {
        console.log(err);
        alert(err.response.data.message);
      });
  }

  function deleteText() {
    const unixTime = currItem.current.unixTime;

    if (!confirm("Are you sure you want to DELETE this text?")) {
      return;
    }
    axios({
      url: "/delete",
      method: "DELETE",
      data: { unixTime: unixTime },
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        alert(res.data.message);
        window.location.reload();
      })
      .catch((err) => {
        console.log();
        alert(err.response.data.message);
      });
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        alert(res.data.message);
        window.location.reload();
      })
      .catch((err) => {
        alert(err.response?.data?.message || "Error uploading file");
      });
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (confirm(`Do you want to upload "${file.name}"?`)) {
      const formData = new FormData();
      formData.append("file", file);

      axios
        .post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          alert(res.data.message);
          window.location.reload();
        })
        .catch((err) => {
          alert(err.response?.data?.message || "Error uploading file");
        });
    }
  }

  return (
    <div
      className="flex flex-col pt-5 items-center min-h-screen"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black p-8 rounded-lg text-center">
            <FaUpload className="mx-auto text-4xl mb-4" />
            <p className="text-xl text-gray-50">Drop file to upload</p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-white">Welcome to Yank Paste</h1>
      <div className="flex flex-col  items-center pt-12">
        <TheTextArea text={text} setText={setText} />
        <div className="flex flex-row mt-5 gap-5">
          <ButtonLabel text="Paste" Icon={FaPaste} action={pasteText} />
          <ButtonLabel text="Save" Icon={FaSave} action={saveText} />
          <ButtonLabel text="Clear" Icon={FaTimesCircle} action={clearText} />
          <ButtonLabel text="Copy" Icon={FaRegCopy} action={copyText} />
          <ButtonLabel text="Delete" Icon={FaTrash} action={deleteText} />
        </div>
        <History setText={setText} list={list} currItem={currItem} />
        <FileList files={files} />
        <div className="mt-5">
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button onClick={() => document.getElementById("fileUpload").click()}>
            <FaUpload className="mr-2" />
            Upload File
          </Button>
        </div>
      </div>
    </div>
  );
}

function History({ setText, list, currItem }) {
  return (
    <div className="">
      <Label className="text-white" value="History" />
      <div className="overflow-x-auto h-[20rem]">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>#</Table.HeadCell>
            <Table.HeadCell>Time</Table.HeadCell>
            <Table.HeadCell>Text</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {list.map((item, idx) => (
              <Table.Row
                key={idx}
                className="bg-white"
                onClick={() => {
                  setText(item.text);
                  currItem.current = item;
                }}
              >
                <Table.Cell>{list.length - idx}</Table.Cell>
                <Table.Cell>
                  {new Date(parseInt(item.unixTime)).toLocaleString()}
                </Table.Cell>
                <Table.Cell>{displayHistoryText(item.text)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

function TheTextArea({ text, setText }) {
  return (
    <div className="w-full">
      <div className="mb-2 block">
        <Label className="text-white" htmlFor="comment" value="Your message" />
      </div>
      <Textarea
        className="w-full"
        id="comment"
        placeholder="Leave a comment..."
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}

function FileList({ files }) {
  return (
    <div className="mt-8 w-full">
      <Label className="text-white" value="Files (Max 3)" />
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>Size</Table.HeadCell>
            <Table.HeadCell>Upload Date</Table.HeadCell>
            <Table.HeadCell>Action</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {files.map((file, idx) => (
              <Table.Row key={idx} className="bg-white">
                <Table.Cell>{file.originalName}</Table.Cell>
                <Table.Cell>{Math.round(file.size / 1024)} KB</Table.Cell>
                <Table.Cell>
                  {new Date(file.timestamp).toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  <a href={`/download/${file.name}`} download>
                    <Button size="sm">
                      <FaDownload className="mr-2" />
                      Download
                    </Button>
                  </a>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
}

export default App;
