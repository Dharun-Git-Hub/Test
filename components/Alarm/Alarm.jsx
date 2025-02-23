import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets'
import './Alarm.css';

const Alarm = () => {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: true }));
  const [hourInput, setHourInput] = useState('');
  const [minuteInput, setMinuteInput] = useState('');
  const [alarmsArray, setAlarmsArray] = useState([]);
  const alarmSound = new Audio(assets.alarm_mp3);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour12: true });
      setCurrentTime(currentTime);
      alarmsArray.forEach((alarm) => {
        if (alarm.isActive && alarm.time === currentTime.slice(0, 5)) {
          alarmSound.play();
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [alarmsArray]);

  const appendZero = (value) => (value < 10 ? '0' + value : value);

  const createAlarm = (hour, minute) => {
    const alarmObj = {
      id: `${alarmsArray.length + 1}_${hour}_${minute}`,
      time: `${appendZero(hour)}:${appendZero(minute)}`,
      isActive: false,
    };

    setAlarmsArray([...alarmsArray, alarmObj]);
  };

  const toggleAlarm = (alarm) => {
    const updatedAlarms = alarmsArray.map((a) =>
      a.id === alarm.id ? { ...a, isActive: !a.isActive } : a
    );
    setAlarmsArray(updatedAlarms);
    if (alarm.isActive) {
      alarmSound.pause();
    }
  };

  const deleteAlarm = (alarm) => {
    const updatedAlarms = alarmsArray.filter((a) => a.id !== alarm.id);
    setAlarmsArray(updatedAlarms);
  };

  const handleSetAlarm = () => {
    const hour = parseInt(hourInput) || 0;
    const minute = parseInt(minuteInput) || 0;

    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      alert('Invalid hour or minute. Please enter values within the valid range!');
      return;
    }

    if (!alarmsArray.some((alarm) => alarm.time === `${appendZero(hour)}:${appendZero(minute)}`)) {
      createAlarm(hour, minute);
    }

    setHourInput('');
    setMinuteInput('');
  };

  const handleClearAll = () => {
    setAlarmsArray([]);
  };

  return (
    <div className="wrapper">
      <div className="current-time">{currentTime}</div>
    </div>
  );
};

export default Alarm;
