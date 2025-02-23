import React, { useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { CodeContext } from "../../CodeProvider/CodeContext";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'

import 'boxicons/css/boxicons.min.css';

import './Main2.css';

const Main2 = () => {
  const [ theme, setTheme ] = useState('light_theme');
  const { codeInput, askedHelp } = useContext(CodeContext);
  const [currentMessage, setCurrentMessage] = useState('');
  const [copyState, setCopyState ]=useState("Copy");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [headerVisible, setHeaderVisible] = useState(true);
  const maxRef = useRef(null);

  const API_KEY = 'AIzaSyBN4n3or1shaEe4TW4dFZJ7Qe7xpDlYR-g';
  const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  useEffect(() => {
    const savedConversations = JSON.parse(localStorage.getItem('saved-api-chats')) || [];
    setChatHistory(savedConversations);
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('saved-api-chats', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

    useEffect(() => {
    if (codeInput) {
      setCurrentMessage(`${codeInput}\n\nCould you traverse this code and explain, give suggestions, and rectify errors if any?`);
    }
  }, [codeInput]);

  /*
  useEffect(() => {
    document.body.classList.toggle('light_mode', theme === 'light_mode');
    document.body.classList.toggle('dark_mode', theme === 'dark_mode');
  }, [theme]);
  */

/*
  const toggleTheme = () => {
    const newTheme = theme === 'light_mode' ? 'dark_mode' : 'light_mode';
    setTheme(newTheme);
  };
  */

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      localStorage.removeItem('saved-api-chats');
      setChatHistory([]);
      setHeaderVisible(true);
    }
  };

  const handleCopyTimeout= ()=>{
    setCopyState('Copied');
    setTimeout(()=>{
      setCopyState('Copy');
    },2000)
  }

useEffect(()=>{
  handleInput();
},[]);

const handleInput = () => {
  const txtarea = maxRef.current;
  if (txtarea) {
    txtarea.style.height = '40px';
    if (txtarea.value.trim() !== '') {
      txtarea.style.height = `${txtarea.scrollHeight}px`;
    }
  }
};

const handleTheme = () =>{
  if(theme==="light_theme"){
    setTheme("dark_theme");
  }
  else{
    setTheme("light_theme");
  }
};

const handleCuts = (e) => {
  if (e.key === 'Enter' && e.shiftKey) {
  } else if (e.key === 'Enter') {
    e.preventDefault();
    handleSendMessage();
  }
};

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGeneratingResponse) return;

    setIsGeneratingResponse(true);
    setHeaderVisible(false);

    const newMessage = { userMessage: currentMessage, apiResponse: null };
    setChatHistory((prevHistory) => [...prevHistory, newMessage]);
    setCurrentMessage('');
    if (maxRef.current) maxRef.current.style.height = '40px';

    try {
      const response = await fetch(API_REQUEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: currentMessage }] }]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from API';

      setChatHistory((prevHistory) => {
        const updatedHistory = [...prevHistory];
        updatedHistory[updatedHistory.length - 1] = {
          ...updatedHistory[updatedHistory.length - 1],
          apiResponse: { text: responseText, parsedText: responseText }
        };
        return updatedHistory;
      });
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const renderResponseWithCodeBlocksAndBold = (text) => {
  const regex = /(```[\s\S]*?```)|(\*\*(.*?)\*\*)/g; 
  const parts = text.split(regex); 

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3);
      const highlightedCode = hljs.highlightAuto(code).value; 
      return (
        <div key={index} className="code-block-wrapper">
          <pre>
            <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          </pre>
          <button className="copy-button" onClick={() => {navigator.clipboard.writeText(code);
          handleCopyTimeout();}}>
            {copyState}
          </button>
        </div>
      );
    } else if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2); 
      return (
        <strong key={index} className="bold-text">
        <br/>
          {boldText}
        </strong>
      );
    } else if (regex.test(part)) {
      return null;
    } else {
      return (
        <span style={{ color: "#fff" }} key={index}>
          {part}
        </span>
      );
    }
  });
};

  const handleSpanClick = (e) => {
    if (e.target && e.target.classList.contains('word-span')) {
      alert(`You clicked on: ${e.target.innerText}`);
    }
  };

  const handleSendClick = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

 const chatMessages = chatHistory.map((msg, index) => (
  <div key={index} className="chat-pair">
    <div style={{backgroundColor: theme && theme === "light_theme" ? "#fff" : "#333"}} className="message message--outgoing">
      <div className="message__content">
        <p className="message__text">{msg.userMessage}</p>
      </div>
    </div>
    {msg.apiResponse && (
      <div style={{backgroundColor: theme && theme === "light_theme" ? "#fff" : "#333"}} className="message message--incoming">
        <div className="message__content">
          <div className="message__text">
            {renderResponseWithCodeBlocksAndBold(msg.apiResponse.parsedText)}
          </div>
        </div>
      </div>
    )}
  </div>
));



  return (
    <div className="gen2" style={{ display : askedHelp ? "flex" : "none"}}>
      <nav className="navbar">
        <h3 className="navbar__logo">Mini AI</h3>
        <button title={theme === 'light_mode' ? 'Dark Mode' : 'Light Mode'} className="navbar__button" onClick={handleTheme}>
          <i className={`bx ${theme === 'light_mode' ? 'bx-moon' : 'bx-sun'}`} style={{color: "white"}}/>
        </button>
      </nav>
      <section className="chat-section" style={{backgroundColor: theme && theme === "light_theme" ? "#fff" : "#333"}} onClick={handleSpanClick}>
        <div className="header__greeting"><b>Hello There !</b></div>
        {chatMessages}
      </section>
      <section className="input-section" style={{backgroundColor: theme && theme === "light_theme" ? "#fff" : "#333"}}>
        <form className="input-form" onSubmit={handleSendClick}>
          <div className="input-wrapper" style={{backgroundColor: theme && theme === "light_theme" ? "#fff" : "#333"}}>
            <textarea
              ref={maxRef}
              type="text"
              placeholder="Prompt....."
              className="input-field"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleCuts}
              onInput={handleInput}
              style={{backgroundColor: theme && theme === "light_theme" ? "#fff" : "#1f1f1f",
                          color: theme && theme === "light_theme" ? '#333' : "#fff"}}
              required
            />
            <button title="Send" type="submit" className="send-button"><i className="bx bx-send" style={{color: "white"}} /></button>
            <button title="Clear Chat" type="button" className="clear-button" onClick={handleClearChat}><i className="bx bx-trash" /></button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Main2;
