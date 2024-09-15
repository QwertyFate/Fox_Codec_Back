const bcrypt = require("bcrypt");
require("dotenv").config();
const mysql = require("mysql2/promise");
let connection;
let userArr = [];
const randomSalt = 11;
let userID;

const ConnectingtoDB = async () => { 
    if (!connection || connection.connection._closing) {
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
}
const findAll = async (userID) => {
    userArr = [];
    try {
        const mysql = 'SELECT * FROM `Users`';
        const [rows, fields] = await connection.query(mysql);
        for(let i = 0; i< rows.length; i++){
            if(rows[i].id != userID){
                    userArr.push({
                    id: rows[i].id,
                    username: rows[i].username
                    
                });
                console.log(userArr)
            }
        }
      return(userArr);  
      } catch (err) {
        console.log(err);
      }
}

const RegisterNewUser = async (username, password) => {
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
    const grabUser='SELECT * FROM `Users` WHERE `username` = ?';
    const [rows] = await connection.query(grabUser, username)
    if (rows.length === 0){
        return(false)} 
    else {
        let authenticationprocess = await bcrypt.compare(password, rows[0].password_hash);
        userID = rows[0].id;
        return {authenticationprocess, userID };
    }
    // return(compareHash);
}

const sendMessage = async (user1, user2, content) => {
    try{
    const messageData = 'INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`) VALUES (?,?,?)';
    const [rows] = await connection.query(messageData, [user1,user2,content]);
    }catch(error){console.error(error)} 
};

const getMessages = async(user1,user2) => {
    try{
        const messagesData = 'SELECT * FROM `messages` WHERE(`sender_id`  = ? AND `receiver_id` = ?) OR (`sender_id` = ? AND `receiver_id` = ?)';
        const [rows] = await connection.query(messagesData, [user1,user2,user2,user1]);
        return(rows);
    }catch(error){console.error(error)}
}

module.exports = {ConnectingtoDB, findAll,compareuser ,RegisterNewUser,userArr,userID,sendMessage, getMessages};