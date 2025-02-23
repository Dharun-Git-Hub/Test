import React, { useState } from 'react';
import './ImageGen.css';

const ImageGen = () => {
    const apiKey = "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";
    const maxImages = 4;
    const [imageUrls, setImageUrls] = useState([]);
    const [ load, setLoad ] = useState(false);

    const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const disableGenerateButton = () => {
        document.getElementById("generate").disabled = true;
    };

    const enableGenerateButton = () => {
        document.getElementById("generate").disabled = false;
    };

    const clearImageGrid = () => {
        setImageUrls([]);
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const generateImages = async (input) => {
        disableGenerateButton();
        clearImageGrid();
        setLoad(true);

        const newImageUrls = [];

        for (let i = 0; i < maxImages; i++) {
            const randomNumber = getRandomNumber(1, 10000);
            const prompt = `${input} ${randomNumber}`;

            let success = false;
            let attempts = 0;

            while (!success && attempts < 5) { 
                console.log("fetcg");
                const response = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ inputs: prompt }),
    }
);

                if (response.ok) {
                    console.log(response.data);
                    const blob = await response.blob();
                    const imgUrl = URL.createObjectURL(blob);
                    newImageUrls.push(imgUrl);
                    success = true;
                    setLoad(false);
                } else if (response.status === 429) {
                    console.error(`Error: ${response.status} ${response.statusText}. Retrying...`);
                    await delay(4000); 
                } else {
                    console.error(`Error: ${response.status} ${response.statusText}`);
                    break;
                }

                attempts++;
            }
        }

        setImageUrls(newImageUrls);
        enableGenerateButton();
    };

    const downloadImage = (imgUrl, imageNumber) => {
        const link = document.createElement("a");
        link.href = imgUrl;
        link.download = `image-${imageNumber + 1}.jpg`;
        link.click();
    };

    return (
        <div className="containerimagen">
            <h1>Ai Image Generator</h1>
            <p className="pp">Be a bit Creative !</p>
            <form className="gen-form">
                <input type="text" id="user-prompt" placeholder="Type your prompt here..." autoComplete="off" />
                <button type="button" id="generate" onClick={() => {
                    const input = document.getElementById("user-prompt").value;
                    generateImages(input);
                }}>Generate</button>
                <button id="del" onClick={() => {clearImageGrid()}} > Del </button>
            </form>

            <div className="result1">
          {load ? <div className="loads" style={{color: "white", width: "200px", height: "200px"}}>Loading ........ </div> : null }
                <div id="image-grid">
                    {imageUrls.map((url, index) => (
                        <img key={index} src={url} alt={`art-${index + 1}`} onClick={() => downloadImage(url, index)} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImageGen;
