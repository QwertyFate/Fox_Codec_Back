const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = 5000;
const bcrypt = require("bcrypt");
require("dotenv").config();
app.use(bodyParser.json());
app.use(cors());
const mysql = require("mysql2/promise");
let connection;
let userArr = [];
const randomSalt = 11;
let userID;



    const ConnectingtoDB = async () => { 
        try{
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: process.env.SQL_PASSWORD,
            database: 'chatappdb',
            port: '3306'
            });
            console.log("connected")
        } catch (error) {
            console.error('Error connecting to the database:', error);
        }
    }

const findAll = async () => {
    userArr = [];
    try {
        const mysql = 'SELECT * FROM `Users`';
        const [rows, fields] = await connection.query(mysql);
        for(let i = 0; i< rows.length; i++){
            if(rows[i].id !== userID){
                userArr.push({
                    id: rows[i].id,
                    username: rows[i].username
                });
            }
        }
      } catch (err) {
        console.log(err);
      }
}

const RegisterNewUser = async (username, password) => {
    await ConnectingtoDB();
    const passwordHash = await bcrypt.hashSync(password, randomSalt);
    try{
        const insertuser = 'INSERT INTO `Users` (`username`, `password_hash`) VALUES (?,?)';
        const [rows] = await connection.query(insertuser, [username, passwordHash]);
        console.log(rows);
    }catch(error){
        console.error(error);
    }

}



const compareuser = async (username, password) => {
 
    await ConnectingtoDB();
    const grabUser='SELECT * FROM `Users` WHERE `username` = ?';
    const [rows] = await connection.query(grabUser, username)
    if (rows.length === 0){
        return(false)} 
    else {
        userID = rows[0].id;
        return (await bcrypt.compare(password, rows[0].password_hash));
    }
    // return(compareHash);
}

const starttoFind = async () => {
    await ConnectingtoDB();
    await findAll();
}

app.post("/Register", async (req, res) => {
    await RegisterNewUser(req.body.username,req.body.password)
    console.log(req.body);
    res.send(req.body)
})

app.post("/login",async (req,res) => {
    console.log(await compareuser(req.body.username, req.body.password))
    res.send(await compareuser(req.body.username, req.body.password)? "Logged In" : "Wrong username or password");

})

app.get("/getuser", async (req,res) => {
    await starttoFind();
    res.send(userArr)
    
});

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})


