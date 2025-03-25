import React from 'react';
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, onSnapshot, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash, FaUndo, FaExpand } from "react-icons/fa";

const firebaseConfig = {
  apiKey: "AIzaSyAThnPos7CBAUo9KU00soMwOgx0vFXVmL8",
  authDomain: "groupchatapp-12918.firebaseapp.com",
  projectId: "groupchatapp-12918",
  storageBucket: "groupchatapp-12918.firebasestorage.app",
  messagingSenderId: "312169425350",
  appId: "1:312169425350:web:26dca269b31fbb407baac7",
  measurementId: "G-7XDHBHSCZD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ChatApp() {
  const [roomCode, setRoomCode] = useState("");
  const [customRoomCode, setCustomRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [usernameSet, setUsernameSet] = useState(!!localStorage.getItem("username"));

  useEffect(() => {
    const fetchRooms = async () => {
      const snapshot = await getDocs(collection(db, "chatrooms"));
      setRooms(snapshot.docs.map(doc => doc.id));
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (roomCode) {
      const q = query(collection(db, roomCode), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [roomCode]);

  const createRoom = async () => {
    if (!customRoomCode.trim()) return;
    await setDoc(doc(db, "chatrooms", customRoomCode), { id: customRoomCode });
    setRoomCode(customRoomCode);
  };

  const joinRoom = (room) => {
    setRoomCode(room);
  };

  const sendMessage = async () => {
    if (roomCode && message.trim()) {
      await setDoc(doc(db, roomCode, new Date().getTime().toString()), { text: message, timestamp: new Date().getTime(), user: username });
      setMessage("");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const setUser = () => {
    if (username.trim()) {
      localStorage.setItem("username", username);
      setTimeout(() => setUsernameSet(true), 100);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const deleteMessage = async (id, user) => {
    if (user === username) {
      await deleteDoc(doc(db, roomCode, id));
    }
  };

  return (
    <div className="container mt-4 d-flex flex-column align-items-center" style={{ maxWidth: "400px" }}>
      <h1 className="text-center mb-4">Message App</h1>
      <button className="btn btn-secondary mb-2" onClick={toggleFullscreen}><FaExpand /></button>
      {!usernameSet ? (
        <div className="card p-4 shadow-sm w-100">
          <input 
            className="form-control mb-2" 
            placeholder="Enter a username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={setUser} className="btn btn-primary w-100">Set Username</button>
        </div>
      ) : !roomCode ? (
        <div className="card p-4 shadow-sm w-100">
          <input 
            className="form-control mb-2" 
            placeholder="Enter Custom Room Code" 
            value={customRoomCode} 
            onChange={(e) => setCustomRoomCode(e.target.value)}
          />
          <button onClick={createRoom} className="btn btn-primary w-100">Create Chat Room</button>
          <h2 className="mt-4">Join an Existing Room</h2>
          <ul className="list-group">
            {rooms.map((room) => (
              <li key={room} className="list-group-item d-flex justify-content-between">
                <span>{room}</span>
                <button onClick={() => joinRoom(room)} className="btn btn-secondary">Join</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card p-4 shadow-sm w-100 d-flex flex-column" style={{ height: "500px" }}>
          <p className="text-center">Room Code: <span className="badge bg-secondary">{roomCode}</span></p>
          <div className="messages-box flex-grow-1 p-3 mb-3 overflow-auto" style={{ backgroundColor: "#f1f1f1", borderRadius: "10px" }}>
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`d-flex align-items-center ${msg.user === username ? 'justify-content-end' : 'justify-content-start'}`} 
                style={{ marginBottom: "5px", position: "relative" }}
                onMouseEnter={(e) => e.currentTarget.querySelector(".msg-options").style.display = "block"}
                onMouseLeave={(e) => e.currentTarget.querySelector(".msg-options").style.display = "none"}
              >
                {msg.user === username && (
                  <div className="msg-options me-2" style={{ display: "none" }}>
                    <button className="btn btn-sm btn-danger me-1" onClick={() => deleteMessage(msg.id, msg.user)}><FaTrash /></button>
                  </div>
                )}
                <div className={`p-3 text-white ${msg.user === username ? 'bg-primary' : 'bg-secondary'}`} 
                  style={{ maxWidth: "75%", borderRadius: "20px", padding: "10px 15px" }}>
                  {msg.user}: {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="input-group">
            <input 
              className="form-control rounded-pill" 
              placeholder="Message..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={sendMessage} className="btn btn-success rounded-pill">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
