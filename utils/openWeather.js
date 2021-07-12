const request = require('request-promise-native');

const fs = require('fs');

const credPath = './json/cred.json';
const cred = JSON.parse(fs.readFileSync(credPath, 'utf8'));

module.exports.weather = function(cityID, unit){
    return request('https://api.openweathermap.org/data/2.5/weather?id='+cityID+'&units='+unit+'&appid='+cred.openWeather);
}