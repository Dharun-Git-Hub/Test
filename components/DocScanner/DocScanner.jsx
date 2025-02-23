import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './DocScanner.css'

const DocScanner = () => {
  const [images, setImages] = useState([]);
  const [greyscale, setGreyscale] = useState(false); 

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const convertToGreyscale = (image) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(image);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;      
          data[i + 1] = avg;   
          data[i + 2] = avg;   
        }

        ctx.putImageData(imageData, 0, 0);

        const imgData = canvas.toDataURL('image/jpeg');
        resolve(imgData);
      };
    });
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      const imgData = greyscale ? await convertToGreyscale(image) : URL.createObjectURL(image);

      doc.addImage(imgData, 'JPEG', 10, 10, 180, 180);

      if (i < images.length - 1) {
        doc.addPage();
      }
    }

    doc.save('scanned_assignment.pdf');
    setImages([]);
  };
const renderImagePreview = () => {

  return images.map((image, index) => (
    <div key={index} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
      <button 
        onClick={() => {
          URL.revokeObjectURL(image);
          setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        }} 
        className="bx bx-trash"
      />
      <img
        src={URL.createObjectURL(image)}
        alt={`Preview ${index + 1}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          filter: greyscale ? 'grayscale(100%)' : 'none',
        }}
      />
    </div>
  ));
};


  return (
  		<div className="scan-cont">
    <div className="scan2-cont">
      <h1 style={{marginLeft:"20px"}}>Image - PDF Scanner</h1>

      <div style={{ margin: '20px 0' , marginLeft: "10px"}}>
        <label>
          <input
            type="checkbox"
            checked={greyscale}
            onChange={() => setGreyscale((prev) => !prev)}
          />
          Apply Greyscale
        </label>
      </div>
      <input className="choose" type="file" accept="image/*" multiple onChange={handleFileChange} />
      <div>
        {renderImagePreview()}
      </div>
      <button className="Gen" onClick={generatePDF} disabled={images.length === 0}>
        Generate PDF
      </button>
    </div>
    </div>
  );
};

export default DocScanner;
