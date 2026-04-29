import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreatePost() {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Lost');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // We use FormData because we are uploading a file (image)
    const formData = new FormData();
    formData.append('description', description);
    formData.append('type', type);
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/feed'); // Go back to feed after posting
    } catch (err) {
      console.error(err);
      alert('FAILED TO CREATE POST');
    }
  };

  return (
    <div className="max-w-2xl mx-auto border-8 border-black p-8 bg-white shadow-brutal">
      <h2 className="text-4xl font-black uppercase mb-6 bg-brutalNeon border-4 border-black p-2 text-center">
        REPORT ITEM
      </h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="font-black uppercase text-xl block mb-2">Item Status:</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="input-brutal w-full text-xl cursor-pointer"
          >
            <option value="Lost">I LOST SOMETHING</option>
            <option value="Found">I FOUND SOMETHING</option>
          </select>
        </div>

        <div>
          <label className="font-black uppercase text-xl block mb-2">Description:</label>
          <textarea 
            required
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="WHAT IS IT? WHERE DID YOU SEE IT?"
            className="input-brutal w-full"
          />
        </div>

        <div>
          <label className="font-black uppercase text-xl block mb-2">Upload Image (Optional):</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="input-brutal w-full bg-brutalBg file:mr-4 file:py-2 file:px-4 file:border-4 file:border-black file:bg-brutalPink file:text-white file:font-bold file:uppercase hover:file:bg-black"
          />
        </div>

        <button type="submit" className="btn-brutal bg-black text-white hover:bg-brutalNeon hover:text-black text-2xl mt-4">
          SUBMIT POST
        </button>
      </form>
    </div>
  );
}