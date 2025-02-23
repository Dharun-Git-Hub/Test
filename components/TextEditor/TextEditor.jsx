import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { assets } from "../../assets/assets";
import Modal from '../Modal/Modal'
import "./TextEditor.css";

const TextEditor = () => {
  const navigate = useNavigate();
  const [anime, setOpenAnime] = useState(false);
  const [times, setTimes] = useState(0); 
  const [modal, setModal] = useState(false);
  const textInputRef = useRef(null);
  var downloadPageColor = "#ffffff";

  useEffect(() => {
    const optionstxtButtons = document.querySelectorAll(".option-button");
    const advancedOptionButton = document.querySelectorAll(".adv-option-button");
    const fontName = document.getElementById("fontName");
    const fontSizeRef = document.getElementById("fontSize");
    const linkButton = document.getElementById("createLink");
    const alignButtons = document.querySelectorAll(".align");
    const spacingButtons = document.querySelectorAll(".spacing");
    const formatButtons = document.querySelectorAll(".format");
    const scriptButtons = document.querySelectorAll(".script");
    const backColorInput = document.getElementById("backColor");

    const fontList = [
      "Arial",
      "Verdana",
      "Times New Roman",
      "Garamond",
      "Georgia",
      "Courier New",
      "Cursive",
      "Bebas Neu",
      "Vivaldi",
      "Arial",
      "Bell MT",
    ];

    const initializer = () => {
      highlighter(alignButtons, true);
      highlighter(spacingButtons, true);
      highlighter(formatButtons, false);
      highlighter(scriptButtons, true);

      fontList.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        fontName.appendChild(option);
      });

      backColorInput.addEventListener("input", (event) => {
        const selectedColor = event.target.value;
        downloadPageColor = event.target.value;
        if (textInputRef.current) {
          textInputRef.current.style.backgroundColor = selectedColor;
        }
      });

      for (let i = 1; i <= 7; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.innerHTML = i;
        fontSizeRef.appendChild(option);
      }

      fontSizeRef.value = 3;
    };

    const modifyText = (command, defaultUi, value) => {
      document.execCommand(command, defaultUi, value);
    };

    optionstxtButtons.forEach((button) => {
      button.addEventListener("click", () => {
        modifyText(button.id, false, null);
      });
    });

    advancedOptionButton.forEach((button) => {
      button.addEventListener("change", () => {
        modifyText(button.id, false, button.value);
      });
    });

    fontName.addEventListener("change", () => {
      const selectedFont = fontName.value;
      applyFontStyle(selectedFont);
    });

    const applyFontStyle = (font) => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0); 
      const selectedText = range.extractContents();

      const span = document.createElement("span");
      span.style.fontFamily = font; 
      span.appendChild(selectedText); 

      range.insertNode(span);
    };

    linkButton.addEventListener("click", () => {
      let userLink = prompt("Enter a URL?");
      if (/http/i.test(userLink)) {
        modifyText(linkButton.id, false, userLink);
      } else {
        userLink = "http://" + userLink;
        modifyText(linkButton.id, false, userLink);
      }
    });

    const highlighter = (className, needsRemoval) => {
      className.forEach((button) => {
        button.addEventListener("click", () => {
          if (needsRemoval) {
            let alreadyActive = false;
            if (button.classList.contains("active")) {
              alreadyActive = true;
            }
            highlighterRemover(className);
            if (!alreadyActive) {
              button.classList.add("active");
            }
          } else {
            button.classList.toggle("active");
          }
        });
      });
    };

    const highlighterRemover = (className) => {
      className.forEach((button) => {
        button.classList.remove("active");
      });
    };

    initializer();
  }, []);

  useEffect(() => {
    const backColorInput = document.getElementById("backColor");

    const handleBackColorChange = (event) => {
      const selectedColor = event.target.value;
      downloadPageColor = event.target.value;
      if (textInputRef.current) {
        textInputRef.current.style.backgroundColor = selectedColor;
      }
    };

    backColorInput.addEventListener("input", handleBackColorChange);

    return () => {
      backColorInput.removeEventListener("input", handleBackColorChange);
    };
  }, [modal]);

  const parseElementRecursive = (node, parentStyles = {}) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (!text) return [];

      return [
        new TextRun({
          text,
          bold: parentStyles.bold || false,
          italics: parentStyles.italic || false,
          color: parentStyles.color || "000000",
          size: parentStyles.fontSize || 24,
          font: parentStyles.fontFamily || "Arial",
          shading: parentStyles.highlight
            ? { type: "CLEAR", color: parentStyles.highlight }
            : undefined,
        }),
      ];
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName === "BR") {
        return [
          new TextRun({ text: "\n" }),
        ];
      }

      const styles = window.getComputedStyle(node);

      const fontSize = Math.round(parseFloat(styles.fontSize) * 2) || 24;
      const fontFamily = styles.fontFamily || parentStyles.fontFamily || "Arial";
      const color = styles.color ? rgbToHex(styles.color) : parentStyles.color || "000000";
      const isBold = styles.fontWeight === "bold" || parseInt(styles.fontWeight) >= 700 || parentStyles.bold || false;
      const isItalic = styles.fontStyle === "italic" || parentStyles.italic || false;

      const childNodes = Array.from(node.childNodes);
      return childNodes.flatMap((child) =>
        parseElementRecursive(child, {
          bold: isBold,
          italic: isItalic,
          color: color,
          fontSize: fontSize,
          fontFamily: fontFamily,
        })
      );
    }
    return [];
  };

  const rgbToHex = (rgb) => {
    const match = rgb.match(/\d+/g);
    if (match && match.length === 3) {
      return (
        ((1 << 24) +
          (parseInt(match[0]) << 16) +
          (parseInt(match[1]) << 8) +
          parseInt(match[2]))
          .toString(16)
          .slice(1)
          .toUpperCase()
      );
    }
    return "000000"; 
  };

  const downloadDocx = () => {
    const content = textInputRef.current;
    const children = Array.from(content.childNodes);

    const parseElementRecursive = (node, parentStyles = {}) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (!text) return []; 

        return [
          new TextRun({
            text,
            bold: parentStyles.bold || false,
            italics: parentStyles.italic || false,
            color: parentStyles.color || "000000",
            size: parentStyles.fontSize || 24,
            font: parentStyles.fontFamily || "Arial",
          }),
        ];
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "BR") {
          return [new TextRun({ text: "\n" })];
        }

        if (node.classList.contains("next")) {
          return [
            new Paragraph({
              children: [],
              spacing: { before: 100, after: 100 },
            }),
          ];
        }

        const styles = window.getComputedStyle(node);
        const fontSize = Math.round(parseFloat(styles.fontSize) * 2) || 24;
        const fontFamily = styles.fontFamily || parentStyles.fontFamily || "Arial";
        const color = styles.color ? rgbToHex(styles.color) : parentStyles.color || "000000";
        const isBold = styles.fontWeight === "bold" || parseInt(styles.fontWeight) >= 700 || parentStyles.bold || false;
        const isItalic = styles.fontStyle === "italic" || parentStyles.italic || false;

        const childNodes = Array.from(node.childNodes);
        return childNodes.flatMap((child) =>
          parseElementRecursive(child, {
            bold: isBold,
            italic: isItalic,
            color: color,
            fontSize: fontSize,
            fontFamily: fontFamily,
          })
        );
      }
      return [];
    };

    const paragraphs = children.map((child) => {
      const textRuns = parseElementRecursive(child);

      if (textRuns.length === 0) return null; 

      const styles = child.nodeType === Node.ELEMENT_NODE ? window.getComputedStyle(child) : null;
      let alignment = AlignmentType.LEFT; 
      if (styles) {
        if (styles.textAlign === "center") alignment = AlignmentType.CENTER;
        else if (styles.textAlign === "right") alignment = AlignmentType.RIGHT;
      }

      return new Paragraph({
        children: textRuns,
        alignment,
      });
    });

    const doc = new Document({
      sections: [
        {
          children: paragraphs.filter((p) => p !== null),
        },
      ],
      background: {
        color: `${downloadPageColor}`,
      },
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "formatted_document.docx");
    });
  };

  const extractColor = (color) => {
    if (color.startsWith("rgb")) {
      return rgbToHex(color);
    }
    return color.replace("#", "").toUpperCase();
  };

  const handleKeyPress = (e) => {
    if(e.code === 'KeyS' && e.altKey){
      downloadDocx();
    }
  };

  const handleModal = () => {
    setModal(prev => !prev);
  }

  const insertText = (text) => {
    if (textInputRef.current) {
      textInputRef.current.innerHTML += text;
    }
  };

  return (
    <div className="containertxt">
      <div className="optionstxt">
        {/* Toolbar Buttons */}
        <button title="Back" className="option-button" onClick={() => navigate("/dashboard")}>
          <i style={{color: "red", fontSize: "35px"}} className="bx bx-x" />
        </button>
        <button id="Bold" title="bold" className="option-button format">
          <i className="fa-solid fa-bold"></i>
        </button>
        <button id="undo" title="Undo" className="option-button">
          <i className="fa-solid fa-rotate-left"></i>
        </button>
        <button id="redo" title="Redo" className="option-button">
          <i className="fa-solid fa-rotate-right"></i>
        </button>
        <button id="createLink" title="Create-Link" className="adv-option-button">
          <i className="fa fa-link"></i>
        </button>
        <button id="unlink" title="Delete-Link" className="option-button">
          <i className="fa fa-unlink"></i>
        </button>
        <button id="justifyLeft" title="Left-Align" className="option-button align">
          <i className="fa-solid fa-align-left"></i>
        </button>
        <button id="justifyCenter" title="Centering" className="option-button align">
          <i className="fa-solid fa-align-center"></i>
        </button>
        <button id="justifyRight" title="Right-Align" className="option-button align">
          <i className="fa-solid fa-align-right"></i>
        </button>
        <button id="justifyFull" title="Justification" className="option-button align">
          <i className="fa-solid fa-align-justify"></i>
        </button>
        <select id="fontName" title="Font Styles" className="adv-option-button"></select>
        <select id="fontSize" title="Font-Size" className="adv-option-button"></select>
        <div className="input-wrapper">
          <input type="color" title="Click to Change" id="foreColor" className="adv-option-button" />
          <label htmlFor="foreColor">Font Color</label>
        </div>
        <div className="input-wrapper">
          <input title="Click to Change" type="color" id="backColor" className="adv-option-button" />
          <label htmlFor="backColor">Page Color</label>
        </div>
        <button id="savebutton" title="Download" style={{backgroundColor: "rgb(46,121,220)",
                                border: "none",
                                color: "white",
                                padding: "5px",
                                fontSize: "17px",
                                marginRight: "5px"}} onClick={downloadDocx}><i className="bx bx-save"/></button>

        <img 
          title="Write using AI" 
          src={assets.gemini_icon} 
          className="aibutton"
          onClick={handleModal}
          style={{cursor: "pointer"}}
        />
      </div>
      {modal ?
        <Modal insertText={insertText} />
        :
        <div id="text-input" ref={textInputRef} spellCheck={false} onKeyDown={handleKeyPress} contentEditable="true"></div>
      }
    </div>
  );
};

export default TextEditor;