import React, { useContext, useState, useEffect, useRef } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import { UserContext } from '../../UserContext/UserContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [extended, setExtended] = useState(true);
  const { username } = useContext(UserContext);
  const { onSent, prevPrompts, setRecentPrompt, newChat, setPrevPrompts, onSentMaps} = useContext(Context);
  const [dark, setDark] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);


  const loadPrompt = async (prompt) => {
    setRecentPrompt(prompt);
    if(prompt.startsWith("@maps")){
      await onSentMaps(prompt);
    }
    else{
      await onSent(prompt);
    }
  };
  const navigate = useNavigate(); 
  const elementRef = useRef(null);

  const handleClearHistory = (index = null) => {
    if (index !== null) {
      
      const updatedPrevPrompts = prevPrompts.filter((_, i) => i !== index);
      setPrevPrompts(updatedPrevPrompts);
      
      localStorage.setItem('prevPrompts', JSON.stringify(updatedPrevPrompts));
      newChat();
    } else {
      
      setPrevPrompts([]);
      localStorage.removeItem('prevPrompts');
      newChat();
    }
  };

  
  useEffect(() => {
    const storedPrompts = localStorage.getItem('prevPrompts');
    if (storedPrompts) {
      setPrevPrompts(JSON.parse(storedPrompts));
    }
  }, [setPrevPrompts]);

  useEffect(() => {
    if (dark) {
      document.documentElement.style.setProperty('--background-color', 'black');
      document.documentElement.style.setProperty('--color','white');
      document.documentElement.style.setProperty('--dark-hover','white');
      document.documentElement.style.setProperty('--dark-clr','black');
      document.documentElement.style.setProperty('--input-border','0.2px solid grey');
      document.documentElement.style.setProperty('--card-back','black');
      document.documentElement.style.setProperty('--sidebar-color','#242424');
      if (elementRef.current) {
        elementRef.current.innerText = 'Light';
      }
    } else {
      document.documentElement.style.setProperty('--background-color', 'white');
      document.documentElement.style.setProperty('--color','black');
      document.documentElement.style.setProperty('--dark-hover','black');
      document.documentElement.style.setProperty('--dark-clr','white');
      document.documentElement.style.setProperty('--input-border','none');
      document.documentElement.style.setProperty('--card-back','#f0f4f9');
      document.documentElement.style.setProperty('--sidebar-color','rgb(240,244,249)');
      if (elementRef.current) {
        elementRef.current.innerText = 'Dark';
      }
    }
  }, [dark]);

  return (
    <div className='sidebar'>
      <div className="top">
        <img onClick={() => setExtended(prev => !prev)} className='menu' src={assets.menu_icon} alt="Menu" title="Shrink/Extend"/>
        <div title="New Chat" onClick={() => newChat()} className="new-chat">
          <img src={assets.plus_icon} alt=""/>
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent
            <i
                  className="bx bx-trash"
                  id="dltall"
                  onClick={() => handleClearHistory()}
                  title="Delete"
                  style={{marginLeft: "40px"}}
                ></i>
            </p>
    {prevPrompts.filter(Boolean).map((item, index) => (
  <div
    onMouseEnter={() => setHoveredIndex(index)}
    onMouseLeave={() => setHoveredIndex(null)}
    onClick={() => loadPrompt(item)} 
    key={index}
    className="recent-entry"
  >
    <img src={assets.message_icon} alt="" />
    <p
      key={index}
      className="hover-transition"
      style={{
        color: hoveredIndex === index ? 'blue' : "grey",
      }}
    >
      {hoveredIndex === index ? item : `${item.slice(0, 7)} ...`}
    </p>
    <i
      className="bx bx-trash"
      key={`trash-${index}`}
      onClick={(e) => {
        e.stopPropagation();
        handleClearHistory(index);
      }}
    />
  </div>
))}



          </div>
        ) : null}
      </div>
      <div className="bottom">
      <div title="Other Tools" onClick={() => navigate("/dashboard")} className="bottom-item recent-entry">
          <i className='bx bx-home' style={{fontSize:"1.3rem", color:"grey"}}/>
          {extended ? <p>Home</p> : null}
        </div>
        <div title="History" onClick={() => setExtended(prev => !prev)} className="bottom-item recent-entry">
        <i className='bx bx-history' style={{fontSize:"1.3rem", color:"grey"}}/>
          {extended ? <p>Activity</p> : null}
        </div>
        <div title="AI Image Generator" onClick={() => navigate("/imagegen")} className="bottom-item recent-entry">
        <i className='bx bx-camera' style={{fontSize:"1.3rem", color:"grey"}}/>
          {extended ? <p>Image-Gen</p> : null}
        </div>
        <div title="Dark Mode" onClick={() => setDark(prev => !prev)} className="bottom-item hover-dark">
        <i className={!dark?'bx bx-moon':'bx bx-sun'} style={{fontSize:"1.3rem", color:"grey"}}/>
          {extended ? <p className="x" ref={elementRef}>Dark</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
