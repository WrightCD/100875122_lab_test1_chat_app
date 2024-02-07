// group.js

const express = require("express");
const router = express.Router();
const GroupMessage = require("../models/groupMessage");

// Get All Group Messages or create a new Group Message
router
  .route("/")
  .get(async (req, res) => {
    try {
      const groupMessages = await GroupMessage.find();
      res.json(groupMessages);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
  .post(async (req, res) => {
    const { from_user, room, message } = req.body;

    const groupMessage = new GroupMessage({
      from_user,
      room,
      message,
    });

    try {
      const newGroupMessage = await groupMessage.save();
      res.status(201).json(newGroupMessage);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

// Delete Group Message
router.delete("/:id", getGroupMessageById, async (req, res) => {
  try {
    await res.groupMessage.remove();
    res.json({ message: "Group message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getGroupMessageById(req, res, next) {
  try {
    const groupMessage = await GroupMessage.findById(req.params.id);
    if (groupMessage == null) {
      return res.status(404).json({ message: "Cannot find group message" });
    }
    res.groupMessage = groupMessage;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  next();
}

// Get Group Messages by room
router.get("/byroom/:room", async (req, res) => {
  const room = req.params.room;

  try {
    const groupMessages = await GroupMessage.find({ room });
    res.json(groupMessages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
