const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const mongoose = require("mongoose");
const GroupMessage = require("./models/groupMessage");

mongoose.connect("mongodb://localhost/labtest1", { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const loginRouter = require("./routes/login");
app.use("/login", loginRouter);
const groupRouter = require("./routes/group");
app.use("/room", groupRouter);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (userData) => {
    socket.join(userData.room);
    console.log(`${userData.username} joined room ${userData.room}`);
  });

  socket.on("chatMessage", async (message) => {
    try {
      const groupMessage = new GroupMessage({
        from_user: message.name,
        room: message.room,
        message: message.message,
      });

      await groupMessage.save();
    } catch (error) {
      console.error(error);
    }

    io.to(message.room).emit("message", {
      name: message.name,
      message: message.message,
    });
  });

  socket.on("typing", (user) => {
    socket.to(user.room).emit("userTyping", user.username);
  });

  socket.on("stopTyping", (user) => {
    socket.to(user.room).emit("userStoppedTyping", user.username);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

http.listen(3000, () => console.log("Server Started"));
