import { Avatar, Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender, getSenderFull } from '../config/Chatlogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

export default function MyChats({fetchAgain}) {
  const [loggedUser, setLoggedUser] = useState();
  const {user,selectedChat,  setSelectedChat, chats, setChats} = ChatState();
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  
  // Function to fetch all the Chats for the logged in User
  const fetchChats = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(()=>{
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain])
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={2}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      border="none"
    >
      <Box
        py={2}
        px={2}
        fontSize="18px"
        fontFamily="Work sans"
        display="flex"
        bg="rgb(237, 242, 247)"
        w="100%"
        borderRadius="lg"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontWeight="semibold">Chats</Text>
        
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        pb={2}
        pt={2}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {!loading ? (
          <Stack overflowY="scroll" gap={0}>
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "white"}
                color={selectedChat === chat ? "white" : "black"}
                px={1}
                py={2}
                borderBottom="1px solid #d2cecea3"
                display="flex"
                alignItems="center"
                w="100%"
                key={chat._id}
              >
                <Avatar
                  mr={3}
                  size="md"
                  bg="#E8E8E8"
                  p="1px"
                  cursor="pointer"
                  name={getSenderFull(loggedUser, chat.users).name}
                  src={!chat.isGroupChat ? getSenderFull(loggedUser, chat.users).pic : "https://icons.veryicon.com/png/o/commerce-shopping/soft-designer-online-tools-icon/group-38.png"}
                />
                <Box>
                  <Text fontWeight="400" mt="-1px">
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                  <Text fontSize="13px" fontWeight="400px" fontFamily='"Segoe UI", "Helvetica Neue", Helvetica, "Lucida Grande", Arial, Ubuntu, Cantarell, "Fira Sans", sans-serif'>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  )
}
