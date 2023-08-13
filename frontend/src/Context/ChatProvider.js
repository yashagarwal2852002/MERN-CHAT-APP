import {createContext, useContext, useState, useEffect}  from 'react';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({children})=>{
    // this variable is used to store the logged in user
    const [user, setUser] = useState();

    // This variable is used to store the information about selectedChat
    const [selectedChat, setSelectedChat] = useState();

    // This variable is used to store the all the chats present for the current users
    const [chats, setChats] = useState([]);

    const [notification, setNotification] = useState([]);
    
    const Navigate = useNavigate();

    useEffect(()=>{
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUser(userInfo);

        if(!userInfo){
            Navigate("/");
        }
    }, [Navigate]);
    return <ChatContext.Provider value ={{user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification}}>
        {children}
    </ChatContext.Provider>
};

export const ChatState = ()=>{
    return useContext(ChatContext);
}

export default ChatProvider;