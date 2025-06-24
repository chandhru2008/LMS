// import React, { useState } from 'react';

// const BulkUploadForm = () => {
//   const [file, setFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [message, setMessage] = useState<string>('');
//   const [error, setError] = useState<string>('');

//   // Handle file input change
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files ? e.target.files[0] : null;
//     if (selectedFile) {
//       setFile(selectedFile);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!file) {
//       setError('Please select a file to upload.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     console.log(file)

//     try {
//       setIsUploading(true);
//       setError('');
//       setMessage('');

//       // Send the file using the Fetch API
//       const response = await fetch('https://lms-zwod.onrender.com/employees/bulk-upload', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include'
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setMessage('File uploaded successfully!');
//         console.log(data);
//         // You can handle the response data here
//       } else {
//         const data = await response.json();
//         setError(data.message || 'Upload failed');
//       }
//     } catch (err) {
//       console.error('Error during upload:', err);
//       setError('An error occurred while uploading the file.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="upload-form-container">
//       <h2>Bulk Employee Upload</h2>

//       <form onSubmit={handleSubmit}>
//         <div>
//           <label htmlFor="file">Select a file</label>
//           <input type="file" id="file" name="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} />
//         </div>

//         {error && <p className="error-message">{error}</p>}
//         {message && <p className="success-message">{message}</p>}

//         <button type="submit" disabled={isUploading}>
//           {isUploading ? 'Uploading...' : 'Upload'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default BulkUploadForm;
