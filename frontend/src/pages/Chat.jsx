import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

export default function Chat() {
  const { postId, ownerId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Fetch History
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/messages/${postId}/${ownerId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setMessages(res.data);
      scrollToBottom();
    });

    // Join Socket Room
    socket.emit('join_chat', { postId, senderId: currentUser.id, receiverId: ownerId });

    // Listen for incoming messages
    socket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => socket.off('receive_message');
  }, [postId, ownerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      postId,
      senderId: currentUser.id,
      receiverId: ownerId,
      message: newMessage
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto border-8 border-black shadow-brutal flex flex-col h-[70vh] bg-white">
      
      {/* Header */}
      <div className="bg-black text-white p-4 border-b-8 border-black flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tight">SECURE COMMS</h2>
        <button onClick={() => navigate('/feed')} className="btn-brutal bg-white text-black hover:bg-brutalPink hover:text-white border-2 border-white py-1 text-sm">
          EXIT CHAT
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-grow p-6 overflow-y-auto bg-brutalBg flex flex-col gap-6">
        {messages.map((msg, idx) => {
          // Check if the message is from the logged-in user
          // We handle both _id (if populated from DB) and standard strings just in case
          const isMe = msg.senderId._id === currentUser.id || msg.senderId === currentUser.id;
          
          return (
            <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              
              {/* Name Tag */}
              <span className={`text-xs font-black uppercase mb-1 border-2 border-black px-2 py-1 ${isMe ? 'bg-brutalNeon text-black' : 'bg-black text-white'}`}>
                {msg.senderId?.name || currentUser.name} ({msg.senderId?.usn || currentUser.usn})
              </span>
              
              {/* Text Bubble */}
              <div className={`border-4 border-black p-4 max-w-[80%] font-bold text-lg ${isMe ? 'bg-white shadow-brutal-sm' : 'bg-brutalPink text-white shadow-brutal-sm'}`}>
                {msg.message}
              </div>
              
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="p-4 border-t-8 border-black bg-white flex gap-4">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="input-brutal flex-grow text-xl"
          placeholder="TYPE SECURE MESSAGE..."
        />
        <button type="submit" className="btn-brutal bg-black text-white hover:bg-brutalNeon hover:text-black text-xl px-8">
          SEND
        </button>
      </form>
    </div>
  );
}