import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UseAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UseAvatar/UserListItem';

export default function UpdateGroupChatModal({fetchAgain, fetchMessages, setFetchAgain}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameloading, setRenameloading] = useState(false);

    const toast = useToast();

    const { selectedChat, setSelectedChat, user } = ChatState();

    const handleRemove = async(user1)=>{
        if(user._id === user1._id) return;
        if(selectedChat.groupAdmin._id !== user._id && user1._id !== user._id){
            toast({
                title:"Only admins can remove someone",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        };

        try {
            setLoading(true);
            const config = {
                headers:{
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const {data} = await axios.put('/api/chat/groupremove', {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);

            user1._id === user._id ? setSelectedChat(): setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            setLoading(false);
        }
    }

    // Arrow Asynchronous function to handle the rename functionality
    const handleRename = async()=>{
        if(!groupChatName) return;

        try {
            setRenameloading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const {data} = await axios.put('api/chat/rename', {
                chatId: selectedChat._id,
                chatName: groupChatName,
            }, config);

            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameloading(false);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            });
            setRenameloading(false);
        }
        setGroupChatName("");
    }

    // Arrow Asynchronous function to handle the search user functionality
    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
          return;
        }
    
        try {
          setLoading(true);
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.get(`/api/user?search=${search}`, config);
          setLoading(false);
          setSearchResult(data);
        } catch (error) {
          toast({
            title: "Error Occured!",
            description: "Failed to Load the Search Results",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
    };

    // Arrow Asynchronous function to handle the add user functionality
    const handleAddUser = async(user1)=>{
    if(selectedChat.users.find((u)=> u._id === user1._id)){
        toast({
            title: "User Already in group!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom"
        });
        return;
    }

    if(selectedChat.groupAdmin._id !== user._id){
        toast({
            title: "Only admins can add someone!",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom"
        });
        return;
    }

    try {
        setLoading(true);
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
        const {data} = await axios.put('/api/chat/groupadd', {
            chatId: selectedChat._id,
            userId: user1._id,
        }, config);

        setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        setLoading(false);
    } catch (error) {
        toast({
            title: "Error Occured",
            description: error.response.data.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom"
        });
        setLoading(false);
    }
    setGroupChatName("");
    };


    return (
    <>
        <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />

        <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader
                fontSize="35px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
            >
            {selectedChat.chatName}
            </ModalHeader>

            <ModalCloseButton />
            <ModalBody>
                <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                    {selectedChat.users.map((u)=>(
                        <UserBadgeItem
                            key={u._id}
                            user={u}
                            handleFunction={() => handleRemove(u)}
                        />
                    ))}
                </Box>
                <FormControl display="flex">
                    <Input
                        placeholder='Chat Name'
                        mb={3}
                        value={groupChatName}
                        onChange={(e)=> setGroupChatName(e.target.value)}
                    />
                    <Button
                        variant="solid"
                        colorScheme='teal'
                        ml={1}
                        isLoading = {renameloading}
                        onClick={handleRename}
                    >
                        Update
                    </Button>
                </FormControl>
                <FormControl>
                    <Input
                        placeholder='Add User to Group'
                        mb={1}
                        onChange={(e)=> handleSearch(e.target.value)}
                    />
                </FormControl>
                {loading ? (
                    <Spinner size="lg"/>
                ) : (
                    searchResult?.map((user)=>(
                        <UserListItem
                            key={user._id}
                            user={user}
                            handleFunction={()=> handleAddUser(user)}
                        />
                    ))
                )}
            </ModalBody>
            <ModalFooter>
            <Button colorScheme='red' onClick={()=>handleRemove(user)}>
                Leave Group
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    </>
  )
}
