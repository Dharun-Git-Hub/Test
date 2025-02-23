import React from "react";

import ClearSky from './Icons/ClearSky.png';
import Clouds from './Icons/Clouds.png';
import FewClouds from './Icons/FewClouds.png';
import Rain from './Icons/Rain.png';
import Snow from './Icons/Snow.png';
import Mist from './Icons/Mist.png';
import Drizzle from './Icons/drizzle.png'

function WeatherIcon ({ weatherData })  {
  const weatherIcons = {
    "Clear": ClearSky,
    "Clouds": Clouds,
    "Few Clouds": FewClouds,
    "Rain": Rain,
    "Snow": Snow,
    "Mist": Mist,
    "Fog": Mist,
    "Haze": Mist,
    "Drizzle": Drizzle,
    "Smoke": Clouds,
  };

  const weatherMain = weatherData.weather[0].main;
  const iconSrc = weatherIcons[weatherMain];

  return (
    <div className="weatherIcon">
      <img title={weatherMain} src={iconSrc} alt={weatherMain} />
    </div>
  );
}

export default WeatherIcon;