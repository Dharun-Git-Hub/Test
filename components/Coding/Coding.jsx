import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import Editor from "@monaco-editor/react";
import { assets } from "../../assets/assets";
import { CodeContext } from "../../CodeProvider/CodeContext";
import './Coding.css';

const Coding = () => {
  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("// Write your code here...");
  const [result, setResult] = useState("");
  const [theme, setTheme] = useState("vs-dark");
  const [anime, setOpenAnime] = useState(false);
  const [times, setTimes] = useState(0); 
  const { setCodeInput, setAskedHelp, askedHelp } = useContext(CodeContext);
  const navigate = useNavigate();

  const defaultCodes = {
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}`,
    python: `print("Hello, Python!")`,
    c: `#include <stdio.h>\nint main() {\n  printf("Hello, C!\\n");\n  return 0;\n}`,
    cpp: `#include <iostream>\nusing namespace std;\nint main() {\n  cout << "Hello, C++!" << endl;\n  return 0;\n}`,
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(defaultCodes[lang] || "// Write your code here...");
  };

   const goToMain = () => {
    setAskedHelp(true);
    if(result)
      setCodeInput(code+`\n\n${result}\n`);
    else
      setCodeInput(code);
  };

useEffect(() => {
  if (times === 0) {
    setOpenAnime(true);
    const timer = setTimeout(() => {
      setOpenAnime(false);
      setTimes(1); 
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [times]);


  const handleDownload = () => {
    const extensions = { java: "java", python: "py", c: "c", cpp: "cpp" };
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `code.${extensions[language] || "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    if (!language || !code) {
      setResult("Please select a language and write some code before running.");
      return;
    }

    const languageVersions = {
      python: "3.10.0",
      java: "15.0.2",
      c: "10.2.0",
      cpp: "10.2.0",
    };

    const version = languageVersions[language] || "default-version";

    if (!version) {
      setResult(`Error: No version specified for the selected language: ${language}`);
      return;
    }

    const input = window.prompt("Enter inputs for the program, separated by `,,` (e.g., `2,,jjj`):", "");

    try {
      const processedInput = input?.split(",,").join("\n") || "";

      const requestBody = {
        language,
        version,
        files: [
          {
            name: `main.${language === "python" ? "py" : language === "java" ? "java" : language === "c" ? "c" : "cpp"}`,
            content: code,
          },
        ],
        stdin: processedInput,
      };

      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.run.output || "No output");
        console.log(data);
      } else {
        setResult(`Error: ${data.message || "Execution failed"}`);
      }
    } catch (error) {
      setResult("Error running code. Please try again.");
    }
  };
  
  useEffect(() => {
  const handlePaste = (event) => {
    const pastedText = event.clipboardData.getData("Text");
    if (pastedText) {
      setCode(pastedText);
    }
  };

  window.addEventListener("paste", handlePaste);
  return () => window.removeEventListener("paste", handlePaste);
}, []);

  return (
    <div style={{ width: askedHelp ? "61vw" : "100vw" }} className="codingcont">
    { anime ? (<div>
      <div className="animation-block fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <p className="shining-text text-white text-3xl font-bold">Live-Code Editor</p>
        </div></div>) : 
     (
      <>
      <div className="codingbuttons">
        <div className="codinglangselect">
        <i title="Back" className="bx bx-x" style={{color: "red", fontSize: "20px", userSelect:"none"}} onClick={()=>{setAskedHelp(false);
        navigate("/dashboard");
      }} />
          <label id="labell" htmlFor="language-select" style={{ userSelect: "none", marginRight: "10px", color: theme && theme === "vs" ? "#ffffff" : "#fffffe" }}>Select Language:</label>
          <select
            title="Choose Language"
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
            style={{ padding: "5px 10px", margin: "10px", userSelect: "none" }}
          >
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            
          </select>
          <img id="langimg" src={language === "java" ? assets.java_icon : language === "c" ? assets.c_icon : language === "cpp" ? assets.cpp_icon : language === "python" ? assets.py_icon : null} />
        </div>

        <div className="codingbutton">
        <button title="HTML / CSS / JS" className="codingbuttonind" style={{ backgroundColor: "#1E3A8A" }} onClick={()=>navigate("/coder")}>
            <i className="bx bx-globe" />
          </button>
          <button title="Run" className="codingbuttonind" style={{ backgroundColor: "green" }} onClick={handleRun}>
            <i className="bx bx-play" />
          </button>
          <button title="Save" className="codingbuttonind" style={{ backgroundColor: "cyan", color: "#1f1f1f" }} onClick={handleDownload}>
            <i className="bx bx-save" />
          </button>
          <button title="Dark/Light Theme" className="codingbuttonind" style={{ backgroundColor: "#1f1f1f" }} onClick={() => setTheme((prev) => (prev === "vs" ? "vs-dark" : "vs"))}>
            <i className={theme && theme === "vs" ? "bx bx-moon" : "bx bx-sun"} />
          </button>
          <button title="Clear All" className="codingbuttonind" style={{ backgroundColor: "indianred", color: "white" }} onClick={() => setResult('')}>
            <i className="bx bx-trash" />
          </button>
        </div>
      </div>
      <div className="askhelp">
       {askedHelp ? <i title="Close AI" className="bx bx-x" style={{color: "white", marginRight:"10px", fontSize: "20px"}} onClick={()=>setAskedHelp(false)} /> : null }
      <div onClick={goToMain} className="askhelpbutton">
      <img style={{width: "35px",
                          height: "100%"
                        }}
              src={assets.gemini_icon} />
              <span id="helping" style={{ marginLeft: "10px",marginRight:"10px", fontSize: "13px"}}>
              Ask Help</span>
      </div>
      </div>

      <div id="codeeditcont" style={{ backgroundColor: theme && theme === "vs" ? "#fffffe" : "#1f1f1f" }}>
        <Editor
          className="codingeditor"
          height="400px"
          width="94%"
          theme={theme}
          language={language}
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>

      <div>
        <h3 style={{ color: "white", userSelect: "none", textAlign: "left", marginLeft: "20px" }}>Output:</h3>
      </div>

      <div style={{
        marginTop: "20px",
        padding: "10px",
        backgroundColor: result.trim().startsWith("main.") ? "black" : "#1f1f1f",
        color: result.startsWith("main.") ? "orangered" : "#fff",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }} id="resultid"
      >
        <pre id="resdat" style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }} >
          {result}
        </pre>
      </div>
      </>
      )}
    </div>
  );
};

export default Coding;
