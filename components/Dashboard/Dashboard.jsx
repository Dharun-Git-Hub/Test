import React, { useEffect, useState, useRef, useContext } from 'react';
import Chat from '../Chat/Chat'
import Alarm from '../Alarm/Alarm'
import { useNavigate } from 'react-router-dom';
import { TiWeatherWindy } from "react-icons/ti";
import { BsSearch } from "react-icons/bs";
import { FaLocationDot } from "react-icons/fa6";
import { AiFillCloud } from 'react-icons/ai';
import { UserContext } from '../../UserContext/UserContext';


import WeatherCSS from "./Weather.module.css";
import WeatherIcon from "./WeatherIcon";
import { assets } from '../../assets/assets';

import './Dashboard.css';

const Dashboard = () => {
  const { setUsername, username } = useContext(UserContext);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const [previous, isPrev] = useState(0);
  const currentIndex = [0, 1, 2, 3, 4, 5];
  const cardRefs = useRef([]);
  const [city, setCity] = useState(localStorage.getItem("city") || "Madurai");
  const [weatherData, setWeatherData] = useState(null);
  const [ isMob , setMob ] = useState(false);
  const [ shallDisplay , shallWeDisplay ] = useState(false);
  const weatherRef = useRef(null);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  
  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      setUsername(JSON.parse(loggedInUser));
    }
    else{
      setUsername("Guest");
    }
    fetchWeather(city);
  }, [setUsername, city]);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: false });
      setCurrentTime(currentTime);
    }, 1000);
  });

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return;

    try {
      const apiKey = "823518edc4bac84c6f01daee967901fb";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`
      );
      if (!response.ok) throw new Error("Failed to fetch weather data");
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  const changeCity = () => {
    const cityName = weatherRef.current?.value.trim();
    if (cityName) {
      setCity(cityName);
      localStorage.setItem("city", cityName);
      fetchWeather(cityName); 
    }
  };

  useEffect(()=>{
    const handleResize = () => {
      const newWidth = window.innerWidth;
      if(newWidth<=1300){
        setMob(true);
        if(newWidth<=1000){
        shallWeDisplay(true);
      }
      else{
        shallWeDisplay(false);
      }
      }
      else{
        setMob(false);
      }
    };
    window.addEventListener('resize',handleResize);
    window.addEventListener('onload',handleResize);
    return () => { 
      window.removeEventListener('resize', handleResize); 
    };
  },[]);
  const cardNames = [
    'AI Assistant', 'Text Editor', 'Live-Code Tool', 'Maps & AI', 
    'Have some Vibe !'
  ];

  const images = [
    assets.card_ai, assets.card_editor, assets.card_coder, 
    assets.card_maps, assets.card_music
  ];

  const cardBacks = [
    '#1C3F49', '#61dafbaa', '#646cffaa', '#F4B90E', 
    '#D50912'
  ];

  const routes = [
    "/main", "/text-editor", "/coding", "/maps", "/musicplayer"
  ];

  const handleNext = () => {
    const scrollContainer = scrollContainerRef.current;
    const targetIndex = Math.min(activeCardIndex + 1, scrollContainer.children.length - 1);
    const targetScroll = targetIndex * inc;
    scrollContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
    setActiveCardIndex(targetIndex);
    isPrev(previous + 1);
  };
  const inc = isMob ? 200 : 400 ;
  const handleWheelScroll = (e) => {
  e.preventDefault();
  const scrollContainer = scrollContainerRef.current;
  const targetIndex = e.deltaY > 0 
    ? Math.min(activeCardIndex + 1, scrollContainer.children.length - 1) 
    : Math.max(activeCardIndex - 1, 0);

  if (targetIndex < 8) {
    const targetScroll = targetIndex * inc;
    scrollContainer.scrollTo({ 
      left: targetScroll, behavior: 'smooth'
    });
    setActiveCardIndex(targetIndex);
  }
  else {
    const targetScroll = 0;
    scrollContainer.scrollTo({ 
      left: targetScroll, behavior: 'smooth'
    });
    setActiveCardIndex(0);
  }

};

   const handleTouchStart = (e) => {
    const touch = e.touches[0];
    scrollContainerRef.current.startX = touch.clientX;
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const scrollContainer = scrollContainerRef.current;
    const diffX = scrollContainer.startX - touch.clientX;

    if (diffX > 50) {
      // Swipe left
      const targetIndex = Math.min(activeCardIndex + 1, scrollContainer.children.length - 1);
      const targetScroll = targetIndex * inc;
      scrollContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setActiveCardIndex(targetIndex);
    } else if (diffX < -50) {
      // Swipe right
      const targetIndex = Math.max(activeCardIndex - 1, 0);
      const targetScroll = targetIndex * inc;
      scrollContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setActiveCardIndex(targetIndex);
    }
  };


  const handlePrev = () => {
    if (activeCardIndex > 0) {
      const scrollContainer = scrollContainerRef.current;
      const targetIndex = Math.max(activeCardIndex - 1, 0);
      const targetScroll = targetIndex * inc;
      scrollContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setActiveCardIndex(targetIndex);
      isPrev(previous - 1);
    }
  };

    const handleSignOut = async () => {

        try {
            const usr = {username};

            const response = await fetch('https://messy-efficacious-bay.glitch.me/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ usr }),
            });

            const data = await response.json();

            if (response.status === 200) {
                localStorage.removeItem("loggedInUser");
                setUsername('');
                navigate("/");
            } else {
                alert("Error");
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Something went wrong while logging out');
            localStorage.removeItem("loggedInUser");
                setUsername('');
                navigate("/");
        }
    };

  useEffect(() => {
    if(!isMob){
    const scrollContainer = scrollContainerRef.current;
    scrollContainer.addEventListener('wheel', handleWheelScroll);

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheelScroll);
    };
  }
  else{}
  },[isMob,activeCardIndex]);

  return (
    <div className="dashcont">
      <div className="dashsidebar">
        <div className="dashupperside">
          <div className="logo">
            <img title={username} src={assets.user_icon} alt="Logo" />
          </div>
          <span id="dashwelcome" style={{ marginRight: "10px", color:"white",}} alt="<Username>">{username}</span>
        </div>
        <div className="dashcenter">
          <div className="dashselector home" onClick={() => navigate("/dashboard")}>Home</div>
          <div className="dashselector" onClick={() => navigate("/main")}>AI Assistant</div>
          <div className="dashselector" onClick={() => navigate("/text-editor")}>Text Editor</div>
          <div className="dashselector" onClick={() => navigate("/musicplayer")}>Music</div>
          <div className="dashselector" onClick={() => navigate("/coding")}>Live - Code</div>
        </div>
        <div className="dashfooter">
          <span id="dashsignout" onClick={ handleSignOut }>Sign Out</span>
        </div>
      </div>
      <div className="dashmainarea">


{isMob ?


<div className="dashscrollcardsmob">
          {Array.from({ length: 6 }).map((_, index) => {
            const cardName = cardNames[index] || `MATE Version : ${index - cardNames.length + 1}`;
            const cardImage = images[index] || assets.defaultImage;
            const cardBack = cardBacks[index] || "#61dafbaa";
            const route = routes[index] || "/dashboard";
            const ind = currentIndex[index] || 1;
            return (
              <div
                key={index}
                style={{
                  float: 'right',
                  background: `url(${cardImage}) no-repeat center center`,
                  backgroundSize: 'cover',
                  color: 'whitesmoke',
                  filter: `drop-shadow(0 0 1.5em #1C3F49)`,
                }}
                className={`dashscrollcardmob active`}
                onClick={() => navigate(`${route}`)}
                ref={(el) => (cardRefs.current[index] = el)}
              >
                <span style={{ background: `linear-gradient(to right,${cardBack},transparent)` }}>
                  <div id={cardName} className="summa">{cardName}</div>
                </span>
              </div>
            );
          })}
        </div>
        :

        <div className="dashscrollcards" ref={scrollContainerRef}>
        {activeCardIndex < 6 && <div className="nextButton" onClick={handleNext}>Next</div>}
          {activeCardIndex > 0 && <div className="prevButton" onClick={handlePrev}> Back </div>}
          {Array.from({ length: 6 }).map((_, index) => {
            const cardName = cardNames[index] || `MATE Version : ${index - cardNames.length + 1}`;
            const cardImage = images[index] || assets.defaultImage;
            const cardBack = cardBacks[index] || "#61dafbaa";
            const route = routes[index] || "/dashboard";
            const ind = currentIndex[index] || 1;
            return (
              <div
                key={index}
                style={{
                  float: 'right',
                  background: `url(${cardImage}) no-repeat center center`,
                  backgroundSize: 'cover',
                  color: 'whitesmoke',
                  filter: `drop-shadow(0 0 1.5em #1C3F49)`,
                }}
                className={`dashscrollcard ${index === activeCardIndex ? 'active' : 'inactive'}`}
                onClick={() => navigate(`${route}`)}
                ref={(el) => (cardRefs.current[index] = el)}
              >
                <span style={{ background: `linear-gradient(to right,${cardBack},transparent)` }}>
                  <div id={cardName} className="summa">{cardName}</div>
                </span>
              </div>
            );
          })}
        </div>
        }

        <div className="dashmaindown">
        <Chat/>

        <div className="weathercards">

          <div className={WeatherCSS.weatherBlock}>
            {weatherData && (
                <>
                    <div className={WeatherCSS.cityName}>
                        <h2>{weatherData.name}</h2>
                    </div>

                    <div className={WeatherCSS.weatherIcon}>
                        <WeatherIcon weatherData={weatherData} />
                        {weatherData.weather && weatherData.weather[0] && (
                            <p>{weatherData.weather[0].description.toUpperCase()}</p>
                        )}
                    </div>

                    <div className={WeatherCSS.weatherInfoBlock}>
                        {weatherData.main && (
                            <h1>°C {(weatherData.main.temp - 273).toFixed(0)}</h1>
                        )}

                        <div className={WeatherCSS.weatherInfo}>
                            {weatherData.wind && (
                                <p>
                                    <TiWeatherWindy />
                                    Wind: {weatherData.wind.speed.toFixed(0)} m/s
                                </p>
                            )}

                            {weatherData.clouds && (
                                <p>
                                    <AiFillCloud /> 
                                    Cloudy: {weatherData.clouds.all}%
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
            <div className={WeatherCSS.cityInput}>
                <FaLocationDot className={WeatherCSS.locationIcon}/>

                <input ref={weatherRef} onKeyDown={(e)=>{
                  if(e.key === 'Enter'){
                    changeCity();
                  }
                }} />

                <button onClick={changeCity}>
                    <BsSearch />
                </button>
            </div>
        </div>

        </div>

      </div>
      <div className="dashupcont">
      {shallDisplay?<div className="logomob">
            <img title={username ? username : "Null"} src={assets.user_icon} alt="Logo" />
          </div>:null}
      
        <textarea placeholder="Image to Word" onClick={()=>navigate("/scanner")}/>
        <Alarm id="Alarmref"/>
        {currentTime}
       {shallDisplay?<div onClick={ handleSignOut } title="Log Out">
        <i className="bx bx-popsicle" style={{color: "white", fontSize: "20px"}}/>
        </div>:null} 
      </div>
    </div>
        </div>
        
  );
};

export default Dashboard;
