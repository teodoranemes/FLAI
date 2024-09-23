"use client";
import React, { useState, useRef, useEffect } from "react";
import { pdfjs } from "react-pdf";
import Axios from "axios";
import styled from "styled-components";
import TextareaAutosize from "react-textarea-autosize";
import { Roboto } from "next/font/google";
import Image from "next/image";

let ConvId;

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["500"],
});

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Home() {
  const [q, setQ] = useState<string>("");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [textAreaValue, setTextAreaValue] = useState("\u{1F916} " + "Salut! Eu sunt FL.AI! Cu ce te pot ajuta?\n"); // Create a state variable for the textarea value
  const [fileList, setFileList] = useState<string>();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textAreaRef1 = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [textAreaValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleClick3();
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files); // Transformă lista de fișiere într-un array
      const newFiles = filesArray.map((file) => file.name); // Obținem numele fișierelor încărcate
      // setFileList(prevList => [...prevList, ...newFiles]); // Adăugăm numele fișierelor la lista existentă

      // Iterăm prin fiecare fișier și apelăm handleFileChosen pentru fiecare fișier
      for (const file of filesArray) {
        await handleFileChosen(file);
      }

      //aici
      handleClick4();
    }
  };

  const handleFileRead = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
    }
    setFileContent(text);
  };

  const handleFileChosen = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
    }
    setFileContent(text);
    // Send the file content along with the request
    await Axios.put("http://localhost:3000/addFile", {
      text: text,
      idc: ConvId,
      name: file.name,
    }).then((response) => {
      console.log(response.data);
    });
  };

  const handleClick3 = async () => {
    const response = await Axios.put("http://localhost:3000/addConv", {
      name: "prima conversatie",
    });
    ConvId = response.data._id;
    console.log(ConvId);
  };

  const handleClick2 = async () => {
    const response = await Axios.post("http://localhost:3000/getFileText", {
      idc: ConvId,
    });
    const allText = response.data
      .map((item: { text: any }) => item.text)
      .join(" ");
    console.log(allText);
    const response2 = await Axios.post("http://localhost:3000/intrebare", {
      content: allText + " Intrebarea " + q,
    });
    setTextAreaValue(
      textAreaValue +
        "\n" +
        "\u{1F601} " +
        q +
        "\n\n" +
        "\u{1F916} " +
        response2.data +
        "\n\n"
    );
    setQ("");
  };

  const handleClick4 = async () => {
    const response = await Axios.post("http://localhost:3000/getFileName", {
      idc: ConvId,
    });
    const allText = response.data
      .map((item: { name: any }) => item.name + "\n\n")
      .join("");
    setFileList(allText + "\n");
    setQ("");
  };

  const handleClickTest = async () => {
    const response = await Axios.post("http://localhost:3000/getFileText", {
      idc: ConvId,
    });
    const allText = response.data
      .map((item: { text: any }) => item.text)
      .join(" ");
    console.log(allText);
    const response2 = await Axios.post("http://localhost:3000/test", {
      content: allText,
    });
    setTextAreaValue(
      textAreaValue + "\n" + "\n" + "\u{1F601} " + "Genereaza-mi intrebari.\n\n" + "\u{1F916} " + response2.data + "\n"
    );
  };

  const handleClickMakeSummary = async () => {
    const response = await Axios.post("http://localhost:3000/getFileText", {
      idc: ConvId,
    });
    const allText = response.data
      .map((item: { text: any }) => item.text)
      .join(" ");
    console.log(allText);
    const response2 = await Axios.post("http://localhost:3000/rezumat", {
      content: allText,
    });
    setTextAreaValue(
      textAreaValue + "\n" + "\u{1F601} " + "Fa-mi rezumatul.\n\n" + "\u{1F916} " + response2.data + "\n"
    );
  };

  const handleClick = () => {
    const fileInput = document.getElementById("fileInput");
    fileInput?.click();
  };

  const handleClickClear = () => {
    setTextAreaValue("");
  };

  // componente new chat
  interface Chat {
    id: number;
    content: string;
  }
  const [chats, setChats] = useState<Chat[]>([]); // Array of Chat objects
  const handleNewChat = () => {
    setChats((prevChats) => [
      ...prevChats,
      { id: Math.random(), content: "New Chat" },
    ]);
  };

  const handleChatClick = (chatId: number) => {
    // Implement logic to open the chat window for the clicked chat (e.g., using a modal)
    console.log(`Opening chat with ID: ${chatId}`);
  };

  return (
    // PAGINA PRINCIPALA
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundColor: "rgb(22,22,22)",
        flexDirection: "row",
        display: "flex",
      }}
      className={roboto.className}
    >
      {/* conversatii  */}
      <div
        style={{
          backgroundColor: "rgb(43,43,43)",
          width: "19%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.3)",
          justifyContent: "space-between",
        }}
      >
        <Image src="/FL.AI2.png" alt="" width={200} height={200} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            backgroundColor: "transparent",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <button
            className="bubble-btn"
            style={{
              width: "100%",
              height: "45px",
              border: "1px solid rgb(22,22,22)",
              color: "white",
              margin: "10px",
              fontSize: "18px",
            }}
          >
            Chat
          </button>
        </div>
        {/* creare butoane dupa apasare buton new chat */}

        <button
          className="button-incercare"
          style={{
            width: "80%",
            height: "45px",
            backgroundColor: "rgb(131, 6, 221)",
            color: "white",
            border: "none",
            borderRadius: "15px",
            margin: "10px",
            fontSize: "18px",
            boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
            marginBottom: "37px",
          }}
        >
          New Chat
        </button>
      </div>
      {/* dreapta tot */}
      <div
        style={{
          gap: "50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* butoane row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "65.33%",
            height: "9.32%",
            padding: "1rem",
            backgroundColor: "rgb(43, 43, 43)",
            position: "absolute",
            top: "15px",
            left: "27%",
            borderRadius: "15px",
            boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <button
            className="button-incercare"
            style={{
              width: "25%",
              height: "37px",
              backgroundColor: "rgb(131, 6, 221)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              margin: "10px",
              fontSize: "18px",
              transition: "transform 0.2s ease",
              boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
            }}
            onClick={handleClickTest}
          >
            Generate Questions
          </button>
          <button
            className="button-incercare"
            style={{
              width: "25%",
              height: "37px",
              backgroundColor: "rgb(131, 6, 221)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              margin: "10px",
              fontSize: "18px",
              boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
            }}
            onClick={handleClickMakeSummary}
          >
            Make Summary
          </button>
          <button
            className="button-incercare"
            style={{
              width: "25%",
              height: "37px",
              backgroundColor: "rgb(131, 6, 221)",
              color: "white",
              border: "none",
              borderRadius: "15px",
              margin: "10px",
              fontSize: "18px",
              transition: "transform 0.2s ease",
              boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
            }}
            onClick={handleClickClear}
          >
            Clear Chat
          </button>
        </div>
        {/* row conversatii + pdf-uri */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "65.33%",
            height: "81.85%",
            position: "absolute",
            top: "15%",
            left: "27%",
            borderRadius: "15px",
          }}
        >
          {/* conversatie column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              alignContent: "flex-end",
              justifyContent: "flex-end",
              width: "65.33%",
              height: "100%",
              padding: "1rem",
              backgroundColor: "rgb(43, 43, 43)",
              borderRadius: "15px",
              boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <TextareaAutosize
              ref={textAreaRef}
              className="no-focus"
              style={{
                width: "98%",
                backgroundColor: "transparent",
                borderRadius: "15px",
                padding: "1rem",
                color: "white",
                fontSize: "18px",
                border: "none",
                resize: "none",
                overflow: "auto",
              }}
              value={textAreaValue} // Bind the textarea value to the state variable
              readOnly // Make the textarea read-only if you don't want the user to be able to edit it
            />
            <div
              style={{
                display: "flex",
                width: "98%",
                height: "37px",
                backgroundColor: "transparent",
                borderRadius: "15px",
                flexDirection: "row",
                alignContent: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <input
                type="text"
                placeholder="Type your message here..."
                style={{
                  marginRight: "10px",
                  width: "90%",
                  height: "37px",
                  borderRadius: "15px",
                  boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
                  padding: "0 10px",
                }}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                style={{
                  width: "12%",
                  height: "37px",
                  backgroundColor: "rgb(131, 6, 221)",
                  color: "white",
                  border: "none",
                  borderRadius: "15px",
                  fontSize: "18px",
                  boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
                }}
                onClick={handleClick2}
              >
                Send
              </button>
            </div>
          </div>
          {/* fisiere column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              width: "30.32%",
              height: "100%",
              padding: "1rem",
              backgroundColor: "rgb(43, 43, 43)",
              borderRadius: "15px",
              boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <textarea
              readOnly
              ref={textAreaRef1}
              value={fileList}
              className="no-focus"
              style={{
                width: "100%",
                height: "calc(100% - 60px)",
                backgroundColor: "transparent",
                color: "white",
                border: "none",
                borderRadius: "15px",
                padding: "0.5rem",
                resize: "none",
                justifyContent: "space-between",
                gap: "10px",
                overflow: "auto", // Bind the textarea value to the state variable
              }}
            />
            <button
              className="button-incercare"
              style={{
                width: "92%",
                height: "37px",
                backgroundColor: "rgb(131, 6, 221)",
                color: "white",
                borderRadius: "15px",
                fontSize: "18px",
                boxShadow: "0px 4px 8px 8px rgba(0, 0, 0, 0.2)",
              }}
              onClick={() => {
                document.getElementById("fileInput")?.click();
              }}
            >
              Upload File
              <input
                id="fileInput"
                type="file"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileChange(e);
                  }
                }}
                accept=".pdf"
                style={{ display: "none" }}
                multiple
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
