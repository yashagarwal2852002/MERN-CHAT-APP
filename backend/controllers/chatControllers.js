const Chat = require('../Models/chatModel');
const User = require('../Models/userModel');


// Function to handle the request to create a One to One Chat
const accessChat = async(req, res)=>{
    const {userId} = req.body;

    if(!userId){
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            {users: {$elemMatch: { $eq: req.user._id}}},
            {users: {$elemMatch: { $eq : userId}}},
        ],
    }).populate("users", "-password").populate("latestMessage");
    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: 'name pic email',
    });
    if(isChat.length > 0){
        res.send(isChat[0]);
    }else{
        var chatData = {
            chatName : "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
        }

        try{
            const createdChat = await Chat.create(chatData);

            const FullChat = await Chat.findOne({
                _id: createdChat._id
            }).populate("users", "-password");
            res.status(200).send(FullChat);

        }
        catch(error){
            res.status(400);
            throw new Error(error.message);
        }
    }
}


// Arrow Function to handle the request to fetch all the Chats of a specific user
const fetchChats = async(req, res)=>{
    try {
        Chat.find({users: {$elemMatch : {$eq: req.user._id}}})
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({updatedAt : -1})
            .then(async(results)=>{
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select : "name pic email",
                });
                res.status(200).send(results);
            })
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}

// Arrow Functions(Call Back Function) to handle the request to create a new Group Chat
const createGroupChat = async(req, res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message: "Please fill all the fields"});
    }

    var users = JSON.parse(req.body.users);
    if(users.length < 2){
        return res.status(400).send("More than 2 users are required to form a group chat");
    }

    users.push(req.user);

    try {
        const grouptChat = await Chat.create({
            chatName : req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });

        const fullGroupChat = await Chat.findOne({_id : grouptChat._id})
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
}

// Arrow Function to handle the request of rename a group chat
const renameGroup = async(req, res)=>{
    const {chatId, chatName} = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true,
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    
    if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(updatedChat);
    }
}

// Arrow Function to handle the request of adding a user in the Group Chat
const addToGroup = async(req, res)=>{
    const {chatId, userId} = req.body;

    const added = await Chat.findByIdAndUpdate(chatId,
    {
        $push: {users: userId},
    },
    {new : true,}
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!added){
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(added);
    }
}

// Arrow Function to handle the request of removing a user from the Group Chat
const removeFromGroup = async(req, res)=>{
    const {chatId, userId} = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId,
    {
        $pull: {users: userId},
    },
    {new : true}
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    
    if(!removed){
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(removed);
    }
}

module.exports = {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup};