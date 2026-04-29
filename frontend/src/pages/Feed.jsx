import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get('http://localhost:5000/api/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  };

  // --- NEW DELETE FUNCTION ---
  const handleDelete = async (postId) => {
    // Add a confirmation popup so they don't click it by accident
    if (!window.confirm("ARE YOU SURE YOU WANT TO DELETE THIS POST?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted post from the screen instantly
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error(err);
      alert("FAILED TO DELETE POST");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map(post => (
        <div key={post._id} className="border-4 border-black shadow-brutal p-4 bg-white flex flex-col">
          <div className="flex justify-between items-center border-b-4 border-black pb-2 mb-4">
            <span className={`font-black text-xl px-2 py-1 uppercase border-2 border-black ${post.type === 'Lost' ? 'bg-brutalPink text-white' : 'bg-brutalNeon text-black'}`}>
              {post.type}
            </span>
            <span className="font-bold text-sm bg-black text-white px-2 py-1">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {post.image && (
            <img src={`http://localhost:5000${post.image}`} alt="Item" className="w-full h-48 object-cover border-4 border-black mb-4 grayscale hover:grayscale-0 transition-all" />
          )}
          
          <p className="font-bold text-lg flex-grow mb-4">{post.description}</p>
          
          <div className="bg-gray-200 border-2 border-black p-2 mb-4">
            <p className="font-bold text-sm uppercase">Posted by: {post.userId.name}</p>
            <p className="text-xs font-bold">USN: {post.userId.usn}</p>
          </div>

          {/* --- CONDITIONAL BUTTONS --- */}
          {currentUser.id === post.userId._id ? (
            <div className="flex gap-2 mt-auto">
              {/* Button 1: To check messages */}
              <button 
                onClick={() => navigate('/inbox')}
                className="btn-brutal bg-brutalNeon text-black hover:bg-black hover:text-white w-1/2 text-sm"
              >
                GO TO INBOX
              </button>
              
              {/* Button 2: Delete */}
              <button 
                onClick={() => handleDelete(post._id)}
                className="btn-brutal bg-brutalPink text-white hover:bg-black w-1/2 text-sm"
              >
                DELETE
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate(`/chat/${post._id}/${post.userId._id}`)}
              className="btn-brutal bg-black text-white hover:bg-brutalNeon hover:text-black w-full mt-auto"
            >
              CHAT WITH OWNER
            </button>
          )}
        </div>
      ))}
    </div>
  );
}