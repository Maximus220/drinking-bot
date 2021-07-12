const twitter = require('./utils/twitter');
const openWeather = require('./utils/openWeather');
const fs = require('fs');

var state;

//Json loads
const userPath = './json/users/';
const botName="BotDrinking";
var users = {};
var files = fs.readdirSync(userPath);
files.forEach(async element => {
    if(element[0]!="_") users[element.split('.').slice(0, -1).join('.')] = JSON.parse(fs.readFileSync(userPath+element, 'utf8'));
});

const debugNoTweet = false;

//Prototypes & useful functions load
String.prototype.countChar = function(){
    return this.split('').length;
}
function random(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//Main loop
setInterval(
    async function(){
        await drink();
    }, 60 *1000*60 //x1000 -> Seconds ; x60 -> Minutes
);

async function drink(){
    let msgList=[];
    for(const user in users){
        //Hour test
        state = true;
        if(users[user].utc){
            let hour = new Date().getUTCHours()+users[user].utc;
            if(!(hour>users[user].hours_limit[0])||!(hour<users[user].hours_limit[1])){
                state=false;
            }
        }
        //Message creation
        if(state){
            let message=new String();
            while(message.countChar()>280-(2+botName.length)||message.countChar()<10){
                message = await chooseMessage(users[user]);
            }
            msgList.push(message);
        }
    }
    if(!debugNoTweet){
        if(msgList.length>1){
            let lastTweetId=null;
            msgList = shuffle(msgList);
            for(let x=0;x<msgList.length;x++){
                if(x===0){
                    await twitter.tweet(msgList[0])
                    .then(res=>lastTweetId=res.data.id_str);
                }else{
                    await twitter.reply("@"+botName+" "+msgList[x], lastTweetId)
                    .then(res=>lastTweetId=res.data.id_str);
                }
            }
        }else if(msgList.length>0){
            twitter.tweet(msgList[0]);
        }
    }else{
        console.log(msgList);
    }
}
drink(); //OnLaunch

//Generate a full message
async function chooseMessage(user){
    let weather = '';
    if(user.temperature){
        let temp = await openWeather.weather(user.city_id, user.temperature.unit);
        let temperature = JSON.parse(temp).main.temp;
        if(temperature > user.temperature.hot){
            weather = replaceTemperature(user.temperature.unit, temperature, user.msg.weather.hot[random(0, user.msg.weather.hot.length-1)]) + " ";
        }else if(temperature < user.temperature.cold){
            weather = replaceTemperature(user.temperature.unit, temperature, user.msg.weather.cold[random(0, user.msg.weather.cold.length-1)]) + " ";
        }else{
            weather = replaceTemperature(user.temperature.unit, temperature, user.msg.weather.casu[random(0, user.msg.weather.cold.length-1)]) + " ";
        }
    }

    let pseudo = await twitter.userLookup(user.id);
    let welcome = user.msg.default[random(0, user.msg.default.length-1)].replace('%{user}%', pseudo.data[0].screen_name);

    let compliment = user.msg.compliments[random(0, user.msg.compliments.length-1)];

    return welcome + '\n\n' + weather + compliment;
}

function replaceTemperature(unit, temp, msg){
    switch(unit){
        case "imperial":
            return msg.replace('%{temp}%', temp+'°F');
        case "metric":
            return msg.replace('%{temp}%', temp+'°C');
        case "standard":
            return msg.replace('%{temp}%', temp+'°K');
    }
}

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
  