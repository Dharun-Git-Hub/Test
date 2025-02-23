import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import axios from 'axios';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('username');
    const [generatedOTP, setGeneratedOTP] = useState(null);
    const [timer, setTimer] = useState(300);
    const navigate = useNavigate();
    var [bgColor, back] = useState("linear-gradient(135deg, #6a11cb, #ffffff)");

const validateUsername = async () => {
    const usernameRegex = /^[a-zA-Z0-9_]{5,13}$/;
    if (usernameRegex.test(username)) {
        
        try {
            const response = await axios.post('https://messy-efficacious-bay.glitch.me/check-username', {username});
            if (response.data.success) {
                back("linear-gradient(135deg, #ff2976, #2575fc)");
                setStep('password');
            } else {
                alert(`The username ${username} already found! Try a different one!`);
            }
        } catch (error) {
            alert(`Something went Wrong !`);
        }
    } else {
        alert('Invalid username. Please follow the guidelines.');
    }
};


    const validatePassword = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/;
        if (passwordRegex.test(password)) {
            back("linear-gradient(135deg,  #2575fc,#ff2976)");
            setStep('email');
        } else {
            alert('Password must be at least 5 characters long and include a number, a capital letter, and a special character.');
        }
    };

const validateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        try {
            const response = await axios.post("https://messy-efficacious-bay.glitch.me/check-mail", { email });

            if (response.data.success) {
                try {
                    const otpResponse = await axios.post('https://messy-efficacious-bay.glitch.me/signup/send-otp', {
                        username,
                        password,
                        email,
                    });

                    if (otpResponse.data.success) {
                        setGeneratedOTP(otpResponse.data.otp);
                        startOTPTimer();
                        back("linear-gradient(24deg, #ff2976, #2575fc)");
                        setStep('otp');
                    } else {
                        alert('Failed to send OTP. Please try again.');
                    }
                } catch (error) {
                    console.error(error);
                    alert('Error sending OTP.');
                }
            } else {
                alert(`The Email : ${email} already found. Try a different one!`);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                alert(`The Email : ${email} already found. Try a different one!`);
            } else {
                console.error(error);
                alert('Error checking email.');
            }
        }
    } else {
        alert('Invalid email address.');
    }
};


    const startOTPTimer = () => {
        let timeLeft = 300;
        const interval = setInterval(() => {
            timeLeft--;
            setTimer(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(interval);
                alert("You didn't enter the OTP.");
            }
        }, 1000);
    };

    const validateOTP = async () => {
        try {
            const response = await axios.post('https://messy-efficacious-bay.glitch.me/signup/verify-otp', {
                username,
                password,
                email,
                otp
            });
            if (response.data.success) {
                localStorage.setItem("loggedInUser", JSON.stringify(username));
                navigate("/");
            } else {
                alert('Invalid or expired OTP.');
            }
        } catch (error) {
            console.error(error);
            alert('Error verifying OTP.');
        }
    };

    return (
        <div id="totem" style={{ background: bgColor }}>
            <div className="containersign">
                {step === 'username' && (
                    <div id="step-username">
                        <h2><b>Try a Username</b></h2>
                        <input type="text" placeholder="Username (5-13 chars)" value={username} onChange={(e) => setUsername(e.target.value)} 
                        onKeyDown={(e)=>{if(e.key==='Enter') validateUsername();}} required />
                        <button onClick={validateUsername}>Next</button>
                    </div>
                )}
                {step === 'password' && (
                    <div id="step-password">
                        <h2><b>Enter Password</b></h2>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} 
                        onKeyDown={(e)=>{if(e.key==='Enter') validatePassword();}} required />
                        <button onClick={validatePassword}>Next</button>
                    </div>
                )}
                {step === 'email' && (
                    <div id="step-email">
                        <h2><b>Enter Email</b></h2>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e)=>{if(e.key==='Enter') validateEmail();}}  required />
                        <button onClick={validateEmail}>Send OTP</button>
                    </div>
                )}
                {step === 'otp' && (
                    <div id="step-otp">
                        <h2><b>Enter OTP</b></h2>
                        <p>Time left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</p>
                        <input type="text" placeholder="xxxxxx" value={otp} onChange={(e) => setOtp(e.target.value)} 
                        onKeyDown={(e)=>{if(e.key==='Enter') validateOTP();}} required />
                        <button onClick={validateOTP}>Verify</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;
