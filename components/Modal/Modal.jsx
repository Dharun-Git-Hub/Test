import { useRef, useState, useEffect } from 'react';
import './Modal.css';

const Modal = ({ insertText }) => {
    const maxRef = useRef(null);
    const [placeHold, setPlaceHold] = useState('');
    const [isInputEmpty, setIsInputEmpty] = useState(true);
    const [currentMessage, setCurrentMessage] = useState('');
    const [ideaBox, setIdeaBox] = useState(false);
    const [response, onResponse] = useState('');
    const [gotResponse, setGotResponse] = useState(false);
    const API_KEY = 'AIzaSyBN4n3or1shaEe4TW4dFZJ7Qe7xpDlYR-g';
    const API_REQUEST_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    const handleInput = () => {
        const txtarea = maxRef.current;
        if (txtarea) {
            const value = txtarea.value.trim();
            setCurrentMessage(value);
            setIsInputEmpty(value === '');
            txtarea.style.height = '40px';
            if (value !== '') {
                txtarea.style.height = `${txtarea.scrollHeight}px`;
            }
        }
    };

    const handleButtonClick = async () => {
        if (currentMessage.trim() === '') return; // Don't send empty messages

        try {
            const response = await fetch(API_REQUEST_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: currentMessage }] }]
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'Failed to fetch data');

            let responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from API';
            
            // Remove unwanted characters
            responseText = responseText.replace(/(\*\*|\*\*\*|\*\* \*|```)/g, '');

            onResponse(responseText);
            setGotResponse(true);
            insertText(responseText); // Insert the AI-generated text into the TextEditor
        } catch (error) {
            console.error('Error:', error);
            onResponse('Error communicating with API');
        }
    };

    useEffect(() => {
        let timeoutId;

        if (isInputEmpty) {
            timeoutId = setInterval(() => {
                setPlaceHold((prev) => (prev === '' ? 'Describe your Idea 💡' : ''));
            }, 2000);
        }

        return () => {
            clearInterval(timeoutId);
        };
    }, [isInputEmpty]);

    const handleIdea = () => {
        onResponse('');
        handleButtonClick();
        maxRef.current.value = '';
        setIsInputEmpty(true);
        setPlaceHold('Describe your Idea 💡');
        setIdeaBox(true);
    }

    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response);
        }
        onResponse('');
        setGotResponse(false);
        setIdeaBox(false);
    };

    return (
        <div className="modal-back">
            {!ideaBox ?
            <div className="modal-front">
                <h1>Ask AI ...</h1>
                <textarea
                    ref={maxRef}
                    onChange={handleInput}
                    placeholder={placeHold}
                    spellCheck="false"
                    autoComplete="off"
                    className="ai-textarea"
                />
                <button title="Generate Text" onClick={handleIdea}><i className='bx bx-pen'/></button>
            </div>
            :
            <div className='modal-front1'>
                <span>{response}</span>
                {response && (
                <button disabled={!gotResponse} title="Copy" onClick={handleCopy}>
                    Is this Ok? <i className='bx bx-copy'/>
                </button>
                )}
                {
                    !response && <span>Loading...</span>
                }
                <button title="Back" onClick={() => setIdeaBox(false)}><i className='bx bx-arrow-back'/></button>
            </div>
            }
        </div>
    );
};

export default Modal;