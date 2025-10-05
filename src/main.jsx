import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import chatStore from './redux/chatStore.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Provider store={chatStore}> <App /></Provider>
  </StrictMode>,
)
