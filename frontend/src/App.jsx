import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import CreatePost from './pages/CreatePost'; 
import Inbox from './pages/Inbox'; // <-- NEW: Added Inbox Import

function App() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; // Redirect to login
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen border-8 border-black m-4 p-4 bg-white">
        
        {/* --- UPDATED HEADER WITH BUTTONS --- */}
        <header className="border-b-8 border-black pb-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/feed">
            <h1 className="text-4xl font-black uppercase tracking-tighter hover:text-brutalPink transition-colors">
              SIR MVIT Lost&Found
            </h1>
          </Link>
          
          <nav className="flex gap-4">
            {/* Link to Create Post Page */}
            <Link to="/create" className="btn-brutal bg-brutalNeon text-black hover:bg-black hover:text-white">
              + REPORT ITEM
            </Link>
            
            {/* Logout Button */}
            <button onClick={handleLogout} className="btn-brutal bg-brutalPink text-white hover:bg-black">
              LOGOUT
            </button>
          </nav>
        </header>

        {/* --- UPDATED ROUTES --- */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/chat/:postId/:ownerId" element={<Chat />} />
          <Route path="/create" element={<CreatePost />} /> 
          <Route path="/inbox" element={<Inbox />} /> {/* <-- NEW: Added Inbox Route */}
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;