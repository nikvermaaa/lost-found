import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', usn: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        // 1. Handle Registration
        await axios.post('http://localhost:5000/api/auth/register', formData);
        alert('REGISTERED SUCCESSFULLY! PLEASE LOG IN.');
        setIsRegistering(false); // Switch to login view
      } else {
        // 2. Handle Login
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          usn: formData.usn,
          password: formData.password
        });
        
        // Save token and safe user data to browser storage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Redirect to the Feed page
        navigate('/feed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'SOMETHING WENT WRONG');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-full max-w-md border-8 border-black p-8 bg-white shadow-brutal">
        <h2 className="text-4xl font-black uppercase mb-6 text-center bg-brutalNeon border-4 border-black p-2">
          {isRegistering ? 'JOIN SYSTEM' : 'SYSTEM LOGIN'}
        </h2>
        
        {error && (
          <div className="bg-brutalPink text-white font-bold p-3 mb-4 border-4 border-black uppercase text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegistering && (
            <>
              <input 
                type="text" name="name" placeholder="FULL NAME" required
                onChange={handleChange} className="input-brutal w-full"
              />
              <input 
                type="text" name="phone" placeholder="PHONE (PRIVATE)" required
                onChange={handleChange} className="input-brutal w-full"
              />
            </>
          )}
          
          <input 
            type="text" name="usn" placeholder="USN (e.g., 1MV2...)" required
            onChange={handleChange} className="input-brutal w-full uppercase"
          />
          <input 
            type="password" name="password" placeholder="PASSWORD" required
            onChange={handleChange} className="input-brutal w-full"
          />
          
          <button type="submit" className="btn-brutal bg-black text-white hover:bg-brutalNeon hover:text-black mt-4 text-xl">
            {isRegistering ? 'SUBMIT REGISTRATION' : 'ENTER PLATFORM'}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-6 w-full text-center font-bold underline hover:bg-black hover:text-white transition-colors p-2"
        >
          {isRegistering ? 'ALREADY REGISTERED? LOG IN.' : 'NO ACCOUNT? REGISTER HERE.'}
        </button>
      </div>
    </div>
  );
}