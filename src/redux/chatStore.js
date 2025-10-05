import { configureStore } from "@reduxjs/toolkit";
import chatSlice from './slices/chatSlice'

const chatStore = configureStore({
    reducer:{
        chatReducer:chatSlice
    }
})

export default chatStore