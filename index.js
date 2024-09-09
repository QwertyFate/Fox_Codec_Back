const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;
app.use(bodyParser.json());
app.use(cors());
const {RegisterNewUser, compareuser, findAll, ConnectingtoDB, userID,sendMessage} = require("./api/mysqldb")
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
    res.send(Data.authenticationprocess? "Logged In" : "Wrong username or password");
    

})

app.get("/getuser", async (req,res) => {
    const Data = await findAll(currentUserId);
    res.send(Data)
    
});

app.post("/send-message", async (req,res) => {
    
    await sendMessage(currentUserId,req.body.friendid,req.body.message);
    res.send("all good")
})

app.get("/get-messages")

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})


