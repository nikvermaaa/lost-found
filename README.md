# 🏢 SIR MVIT Lost & Found .

A Full-Stack, real-time Lost and Found platform built for college students. Featuring a bold, Brutalist UI, secure JWT authentication, and live Socket.io chat for seamless communication between finders and owners.

## ✨ Features
* **Brutalist UI:** A unique, high-contrast design built with Tailwind CSS.
* **Secure Authentication:** User registration and login using JWT and bcrypt.
* **Image Uploads:** Users can upload photos of lost or found items (handled via Multer).
* **Real-Time Comms:** Live chat functionality powered by Socket.io so students can coordinate returning items.
* **Secure Inbox:** A dedicated inbox for post owners to manage multiple item claims.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS, Axios, React Router
* **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, Multer, JWT

## 🚀 How to Run Locally

### 1. Clone the repository:
\`\`\`bash
git clone https://github.com/YOUR_USERNAME/lost-found.git
cd lost-found
\`\`\`

### 2. Setup the Backend:
\`\`\`bash
cd backend
npm install
\`\`\`
Create a `.env` file in the `backend` folder with the following variables:
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
\`\`\`
Start the backend server:
\`\`\`bash
node server.js
\`\`\`

### 3. Setup the Frontend:
Open a new terminal and run:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
