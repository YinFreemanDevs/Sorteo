const Twit = require('twit');  // 
const express = require('express');
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const fs = require('fs');


const app = express();


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_KEY_SECRET;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

//GLOBAL VARIABLES
let counter = 0;
let check = false;


//TWITTER API KEYS
let T = new Twit({
  consumer_key:         API_KEY,
  consumer_secret:      API_SECRET,
  access_token:         ACCESS_TOKEN,
  access_token_secret:  ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
});

//POST FORM RECEIVING DATA
app.post("/check", async (req,res)=>{
  let user = req.body.alias;    //RECEIVING USER FORM 
  if(user.includes("@") === true){    //CHECKING IF DATA HAVE @
    usu = user.split("@");
    user = usu[1];
  };
  let id_bitcobie_twit = req.body.bitcobie;   //RECEIVING BODY
  let link_twitt = req.body.tweet;  //RECEIVING TWEET
  T.get('users/show', { screen_name: user },  function (err, data, response) {
      if(data.errors){  //IF USER EXIST
        check = true;
        return console.log("No existe el usuario");
      }      
      T.get('statuses/user_timeline', { screen_name:  user, count: 100, }, function(err, data, response) {
        if(data.length === 0){    // IF USER HAVE TWEETS
          return console.log("No existe información sobre ese usuario");
        }
        let x=0;        
        while(x < data.length){   // ANALICE 
              if(data[x].text.includes("#bitcobiePOW")) {
                check = false;
                let i=0;
                let rawdata = fs.readFileSync(__dirname + '/bd.json');              
                if(Object.entries(rawdata).length === 0){
                    let newUser = [{
                        usuario: user,
                        twitt: data[x].text,
                        link: link_twitt,
                        participacion: counter,
                        twitBitcobieID: id_bitcobie_twit,
                        timestamp: Date.now()
                    }];             
                    rawdata = JSON.stringify(newUser)
                    fs.writeFileSync(__dirname + '/bd.json', rawdata);
                    counter++;
                }else{                    
                    rawdata = fs.readFileSync(__dirname + '/bd.json');
                    rawdata = JSON.parse(rawdata);                   
                    while(i < rawdata.length){
                        if(rawdata[i].usuario.toUpperCase() === user.toUpperCase()){
                            if(rawdata[i].twitBitcobieID === id_bitcobie_twit){
                                check = true;
                                console.log("Ya has participado en ese tweet");
                                break;
                            }      
                        }                        
                        i++;
                    }                    
                    if(check===false){                        
                        rawdata = fs.readFileSync(__dirname + '/bd.json');
                        rawdata = JSON.parse(rawdata); 
                        const newUser = ({
                            usuario: user,
                            twitt: data[x].text,
                            link: link_twitt,
                            participacion: counter,
                            twitBitcobieID: id_bitcobie_twit,
                            timestamp: Date.now()
                        })
                        console.log(`Proceso de verificación favorable para ${user}`);
                        counter++;
                        rawdata.push(newUser);
                        rawdata = JSON.stringify(rawdata);
                        fs.writeFileSync(__dirname + '/bd.json', rawdata);   
                    }     
                }                   
              }else{
                check = true;
                console.log("Ningún hashtag con ese usuario");
                break;
              }             
              x++
        }       
      });
    });
    await new Promise( resolve => setTimeout(resolve, 5000));
    if(check === false){
      res.redirect("http://localhost:3000");
    }else{
      res.redirect("http://localhost:3000/fail");
    }
});

app.get("/fail", (req,res)=> {
  res.sendFile(__dirname + "/public/fail.html");
});

app.listen(3000,()=>{
  console.log("server on port 3000");
});



 