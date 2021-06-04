const twitter = require('./utils/twitter');
const openWeather = require('./utils/openWeather');
const fs = require('fs');

const msgPath = './json/messages.json';
const msg = JSON.parse(fs.readFileSync(msgPath, 'utf8'));

setInterval(
    async function(){
        await drink();
    }, 60 *1000*60 //x1000 -> Seconds ; x60 -> Minutes
);

async function drink(){
    let message = await chooseMessage();
    twitter.tweet(message);
}
drink(); //OnLaunch

async function chooseMessage(){
    let temp = await openWeather.weather('4180439');
    let temperature = JSON.parse(temp).main.temp;
    let weather;
    if(temperature > 75){
        weather = msg.weather.hot[random(0, msg.weather.hot.length-1)].replace('%{temp}%', temperature+'°F');
    }else if(temperature < 60){
        weather = msg.weather.cold[random(0, msg.weather.cold.length-1)].replace('%{temp}%', temperature+'°F');
    }else{
        weather = msg.weather.casu[random(0, msg.weather.casu.length-1)].replace('%{temp}%', temperature+'°F');
    }

    let twinnn = await twitter.userLookup('1299562129163464704'); //1299562129163464704 jenn //1349030724612083714 maxi
    let welcome = msg.default[random(0, msg.default.length-1)].replace('%{user}%', twinnn.data[0].screen_name);

    let compliment = msg.compliments[random(0, msg.compliments.length-1)];

    let tip;
    for(let x=0;x<msg.tips.length;x++){
        if(msg.tips[x].state === 'unused'){
            tip = msg.tips[x].msg;
            msg.tips[x].state = 'used';
            fs.writeFileSync(msgPath, JSON.stringify(msg));
            break;
        }
    }
    if(tip==null) tip = '';

    return welcome + '\n\n' + tip + weather + " " + compliment;
}

function random(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}