import React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { addMessage, clearMessages } from '../redux/slices/chatSlice'
import mob from '../assets/mob.png'
import { useRef } from 'react'

const socket = io("https://socket-io-chatapp-backend-1.onrender.com")
function ChatApp() {
    const { messages } = useSelector(state => state.chatReducer)
    const dispatch = useDispatch()
    const [messageInput, setMessageInput] = useState('')
    const [username, setUsername] = useState("") //store username
    const [isNameSet, setIsNameSet] = useState(true);
    const sendMessage = () => {
        if (messageInput.trim() !== "") {
            const newMessage = { user: username, text: messageInput, time: new Date() }
            socket.emit("message", newMessage);
            setMessageInput("");
        }
    }
    const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);


    useEffect(() => {
        socket.on("message", (message) => {
            dispatch(addMessage(message));            //here first parameter is automatically the messages in the array second parameter is new message
        })
        return () => {
            socket.off("message");          //it is clean up functions.To avoid memory leakes //a function that “cleans up” things you set up earlier. //
        }
    }, [dispatch])

    return (
        <div>
            <h1 className='text-center text-blue-400 text-5xl font-bold p-6'>CHAT APP</h1>
            {
                isNameSet ?
                    (
                        <div className="flex items-center justify-evenly min-h-screen">
                            <div className='grid md:grid-cols-2  gap-3'>
                                <div>
                                    <img width={"450px"} src={mob} alt="" />
                                </div>
                                <div className="p-6 bg-white rounded-lg shadow-lg">
                                    <h1 className="text-xl font-semibold mb-4">Enter your name</h1>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
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
                        </div>) : (
                        <div className="flex items-center justify-center min-h-screen  ">
                            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg chat-box">
                                
                                   <div className='flex justify-between mb-2 '>
                                        
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
                                                <div key={index} className="flex flex-col">
                                                    {/* Username above the bubble */}
                                                    <span
                                                        className={`text-gray-400 text-xs mb-1 ${message.user === username ? "text-right" : "text-left"
                                                            }`}
                                                    >
                                                        {message.user === username ? "You" : message.user}
                                                    </span>

                                                    {/* Message bubble */}
                                                    <div
                                                        className={`p-2 rounded-lg max-w-[140px] break-words relative ${message.user === username
                                                            ? "bg-blue-500 text-white ml-auto text-right"
                                                            : "bg-gray-200 text-gray-900 mr-auto text-left"
                                                            }`}
                                                    >
                                                        {message.text}

                                                        {/* Timestamp */}

                                                    </div>
                                                    <span className={`text-gray-600 text-[10px] mt-1 ${message.user === username ? "text-right" : "text-left"}`}>
                                                        {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <div ref={messagesEndRef} />
                                                </div>
                                                


                                            ))
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
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