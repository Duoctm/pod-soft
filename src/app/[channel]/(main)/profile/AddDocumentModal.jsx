import React, { useState } from 'react';

const AddDocumentModal = ({ onClose, onSubmit }) => {
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [error, setError] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Only PDF files are allowed.');
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected?.type === 'application/pdf') {
      setFile(selected);
      setError('');
    } else {
      setError('Only PDF files are allowed.');
    }
  };

  const handleSubmit = () => {
    if (!file || !docName.trim()) {
      setError('Both fields are required.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    //formData.append('name', docName);

    const date = new Date();
	const usFormatted = date.toLocaleDateString("en-US")

    const newDoc = {
      name: docName,
      date: usFormatted,
      file: "",
    };

    onSubmit(newDoc, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Document</h3>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('fileInput').click()}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer text-gray-500 mb-4"
        >
          {file ? (
            <p className="text-gray-700">Selected: {file.name}</p>
          ) : (
            <p>Drag & drop a PDF file here or click to select</p>
          )}
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <input
          type="text"
          placeholder="Enter document name"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          className="w-full mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocumentModal;
