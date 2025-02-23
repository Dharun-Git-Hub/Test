import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext/UserContext';
import { Asset } from './Assets/Asset';
import { assets } from '../../assets/assets';
import './Login.css';

const Login = () => {
  const { setUsername } = useContext(UserContext);
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showLoginAnimation, setLoginAnimation] = useState(false);
  const [loginClicked, setLoginClicked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser && isOnline) {
      setUsername(JSON.parse(loggedInUser));
      navigate('/dashboard');
    }
  }, [setUsername, navigate]);

  const handleSubmit = async (e) => {
    try{
    e.preventDefault();
    if (username !== '') {
      setLoginClicked(true);
      const response = await fetch('https://messy-efficacious-bay.glitch.me/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        localStorage.removeItem('loggedInUser');
        setUserName(username);
        localStorage.setItem('loggedInUser', JSON.stringify(username));
        setLoginAnimation(true);
        setTimeout(()=>{
          navigate('/dashboard', { state: { username } });
        },2000);
        setLoginClicked(false);
      } else {
        alert('Invalid Username or Password');
        setLoginClicked(false);
      }
    } else {
      alert('Please check out the fields first!');
    }
  }
  catch(error){
    alert("Server Not Available ! Please try agian later.");
    setLoginClicked(false);
  }
  };

  const handleSignUp = () => {
    setShowAnimation(true);
    setTimeout(() => {
      navigate('/signup');
    }, 2000);
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center lg:grid lg:grid-cols-2">
      <img
        id="pngg"
        src={Asset.wave_icon}
        className="fixed hidden lg:block inset-0 h-full"
        style={{ zIndex: -1 }}
        alt="Wave"
      />
      <img
        src={Asset.unlock_icon}
        id="imagefor"
        className="hidden lg:block w-1/2 hover:scale-150 transition-all duration-500 transform mx-auto"
        alt="Unlock"
      />
      {isOnline ? (
        loginClicked ? null :
        <form id="firm" className="flex flex-col justify-center items-center w-1/2" onSubmit={handleSubmit}>
          <img src={assets.avatar_icon} className="w-32" alt="Avatar" />
          <h2 className="my-8 font-display font-bold text-3xl text-gray-700 text-center">Welcome!</h2>
          <div className="relative">
            <i className="fa fa-user absolute text-primarycolor text-xl"></i>
            <input
              type="text"
              placeholder="username"
              className="pl-8 border-b-2 font-display focus:outline-none focus:border-primarycolor transition-all duration-500 capitalize text-lg"
              value={username}
              autoComplete='off'
              onChange={(e) => setUserName(e.target.value)}
              id="inputid"
            />
          </div>
          <div className="relative mt-8">
            <i className="fa fa-lock absolute text-primarycolor text-xl"></i>
            <input
              type="password"
              placeholder="password"
              className="pl-8 border-b-2 font-display focus:outline-none focus:border-primarycolor transition-all duration-500 capitalize text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="passwordid"
            />
          </div>
          <a
            onClick={handleSubmit}
            className="py-3 px-20 bg-primarycolor rounded-full text-white font-bold uppercase text-lg mt-4 transform hover:translate-y-1 transition-all duration-500"
          >
            Login
          </a>
          <div
            onClick={handleSignUp}
            className="py-3 px-20 bg-primarycolor rounded-full text-white font-bold uppercase text-lg mt-4 transform hover:translate-y-1 transition-all duration-500"
          >
            SignUp
          </div>
        </form>
      ) : (
        <div className="Offline">
          <img src={assets.Offline_icon} alt="Offline" />
        </div>
      )}
      {showAnimation && (
        <div className="animation-block fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <p className="shining-text text-white text-3xl font-bold">Greetings ! Newbie ❤️ ... </p>
        </div>
      )}
      {showLoginAnimation && (
         <div className="animation-block fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <p className="shining-text text-white text-3xl font-bold">❤️ {username}, Here we Go ! </p>
        </div>
        )}
    </div>
  );
};

export default Login;