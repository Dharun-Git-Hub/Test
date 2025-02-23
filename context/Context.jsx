import React, { createContext, useState, useEffect } from 'react';
import run from '../config/gemini';

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData(prev => prev + nextWord);
        }, 25 * index);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    const onSent = async (prompt) => {
        setResultData('');
        setInput("");
        setLoading(true);
        setShowResult(true);
        let response;
        if (prompt !== undefined) {
            response = await run(prompt);
            setRecentPrompt(prompt);
        } else {
            setPrevPrompts(prev => [...prev, input]);
            setRecentPrompt(input);
            response = await run(input);
        }

        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += `<b>` + responseArray[i] + `</b>`;
            }
        }
        let newResponse2 = newResponse.split("*").join("</br>");
        let newResponse3 = newResponse2.replace(/```([^```]+)```/g, '<br></br><textarea readonly >$1</textarea><br>');

        let newResponseArray = newResponse3.split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i];
            delayPara(i, nextWord + " ");
        }
        setLoading(false);
    };

    const onSentMaps = async (prompt) => {
        setResultData('');
        setInput("");
        setLoading(true);
        setShowResult(true);
        let response;
        if (prompt !== undefined) {
            response = await run(`${prompt} Please give the result in the format of : Example : <bold> 1. Cholan Hotel, Madurai, Tamilnadu\n2. Ibrahim Hotel, Madurai, Tamilnadu\n3. N.S. Hotel, Madurai, Tamilnadu\n4. Sree Vilas, Madurai, Tamilnadu</bold> Total parts of the result will be Boldly !`);
            setRecentPrompt(prompt);
        } else {
            setPrevPrompts(prev => [...prev, input]);
            setRecentPrompt(input);
            response = await run(input+" Please give the result in the format of : Example : <bold> 1. Cholan Hotel, Madurai, Tamilnadu\n2. Ibrahim Hotel, Madurai, Tamilnadu\n3. N.S. Hotel, Madurai, Tamilnadu\n4. Sree Vilas, Madurai, Tamilnadu</bold>  Total parts of the result will be Boldly !");
        }

        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += `<b class="makeblue">` + responseArray[i] + `</b>`;
            }
        }
        let newResponse2 = newResponse.split("*").join("</br>");
        let newResponse3 = newResponse2.replace(/```([^```]+)```/g, '<br></br><textarea readonly >$1</textarea><br>');

        let newResponseArray = newResponse3.split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i];
            delayPara(i, nextWord + " ");
        }
        setLoading(false);
    };

    useEffect(() => {
        const savedPrevPrompts = JSON.parse(localStorage.getItem('prevPrompts')) || [];
        setPrevPrompts(savedPrevPrompts);
    }, []);

    useEffect(() => {
        if (prevPrompts.length > 0) {
            localStorage.setItem('prevPrompts', JSON.stringify(prevPrompts));
        }
    }, [prevPrompts]);

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        onSentMaps,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;


