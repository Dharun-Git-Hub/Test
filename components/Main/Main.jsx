import React, { useState, useContext, useRef, useEffect } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext/UserContext';

const Main = () => {
  const { username, setUsername } = useContext(UserContext);
  const { onSent, recentPrompt, showResult, loading, resultData, setInput, input, onSentMaps, setRecentPrompt, setPrevPrompts } = useContext(Context);
  const inputRef = useRef(null);
  const [mic, setMic] = useState(false);
  const textarearef = useRef(null);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      setUsername(JSON.parse(loggedInUser)); 
    }
  }, [setUsername]);

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && input) {
      if (input.startsWith('@maps ')) {
        const place = input.substring(6).trim();
        if (place) {
          onSentMaps();
          const textarea = inputRef.current;
          textarea.style.height="20px";
        }
      } else {
        if(e.key === 'Enter' && e.shiftKey){
          if(!input)
          setInput('');
        }
          else
        onSent();
      const textarea = inputRef.current;
      textarea.style.height="20px";
      }
    }
  };

  const handleSendAI= () => {
    if(input){
      if(input.startsWith("@maps")){
        onSentMaps();
      }
      else{
        onSent();
      }
    }
  };

  const invokeMaps = async (place) => {
    const coords = await getCoordinates(place);
    if (coords) {
        navigate('/maps', { state: { coords } });
    } else {
        const url = `https://www.google.co.in/maps/search/?api=1&query=${encodeURIComponent(place)}`;
        window.open(url, '_blank');
        return null;
    }
};


  const getCoordinates = async (placeName) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
      }
      else{
        return false;
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return false;
    }
  };

  const handleCard = (newValue) => {
    if (inputRef.current) {
      inputRef.current.value = newValue;
    }
    setInput(newValue);
  };

  const handleInput = () => {
  const txtarea = inputRef.current;
  if (txtarea) {
    txtarea.style.height = '40px';
    if (txtarea.value.trim() !== '') {
      txtarea.style.height = `${txtarea.scrollHeight}px`;
    }
  }
};


  const handleKeyShort = (e) => {
    if (e.code === 'KeyH' && e.ctrlKey && e.shiftKey) {
    e.preventDefault();
    navigate("/dashboard");
  }
  else if ( e.code==='KeyM' && e.altKey && e.shiftKey){
    e.preventDefault();
    navigate("/maps");
  }
};

useEffect(() => {
  if (dark) {
    document.documentElement.style.setProperty('--background-color', 'black');
    document.documentElement.style.setProperty('--color', 'white');
    document.documentElement.style.setProperty('--dark-hover', 'white');
    document.documentElement.style.setProperty('--dark-clr', 'black');
    document.documentElement.style.setProperty('--input-border', '0.2px solid grey');
    document.documentElement.style.setProperty('--card-back', 'black');
    document.documentElement.style.setProperty('--sidebar-color', '#121212');
  } else {
    document.documentElement.style.setProperty('--background-color', 'white');
    document.documentElement.style.setProperty('--color', 'black');
    document.documentElement.style.setProperty('--dark-hover', 'black');
    document.documentElement.style.setProperty('--dark-clr', 'white');
    document.documentElement.style.setProperty('--input-border', 'none');
    document.documentElement.style.setProperty('--card-back', '#f0f4f9');
    document.documentElement.style.setProperty('--sidebar-color', '#f0f4f9');
  }
}, [dark]);

useEffect(() => {
  if (resultData && mic) {
    window.speechSynthesis.cancel();
    const ress = resultData.split('</br>');
    const resultData1 = ress.join(' ');
    const utterance = new SpeechSynthesisUtterance(resultData1);
    window.speechSynthesis.speak(utterance);
  } else {
    window.speechSynthesis.cancel();
  }
}, [resultData, mic]);

useEffect(() => {
 const boldElements = document.querySelectorAll('.makeblue'); 
 boldElements.forEach(element => { 
  element.addEventListener('click', handleBold); 
});
 return () => { 
  boldElements.forEach(element => { element.removeEventListener('click', handleBold); 
}); 
};
 }, [resultData]); 


const handleBold = (event) => {
 const destination = event.target.textContent;
  if (destination) {
   invokeMaps(destination); 
 }
  };

  return (
    <div className="main">
      <div className="nav">
        <p>AI Assistant</p>
        <div>
          <img id="mobileDp" onClick={() => setDark((prev) => !prev)} src={assets.moon_icon} />
          <img className="image" src={assets.user_icon} alt="" />
        </div>
      </div>
      <div className="main-container">
        {!showResult ? (
          <>
            <div className="greet">
            {username ? <p><span>Hii, {username} !</span></p>
            :
            <p><span>Hii !</span></p>
          }
              
              <p>How can I help you?</p>
            </div>
            <div className="cards">
              <div onClick={() => handleCard("What about today ?")} className="card">
                <p>What about today ?</p>
                <img src={assets.compass_icon} alt="" />
              </div>
              <div onClick={() => handleCard("What is AI ?")} className="card">
                <p>What is AI ?</p>
                <img src={assets.bulb_icon} alt="" />
              </div>
              <div onClick={() => handleCard("How an AI will be useful for Human ?")} className="card1">
                <p>How an AI will be useful for Human ?</p>
                <img src={assets.message_icon} alt="" />
              </div>
              <div onClick={() => handleCard("Shall we do some Math or Code ?")} className="card1">
                <p>Shall we do some Math or Code ?</p>
                <img src={assets.code_icon} alt="" />
              </div>
            </div>
          </>
        ) : (
          <div className="result">
            <div className="result-title">
              <img src={assets.user_icon} alt="" />
              <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
              <img src={assets.gemini_icon} alt="" />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <p id="res-data" dangerouslySetInnerHTML={{ __html: resultData }}></p>
              )}
            </div>
          </div>
        )}
        <div className="main-bottom">
          <div className="search-box">
            <textarea
              className="in"
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              value={input}
              type="text"
              placeholder="Enter a prompt here..."
              onInput={handleInput}
              ref={inputRef}
              onKeyDown={handleKeyShort}
            />
            <div style={{ userselect: 'none' }}>
              <i title="Clear Input" className="bx bx-trash" style={{fontSize:"20px", color:"grey"}} onClick={()=>setInput('')}/>
              {!mic ? (
                <img title="Speak" onClick={() => setMic((prev) => !prev)} src={assets.speaker_icon} alt="" />
              ) : (
                <img title="Stop-Speak" onClick={() => setMic((prev) => !prev)} src={assets.speaker_on} alt="" />
              )}
              {input ? (
                <img onClick={handleSendAI} src={assets.send_icon} alt="" />
              ) : null}
            </div>
          </div>
          <p className="bottom-info">
            Here is your AI Assistant !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Main;
