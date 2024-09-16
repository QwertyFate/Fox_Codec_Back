const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require('http');
const {Server} = require('socket.io')
const port = 5000;
const app = express();
app.use(bodyParser.json());
app.use(cors());

const {RegisterNewUser, compareuser, findAll, ConnectingtoDB, userID,sendMessage, getMessages} = require("./api/mysqldb")
let currentUserId = 0;

ConnectingtoDB();

const server = http.createServer(app);
const io = new Server (server, {
    cors: {
        origin:"http://localhost:3000",
        methods: ["GET","POST"],
    }
});

io.on("connection",(socket) => {
    console.log(`a user connected: ${socket.id}`);


    socket.on("joinRoom", (roomId) => {
        console.log(roomId)
        socket.join(roomId);
        console.log(`joined room ${roomId}`)
    });

    socket.on("disconnect", () => {
        console.log(`user disconnected ${socket.id}`);
    })



    socket.on("sendMessage" , async (data) => {
        console.log(data)
        const {userId, friendId, message} = data;
        await sendMessage(userId, friendId, message);
        const room = [userId, friendId].sort().join("-");
        console.log(room)
        socket.to(room).emit("newMessage", {message,userId,friendId})
    })
    
});




app.post("/Register", async (req, res) => {
    await RegisterNewUser(req.body.username,req.body.password)
    console.log(req.body);
    res.send(req.body)
})

app.post("/login",async (req,res) => {
    let Data = await compareuser(req.body.username, req.body.password);
    currentUserId = Data.userID;
    res.send(Data);
    

})

app.post("/getuser", async (req,res) => {
    const Data = await findAll(req.body.userID);
    res.send(Data)
    
});

app.post("/send-message", async (req,res) => {
    
    await sendMessage(req.body.userID,req.body.friendid,req.body.message);
    io.emit("newMessage", {message: req.body.message, userId: req.body.userID, friendId: req.body.friendid})
    res.send("all good")
})


app.post("/get-messages", async (req,res) => {
    const messagesGathered = await getMessages(req.body.user1,req.body.user2);
    res.send(messagesGathered);
})

server.listen(port, () => {
    console.log(`listening to port ${port}`);
})


