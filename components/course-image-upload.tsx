import React, { useState } from 'react';

function generateSecureRandomId(length = 16) {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    console.warn('window.crypto tidak tersedia, menggunakan Math.random() sebagai fallback. Ini TIDAK aman untuk kriptografi.');
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const CourseImageUpload = () => {
  const [uploadSessionId, setUploadSessionId] = useState('');

  const handleStartUpload = () => {
    const sessionId = generateSecureRandomId(10);
    setUploadSessionId(sessionId);
  };

  return (
    <div>
      <button onClick={handleStartUpload}>Start Image Upload</button>
      {uploadSessionId && <p>Upload Session ID: {uploadSessionId}</p>}
    </div>
  );
};

export default CourseImageUpload;
