import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Maps.css';
import { assets } from '../../assets/assets';
import { useLocation } from 'react-router-dom'; 

const Maps = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [circle, setCircle] = useState(null);
    const [place, setPlace] = useState('');
    const [prevPlace, setPrevPlace] = useState(''); // Store previous place
    const [currentMessage, setCurrentMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const location = useLocation(); 
    const navigate = useNavigate();
    const { coords } = location.state || {}; 
    const API_KEY = 'AIzaSyBN4n3or1shaEe4TW4dFZJ7Qe7xpDlYR-g';
    const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    useEffect(() => {
        if (!map) {
            const initializedMap = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(initializedMap);
            setMap(initializedMap);
        }
    }, [map]);

    useEffect(() => {
        if (map && coords) {
            updateMap(coords);
        }
    }, [map, coords]);

    const getCoordinates = async (placeName) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;
    
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status} ${response.statusText}`);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                return { lat: parseFloat(lat), lon: parseFloat(lon) };
            } else {
                const opt = window.confirm("No results found for the given place name.\nWould you like to search in Google Maps?");
                if (opt) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName)}`, '_blank');
                }
                return null;
            }
        } catch (error) {
            console.error("Error fetching coordinates:", error);
            alert("Failed to fetch location. Please try again.");
            return null;
        }
    };

    const updateMap = (coords) => {
        if (coords && map) {
            map.setView([coords.lat, coords.lon], 14);
            if (marker) {
                marker.setLatLng([coords.lat, coords.lon]);
            } else {
                const newMarker = L.marker([coords.lat, coords.lon]).addTo(map);
                setMarker(newMarker);
            }
            if (circle) {
                circle.setLatLng([coords.lat, coords.lon]);
            } else {
                const newCircle = L.circle([coords.lat, coords.lon], {
                    color: '#529ECC',
                    fillColor: '#529ECC',
                    fillOpacity: 0.5,
                    radius: 500
                }).addTo(map);
                setCircle(newCircle);
            }
        }
    };

    const searchAndSetMap = async () => {
        const placeInput = document.getElementById("placeInput").value;
        if (placeInput.trim() === "") {
            alert("Please enter a place name.");
            return;
        }

        const coords = await getCoordinates(placeInput);
        if (coords) {
            setPrevPlace(place); 
            setPlace(placeInput);
            updateMap(coords);
            setCurrentMessage(''); 
            setModal(false); 
        }
        document.getElementById("placeInput").value = '';
    };

    const fetchAIResponse = async () => {
        if (!place) {
            alert("Please select a place before requesting suggestions.");
            return;
        }

        setModal(prev => !prev);

        if (!modal) {
            setLoading(true);
            try {
                const response = await fetch(API_REQUEST_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: `Tell me about the place ${place} `}] }]
                    })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error.message);

                const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from API';
                setLoading(false);
                setCurrentMessage(responseText);
            } catch (error) {
                console.error('Error:', error.message);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (map && modal) {
            const aiElement = document.getElementById('aied');

            aiElement.addEventListener('mouseenter', () => map.scrollWheelZoom.disable());
            aiElement.addEventListener('mouseleave', () => map.scrollWheelZoom.enable());
            aiElement.addEventListener('wheel', (e) => e.stopPropagation());
        }
    }, [map, modal]);

    return (
        <div className="mapcont">
            <div className="controlsr">
                <i 
                    title="Back" 
                    className="bx bx-x" 
                    style={{ color: "red", fontSize: "20px", userSelect: "none", marginRight: "40px" }} 
                    onClick={() => navigate("/dashboard")} 
                />
                <input type="text" id="placeInput" placeholder="Enter a place name" />
                <button onClick={searchAndSetMap}>Search</button>
            </div>
            <div id="map" ref={mapRef} style={{ height: '90%' }}>
                <div id="suggested" style={{ width: modal ? "200px" : "30px", height: modal ? "300px" : "30px" }}>
                    <img 
                        title="Suggestion from AI" 
                        src={assets.gemini_icon} 
                        className="aibutton" 
                        onClick={fetchAIResponse} 
                    />
                    {modal && (
                        <div id="aied" style={{ overflowY: 'scroll', maxHeight: '300px' }}>
                            {loading ? "Loading..." : currentMessage || "No suggestions yet"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Maps;