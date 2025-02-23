import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./Chat.css";

const Chats = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState({});
  const [ampm, setAmPm] = useState("AM");
  const [news, setNews] = useState([]); 
  const [yes, setYes] = useState(true);


useEffect(() => {
  const currentDateKey = `news-${new Date().toISOString().split('T')[0]}`;
  
  const savedNews = localStorage.getItem(currentDateKey);
  
  if (savedNews) {
    setNews(JSON.parse(savedNews));
  } else {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=056a972faf6741b1ba63508beb4bd986');
        const fetchedNews = response.data.articles;

        localStorage.setItem(currentDateKey, JSON.stringify(fetchedNews));
        setYes(true);
        setNews(fetchedNews);
      } catch (error) {
        setYes(true);
        console.error("Error fetching news:", error);
      }
    };
    
    fetchNews();
  }

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('news-') && key !== currentDateKey) {
      localStorage.removeItem(key);
    }
  });

}, []); 

  return (
    <div className="main-body">
      <div className="body-cal year">
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
          Previous
        </button>
        <span>{currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</span>
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
          Next
        </button>
      </div>

      <div className="body-cal goto">
        <label htmlFor="dateInput">Go to date: </label>
        <input
          type="date"
          id="dateInput"
          onChange={(e) => setCurrentDate(new Date(e.target.value))}
          value={currentDate.toISOString().split("T")[0]}
        />
      </div>

      <div className="body-cal calendar" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const hasTask = Object.keys(tasks).some(taskDate => taskDate.startsWith(date.toDateString()));

          return (
            <div
              key={i}
              style={{
                padding: "10px",
                textAlign: "center",
                border: "0.5px solid #333",
                backgroundColor: date.toDateString() === new Date().toDateString() ? "#ff2976" : "transparent",
                color: "white",
                cursor: "pointer",
                position: "relative",
              }}
            >
              {i + 1}

              {hasTask && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "#ff2976",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "5px",
                    left: "90%",
                    transform: "translateX(-50%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>


      {/* News Section */}
      <div className="news-section">
        <ul className="ul-tabs">
          
          {yes && news.map((article, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1CAAFF" }}>
                {article.title}
              </a>
              <p style={{ color: "#fff" }}>{article.description}</p>
            </li>
          ))}
          <p style={{ color: "#fff" }}>{!yes?"No news available":null}</p>
        </ul>
      </div>
    </div>
  );
};

export default Chats;
