import React from 'react';
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { Button } from "./components/ui/button";

// Firebase config (replace with your own)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ChatApp() {
  const [roomCode, setRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (roomCode) {
      const unsubscribe = onSnapshot(collection(db, roomCode), (snapshot) => {
        setMessages(snapshot.docs.map(doc => doc.data()));
      });
      return () => unsubscribe();
    }
  }, [roomCode]);

  const createRoom = () => {
    const newRoomCode = uuidv4().split("-")[0];
    setRoomCode(newRoomCode);
  };

  const sendMessage = async () => {
    if (roomCode && message.trim()) {
      await addDoc(collection(db, roomCode), { text: message, timestamp: Date.now() });
      setMessage("");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-bold">Group Chat</h1>
      {!roomCode ? (
        <Button onClick={createRoom}>Create Chat Room</Button>
      ) : (
        <div>
          <p>Room Code: <span className="font-mono bg-gray-200 p-1">{roomCode}</span></p>
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Type a message" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button onClick={sendMessage} className="mt-2">Send</Button>
          <div className="mt-4 space-y-2">
            {messages.map((msg, index) => (
              <p key={index} className="p-2 bg-gray-100 rounded">{msg.text}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
