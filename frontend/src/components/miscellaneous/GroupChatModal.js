import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box,
  } from "@chakra-ui/react";
  import axios from "axios";
  import { useState } from "react";
  import { ChatState } from "../../Context/ChatProvider.js";
  import UserBadgeItem from "../UseAvatar/UserBadgeItem.js";
  import UserListItem from "../UseAvatar/UserListItem.js";

  const GroupChatModal = ({ children }) => {
    // Function & Variables to handle the Group Chat Modal
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Variable which will store the name of chat which will be inserted the Looged user
    const [groupChatName, setGroupChatName] = useState("");

    // Variable which will store the array of users that going to be added in Group
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Variable which will store the inserted value in input tag which will store the users to be inserted
    const [search, setSearch] = useState("");

    // Variable which will store the search Result after the Searching
    const [searchResult, setSearchResult] = useState([]);

    // Variable loading which will store the users are searching
    const [loading, setLoading] = useState(false);

    // Variable groupChatLoading will store the loading state of group chat creattion
    const [groupChatLoading, setGroupChatLoading] = useState(false);

    const toast = useToast();
  
    const { user, chats, setChats } = ChatState();
  
    // This Functions handles the Click on Search Results
    const handleGroup = (userToAdd) => {
      if (selectedUsers.find((c) => c._id === userToAdd._id)) {
        toast({
          title: "User already added",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        return;
      }
      setSelectedUsers([...selectedUsers, userToAdd]);
    };
  
    // Function to handle the Search Funtionality for Users to be added in groupChat
    const handleSearch = async () => {
      if (!search) {
        toast({
          title: "Please Enter something in search",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-right",
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
  

    // This Functions handle the delete operation from the selected users which shows as a badges
    const handleDelete = (delUser) => {
      setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
    };
  

    // This functions handle the submit(create Group Chat) button which will create the chat using the chat name and selected users in database
    const handleSubmit = async () => {
      if (!groupChatName || !selectedUsers) {
        toast({
          title: "Please fill all the feilds",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
        return;
      }
      
      try {
        setGroupChatLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          `/api/chat/group`,
          {
            name: groupChatName,
            users: JSON.stringify(selectedUsers.map((u) => u._id)),
          },
          config
        );
        setGroupChatLoading(false);
        setChats([data, ...chats]);
        setSearch("");
        setSelectedUsers([]);
        setSearchResult([]);
        onClose();
        toast({
          title: "New Group Chat Created!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } catch (error) {
        toast({
          title: "Failed to Create the Chat!",
          description: error.response.data,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    };
  
    return (
      <>
        <span onClick={onOpen}>{children}</span>
  
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader
              fontSize="35px"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
            >
              Create Group Chat
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <Input
                  placeholder="Chat Name"
                  mb={3}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </FormControl>
              <FormControl>
              <Box mb={1} display="flex">
                <Input
                  placeholder="Add Users eg: John, Piyush, Jane"
                  value={search}
                  mr={2}
                  onChange={(e)=>{
                    setSearch(e.target.value);
                    if(e.target.value === '') setSearchResult([]);
                    }}
                />
                <Button onClick={handleSearch} isLoading={loading}>Go</Button>
                </Box>
              </FormControl>
              <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleDelete(u)}
                  />
                ))}
              </Box>
              {!loading && searchResult
                  ?.slice(0, 4)
                  .map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={()=>{handleGroup(user)}}
                    />
                  ))}
            </ModalBody>
            <ModalFooter>
              <Button w="100%" onClick={handleSubmit} colorScheme="blue" isLoading={groupChatLoading}>
                Create Chat
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default GroupChatModal;