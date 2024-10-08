const bcrypt = require("bcrypt");
require("dotenv").config();
const mysql = require("mysql2/promise");
let pool;
let userArr = [];
const randomSalt = 11;
let userID;

const ConnectingtoDB = async () => { 
    if (!pool) {
        try{
            pool = await mysql.createPool({
                host: 'o1j.h.filess.io',
                user: 'chatappdb_applesadbe',
                password: process.env.SQL_PASSWORD,
                database: 'chatappdb_applesadbe',
                port: '3306',
                connectionLimit: 10,
                waitForConnections: true,
                queueLimit:0,
                connectTimeout: 30000,
                });
                console.log("connected pool")
            } catch (error) {
                console.error('Error connecting to the database:', error);
            }       
   
    }
}
const findAll = async (userID) => {
    let connection;
    userArr = [];
    try {
        connection = await pool.getConnection();
        const findusers = 'SELECT * FROM `Users`';
        const [rows] =  await connection.query(findusers);
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
      } finally {
        if (connection) {
            connection.release();
        }
      }
}

const RegisterNewUser = async (username, password) => {
    let connection;
    const passwordHash = await bcrypt.hashSync(password, randomSalt);
    try{
        connection = await pool.getConnection();
        const insertuser = 'INSERT INTO `Users` (`username`, `password_hash`) VALUES (?,?)';
        const [rows] = await connection.query(insertuser, [username, passwordHash]);
        console.log(rows);
    }catch(error){
        console.error(error);
    } finally {if (connection) {connection.release()}}

}

const compareuser = async (username, password) => {
    let connection;
    try{
        connection = await pool.getConnection();
        const grabUser='SELECT * FROM `Users` WHERE `username` = ?';
        const [rows] = await connection.query(grabUser, username)
        if (rows.length === 0){
            return(false)} 
        else {
            let authenticationprocess = await bcrypt.compare(password, rows[0].password_hash);
            userID = rows[0].id;
            return {authenticationprocess, userID };
        } 
    } catch (error) {console.error(error)

    } finally {
        if(connection) {
            connection.release();
        }
    }
    // return(compareHash);
}

const sendMessage = async (user1, user2, content) => {
    let connection;
    try{
    connection = await pool.getConnection();
    const messageData = 'INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`) VALUES (?,?,?)';
    const [rows] = await connection.query(messageData, [user1,user2,content]);
    }catch(error){console.error(error)
        
    } finally {
        if(connection) {
            connection.release();
        }
    }
};

const getMessages = async(user1,user2) => {
    let connection;
    try{
        connection = await pool.getConnection();
        const messagesData = 'SELECT * FROM `messages` WHERE(`sender_id`  = ? AND `receiver_id` = ?) OR (`sender_id` = ? AND `receiver_id` = ?)';
        const [rows] = await connection.query(messagesData, [user1,user2,user2,user1]);
        return(rows);
    }catch(error){console.error(error)
    } finally {
        if(connection) {
            connection.release();
        }
    }
}

module.exports = {ConnectingtoDB, findAll,compareuser ,RegisterNewUser,userArr,userID,sendMessage, getMessages};