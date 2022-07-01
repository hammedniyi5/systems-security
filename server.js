const express = require('express');//import the library
const https = require('https');
const fs = require('fs');
const port = 443;
const app = express();//use the library
const md5 = require('md5');
const bodyParser = require('body-parser');
const {createClient} = require('redis');
const { fstat } = require('fs');


const redisClient = createClient({ url: 'redis://default@ola-redis.cit270.com:6379' });
//this creates a connection to the redis database



app.use(bodyParser.json());



const validatePassword = async (request, response)=>{
    const requestHashedPassword = md5(request.body.password);//get the password from the dbody and hash it
    const redisHashedPassword= await redisClient.hmGet('passwords',request.body.userName);// read password from redis
    const loginRequest = request.body;
    console.log("Request Body",JSON.stringify(request.body));

    
    if (requestHashedPassword==redisHashedPassword){
        response.status(200);
        response.send("Welcome");
    } else{
        response.status(401);
        response.send("Unauthorized");
    }

 
}

const savePassword = async (request, response)=>{
    const clearTextPassword = request.body.password;
    const hashedTextPassword = md5(clearTextPassword);
    await redisClient.hSet('passwords',request.body.userName, hashedTextPassword);
    response.status(200);
    response.send({result:"Saved"});
}

app.get('/',(request,response)=>{
    response.send("Hello");
})

app.post('/login',validatePassword);

app.post('/signup', savePassword);

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert'),
    passphrase: 'P@ssw0rd'
 }, app).listen(port, async() => {
     console.log('Listening.....')
     await redisClient.connect();
 })