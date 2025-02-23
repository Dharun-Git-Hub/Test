import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/panda-syntax.css";
import "codemirror/theme/mdn-like.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/hint/show-hint";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/css/css";
import "codemirror/mode/javascript/javascript";
import "./Coder.css";
import { assets } from '../../assets/assets';

const Coder = () => {
  const livePreviewRef = useRef(null);
  const htmlEditorRef = useRef(null);
  const cssEditorRef = useRef(null);
  const jsEditorRef = useRef(null);
  const navigate = useNavigate();
  const [isDarc, setDarc] = useState(true);

  useEffect(() => {
    // Override console.error to suppress error messages
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Suppress error messages
    };

    const initializeLivePreview = () => {
      const iframe = livePreviewRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.body.innerHTML = "";
      const styleElement = document.createElement("style");
      styleElement.setAttribute("id", "live-preview-style");
      doc.head.appendChild(styleElement);

      const pagedJsScript = document.createElement("script");
      pagedJsScript.src = "https://unpkg.com/pagedjs/dist/paged.legacy.polyfill.js";
      doc.head.appendChild(pagedJsScript);
    };

    const initializeCodeEditors = () => {
      const defaultOptions = (overrides) => ({
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        theme: isDarc ? "panda-syntax" : "mdn-like",
        ...overrides,
      });

      htmlEditorRef.current.CodeMirror = CodeMirror(htmlEditorRef.current, defaultOptions({ mode: "text/html", value: "" }));
      cssEditorRef.current.CodeMirror = CodeMirror(cssEditorRef.current, defaultOptions({ mode: "css", value: "" }));
      jsEditorRef.current.CodeMirror = CodeMirror(jsEditorRef.current, defaultOptions({ mode: "javascript", value: "" }));

      htmlEditorRef.current.CodeMirror.on("change", () => {
        const iframe = livePreviewRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.body.innerHTML = htmlEditorRef.current.CodeMirror.getValue();
      });

      cssEditorRef.current.CodeMirror.on("change", () => {
        const iframe = livePreviewRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const styleElement = doc.getElementById("live-preview-style");
        styleElement.innerHTML = cssEditorRef.current.CodeMirror.getValue();
      });

      jsEditorRef.current.CodeMirror.on("change", () => {
        const iframe = livePreviewRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        const scriptElement = document.createElement("script");
        scriptElement.innerHTML = jsEditorRef.current.CodeMirror.getValue();
        doc.body.appendChild(scriptElement);
      });
    };

    initializeLivePreview();
    initializeCodeEditors();

    return () => {
      // Restore the original console.error method when the component unmounts
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const theme = isDarc ? "panda-syntax" : "mdn-like";
      if (htmlEditorRef.current?.CodeMirror) {
        htmlEditorRef.current.CodeMirror.setOption("theme", theme);
      }
      if (cssEditorRef.current?.CodeMirror) {
        cssEditorRef.current.CodeMirror.setOption("theme", theme);
      }
      if (jsEditorRef.current?.CodeMirror) {
        jsEditorRef.current.CodeMirror.setOption("theme", theme);
      }
    };
    updateTheme();
  }, [isDarc]);

  const handleDownload = () => {
    const htmlContent = htmlEditorRef.current.CodeMirror.getValue();
    const cssContent = cssEditorRef.current.CodeMirror.getValue();
    const jsContent = jsEditorRef.current.CodeMirror.getValue();

    const completeHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Code Preview</title>
        <style>${cssContent}</style>
      </head>
      <body>
        ${htmlContent}
        <script>${jsContent}</script>
      </body>
      </html>
    `;

    const blob = new Blob([completeHtml], { type: "text/html" });
    saveAs(blob, "demo.html");
  };

  return (
    <div className="containercoder">
      <div className="header">
        <div className="title">
          <div className="main-title">
          <div style={{display: "flex",
                              gap: "5px"}}>
                              <button title="Back" style={{background: "transparent", position: "fixed", left: "1vw"}} onClick={()=>navigate("/coding")} className="download-button"><i className="bx bx-run"/></button>
               Live Code Editor
          </div>
            <div style={{display: "flex",
                              gap: "20px"}}>
            <img style={{padding: "1px", filter: "drop-shadow(2px 2px silver)"}} src={assets.moon_icon} title="Dark/Light Mode" onClick={() => {setDarc(prev=>!prev)}} alt="Toggle Theme" />
             <button title="Download" onClick={handleDownload} className="download-button"><i className="bx bx-download"/></button>
            </div>  
          </div>
        </div>
      </div>

      <div className="code-box">
        <div className="editor" id="html" ref={htmlEditorRef}></div>
        <div className="editor" id="css" ref={cssEditorRef}></div>
        <div className="editor" id="js" ref={jsEditorRef}></div>
      </div>

      <div className="preview">
        <iframe id="live-preview" ref={livePreviewRef}></iframe>
      </div>
    </div>
  );
};

export default Coder;