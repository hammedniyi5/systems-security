const express = require('express');//import the library

const port = 3000;
const app = express();//use the library
const md5 = require('md5');
const bodyParser = require('body-parser');
const {createClient} = require('redis');
const redisClient = createClient(
{
    socket:{
        port:6379,
        host:"127.0.0.1"
    }
}
);//this creates a connection to the redis database



app.use(bodyParser.json());

app.listen(port, async ()=>{
    await redisClient.connect();
    console.log("Listening on port: "+port);
})

const signup = async (request,response)=>{
    console.log('signup',request.body);
}

const validatePassword = async (request, response)=>{
    const requestHashedPassword = md5(request.body.password);//get the password from the dbody and hash it
    const redisHashedPassword= await redisClient.hmGet('password',request.body.userName);// read password from redis
    const loginRequest = request.body;
    console.log("Request Body",JSON.stringify(request.body));

    
    if (requestHashedPassword==redisHashedPassword){
        response.status(200);
        response.send("Welcome");
    } else{
        request.status(401);
        response.send("Unauthorized");
    }

    
}
app.get('/',(request,response)=>{
    response.send("Hello");
})

app.post('/login',validatePassword);

app.post('/signup', signup);