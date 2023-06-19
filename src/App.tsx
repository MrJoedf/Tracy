import React, { useState } from 'react';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [markedText, setMarkedText] = useState('');
  const [mode, setMode] = useState('mark');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleToggleChange = (event) => {
    setMode(event.target.value);
    setMarkedText('');
  };

  const encodeText = (image, text) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
    
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
    
      let textIndex = 0;
      let bitIndex = 0;
    
      for (let i = 0; i < pixels.length; i += 4) {
        if (textIndex >= text.length) {
          break;
        }
    
        const charCode = text.charCodeAt(textIndex);
        const bit = (charCode >> bitIndex) & 1;
    
        pixels[i] = (pixels[i] & 0xFE) | bit;
    
        bitIndex++;
    
        if (bitIndex === 8) {
          textIndex++;
          bitIndex = 0;
        }
      }
    
      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL(); 
  };

  const decodeText = (image) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
    
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
    
      let decodedText = '';
      let charCode = 0;
      let bitIndex = 0;
    
      for (let i = 0; i < pixels.length; i += 4) {
        const bit = pixels[i] & 1;
        charCode |= bit << bitIndex;
    
        bitIndex++;
    
        if (bitIndex === 8) {
          if (charCode === 0) {
            break;
          }
    
          const decodedChar = String.fromCharCode(charCode);
          decodedText += decodedChar;
    
          charCode = 0;
          bitIndex = 0;
        }
      }

      return decodedText;;
  };

  const handleTextChange = (event) => {
    setMarkedText(event.target.value);
  };

  const handleButtonClick = () => {
    if (mode === 'mark') {
      const steganographedImage = encodeText(selectedImage, markedText);
      setSelectedImage(steganographedImage);
    } else if (mode === 'check') {
      const detectedText = decodeText(selectedImage);
      setMarkedText(detectedText);
    }
  };

  return (
    <div>
      <h1>Image Steganography App</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {selectedImage && (
        <img src={selectedImage} alt="Preview" style={{ width: '300px' }} />
      )}
      <br />
      <label>
        <input
          type="radio"
          value="mark"
          checked={mode === 'mark'}
          onChange={handleToggleChange}
        />
        Mark
      </label>
      <label>
        <input
          type="radio"
          value="check"
          checked={mode === 'check'}
          onChange={handleToggleChange}
        />
        Check
      </label>
      {mode === 'mark' && (
        <>
          <br />
          <input
            type="text"
            value={markedText}
            onChange={handleTextChange}
          />
          <button onClick={handleButtonClick}>
            {selectedImage ? 'Conceal Text' : 'Select Image'}
          </button>
        </>
      )}
      {mode === 'check' && (
        <>
          <br />
          <input type="text" value={markedText} readOnly />
          <button onClick={handleButtonClick}>
            {selectedImage ? 'Retrieve Text' : 'Select Image'}
          </button>
        </>
      )}
    </div>
  );
};

export default App;
