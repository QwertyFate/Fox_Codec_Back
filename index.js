const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;
app.use(bodyParser.json());
app.use(cors());
const {RegisterNewUser, compareuser, findAll, ConnectingtoDB, userID,sendMessage, getMessages} = require("./api/mysqldb")
let currentUserId = 0;

ConnectingtoDB();

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

app.get("/getuser", async (req,res) => {
    const Data = await findAll(currentUserId);
    res.send(Data)
    
});

app.post("/send-message", async (req,res) => {
    
    await sendMessage(currentUserId,req.body.friendid,req.body.message);
    res.send("all good")
})

app.get("/getCurrentUser", async (req,res) => {
    res.send({currentUserId});
    console.log({currentUserId});
})

app.post("/get-messages", async (req,res) => {
    const messagesGathered = await getMessages(req.body.user1,req.body.user2);
    res.send(messagesGathered);
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})


