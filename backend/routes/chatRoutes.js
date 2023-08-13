const express = require('express');
const {protect} = require('../middlewares/authMiddleware');
const {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup} = require('../controllers/chatControllers');

const router = express.Router();

router.route('/').post(protect, accessChat); // This Route is used to create a one to one chat or access a one to one chat
router.route('/').get(protect, fetchChats); // This Route is used to access the all Chats for a particular user(Logged In User)
router.route("/group").post(protect, createGroupChat); // This Router is used to create a new group chat
router.route("/rename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup); 
router.route("/groupremove").put(protect, removeFromGroup);

module.exports = router;
