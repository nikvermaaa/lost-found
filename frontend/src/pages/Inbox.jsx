import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Inbox() {
  const [convos, setConvos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/inbox', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setConvos(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-black uppercase bg-black text-white p-4 shadow-brutal w-fit">SECURE INBOX</h1>
        <button onClick={() => navigate('/feed')} className="btn-brutal bg-white text-black hover:bg-black hover:text-white border-4 border-black">
          BACK TO FEED
        </button>
      </div>
      
      {convos.length === 0 ? (
        <div className="border-8 border-black p-8 bg-white shadow-brutal font-black text-2xl text-center">
          NO ACTIVE COMMS.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {convos.map((c, idx) => (
            <div key={idx} className="border-4 border-black bg-white p-6 shadow-brutal flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-black text-xl mb-2">
                  <span className={`px-2 py-1 mr-2 text-sm border-2 border-black ${c.postType === 'Lost' ? 'bg-brutalPink text-white' : 'bg-brutalNeon text-black'}`}>{c.postType}</span>
                  {c.postDesc}
                </p>
                <p className="font-bold text-lg">CHATTING WITH: <span className="uppercase text-brutalPink font-black">{c.otherUser.name} ({c.otherUser.usn})</span></p>
                <p className="italic font-bold text-gray-600 border-l-4 border-black pl-2 mt-2">"{c.lastMessage}"</p>
              </div>
              <button 
                onClick={() => navigate(`/chat/${c.postId}/${c.otherUser._id}`)}
                className="btn-brutal bg-black text-white hover:bg-brutalNeon hover:text-black w-full md:w-auto"
              >
                OPEN CHAT
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}