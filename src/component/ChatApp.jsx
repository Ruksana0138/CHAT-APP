import React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { addMessage, clearMessages } from '../redux/slices/chatSlice'
import mob from '../assets/mob.png'
import { useRef } from 'react'

const socket = io("https://chat-app-backend-n15u.onrender.com")

function ChatApp() {
    const { messages } = useSelector(state => state.chatReducer)
    const dispatch = useDispatch()
    const [messageInput, setMessageInput] = useState('')
    const [username, setUsername] = useState("")
    const [isNameSet, setIsNameSet] = useState(true)
    const [typingUser, setTypingUser] = useState(null)  // NEW: Track who's typing
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)  // NEW: For debouncing

    const sendMessage = () => {
        if (messageInput.trim() !== "") {
            const newMessage = { user: username, text: messageInput, time: new Date() }
            socket.emit("message", newMessage);
            setMessageInput("");
            socket.emit('stopTyping');  // NEW: Stop typing when message sent
        }
    }

    // NEW: Handle input change with typing indicator
    const handleInputChange = (e) => {
        setMessageInput(e.target.value);
        
        // Emit typing event
        socket.emit('typing', { user: username });
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Stop typing after 2 seconds of no input
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping');
        }, 2000);
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        socket.on("message", (message) => {
            dispatch(addMessage(message));
        })

        // NEW: Listen for typing events
        socket.on("typing", (data) => {
            setTypingUser(data.user);
        })

        // NEW: Listen for stop typing events
        socket.on("stopTyping", () => {
            setTypingUser(null);
        })

        return () => {
            socket.off("message");
            socket.off("typing");  // NEW: Cleanup
            socket.off("stopTyping");  // NEW: Cleanup
        }
    }, [dispatch])

    return (
        <div>
            <h1 className='text-center text-blue-400 text-5xl font-bold p-6'>CHAT APP</h1>
            {
                isNameSet ?
                    (
                        <div className="flex items-center justify-evenly min-h-screen">
                            <div className='grid md:grid-cols-2 gap-3'>
                                <div>
                                    <img width={"450px"} src={mob} alt="" />
                                </div>
                                <div className="p-6 bg-white rounded-lg shadow-lg">
                                    <h1 className="text-xl font-semibold mb-4">Enter your name</h1>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && username.trim()) {
                                                setIsNameSet(false);
                                            }
                                        }}
                                        placeholder="Your name..."
                                        className="w-full px-6 py-4 border border-gray-300 rounded-lg text-blue-400"
                                    />
                                    <button
                                        onClick={() => username.trim() && setIsNameSet(false)}
                                        className="mt-5 w-full bg-blue-500 text-white py-4 rounded-lg"
                                    >
                                        Join Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg chat-box">
                                
                                <div className='flex justify-between mb-2'>
                                    <button
                                        onClick={() => dispatch(clearMessages())}
                                        className="bg-slate-400 text-right px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                                    >
                                        Clear Message
                                    </button>
                                </div>

                                <div>
                                    <div className="mb-4 h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 chat-box">
                                        {messages.length === 0 ? (
                                            <p className="text-center text-gray-400">No messages yet</p>
                                        ) : (
                                            messages.map((message, index) => (
                                                <div key={index} className="flex flex-col mb-3">
                                                    <span
                                                        className={`text-gray-400 text-xs mb-1 ${message.user === username ? "text-right" : "text-left"}`}
                                                    >
                                                        {message.user === username ? "You" : message.user}
                                                    </span>

                                                    <div
                                                        className={`p-2 rounded-lg max-w-[140px] break-words relative ${message.user === username
                                                            ? "bg-blue-500 text-white ml-auto text-right"
                                                            : "bg-gray-200 text-gray-900 mr-auto text-left"
                                                        }`}
                                                    >
                                                        {message.text}
                                                    </div>
                                                    <span className={`text-gray-600 text-[10px] mt-1 ${message.user === username ? "text-right" : "text-left"}`}>
                                                        {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                        
                                        {/* NEW: Typing indicator */}
                                        {typingUser && (
                                            <div className="flex items-center text-gray-500 text-sm italic">
                                                <span>{typingUser} is typing</span>
                                                <span className="ml-1 animate-pulse">...</span>
                                            </div>
                                        )}
                                        
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={handleInputChange}  // NEW: Changed to handleInputChange
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder="Type your message..."
                                            className="w-full text-white font-bold px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            className="bg-slate-400 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )
            }
        </div>
    )
}

export default ChatApp
