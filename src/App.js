import React from 'react';
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, onSnapshot, query, orderBy, getDocs, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const firebaseConfig = { 
  apiKey: "AIzaSyAThnPos7CBAUo9KU00soMwOgx0vFXVmL8", 
  authDomain: "groupchatapp-12918.firebaseapp.com",
  projectId: "groupchatapp-12918",
  storageBucket: "groupchatapp-12918.firebasestorage.app",
  messagingSenderId: "312169425350", 
  appId:"1:312169425350:web:26dca269b31fbb407baac7",
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
        setMessages(snapshot.docs.map(doc => doc.data()));
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

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Group Chat</h1>
      {!usernameSet ? (
        <div className="card p-4 shadow-sm">
          <input 
            className="form-control mb-2" 
            placeholder="Enter a username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={setUser} className="btn btn-primary w-100">Set Username</button>
        </div>
      ) : !roomCode ? (
        <div className="card p-4 shadow-sm">
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
        <div className="card p-4 shadow-sm">
          <p className="text-center">Room Code: <span className="badge bg-secondary">{roomCode}</span></p>
          <div className="messages-box border p-3 mb-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`d-flex ${msg.user === username ? 'justify-content-end' : 'justify-content-start'}`}>
                <div className={`alert ${msg.user === username ? 'alert-primary' : 'alert-secondary'} text-wrap`}> 
                  <strong>{msg.user}: </strong> {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="input-group">
            <input 
              className="form-control" 
              placeholder="Type a message" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage} className="btn btn-success">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
