var Twit = require('twit');
const fs = require('fs');

//Load bot
const credPath = './json/cred.json';
const cred = JSON.parse(fs.readFileSync(credPath, 'utf8'));
module.exports.twitObj = new Twit({
    consumer_key: cred.twitter.c_key,
    consumer_secret: cred.twitter.c_secret,
    access_token: cred.twitter.accToken,
    access_token_secret: cred.twitter.accToken_secret
  });


module.exports.getScreenName = async function(id){ //Get screen name from ID
    let tempR = await this.twitObj.get('users/show', {user_id: id});
    return tempR.data.screen_name;
}

module.exports.tweet = function(message){
    return this.twitObj.post('statuses/update', {status: message});
}

module.exports.reply = function(message, inReplyTo){
    return this.twitObj.post('statuses/update', {in_reply_to_status_id: inReplyTo, status: message});
}

module.exports.uploadMedia = function(media64){
    return this.twitObj.post('media/upload', { media_data: media64 });
}

module.exports.tweetMedia = function(media_id_string, message){
    return this.twitObj.post('statuses/update', { media_ids: new Array( media_id_string ),  status: message});
}

module.exports.tweetMediaReply = function(inReplyTo, media_id_string, message){
    return this.twitObj.post('statuses/update', { in_reply_to_status_id: inReplyTo, media_ids: new Array( media_id_string ),  status: message});
}

module.exports.dm = function(usr, message){
    return this.twitObj.post('direct_messages/events/new', {event:{type: 'message_create', message_create:{target:{recipient_id: usr}, message_data: {text:message}}}});
}

module.exports.fav = function(tweet){
    return this.twitObj.post('favorites/create', {id: tweet.id_str});
}

module.exports.getDm = function(){
    return this.twitObj.get('direct_messages/events/list', {count : 50});
}

module.exports.userLookup = function(id){
    return this.twitObj.get('users/lookup', {user_id: id, include_entities: false});
}

module.exports.userLookupFromSN = function(screen_name){
    return this.twitObj.get('users/lookup', {screen_name: screen_name, include_entities: false});
}

module.exports.getTimeline = function(userID, max_id = null){
    return this.twitObj.get('statuses/user_timeline', {user_id: userID, count: 200, ...(!!max_id && {max_id})});
}
module.exports.getTotalTimeline = async function(userID){
    var timeline = [];
    var tempTL = await this.getTimeline(userID);

    while(tempTL.data.length>0){
        timeline = [...timeline, ...tempTL.data];
        const maxId = "" + (BigInt(tempTL.data[tempTL.data.length-1].id_str) - 1n);
        tempTL = await this.getTimeline(userID, maxId);
    }

    return timeline;
}

module.exports.getFav = function(userID, max_id = null){
    return this.twitObj.get('favorites/list', {user_id: userID, count: 200, ...(!!max_id && {max_id})});
}
module.exports.getTotalFav = async function(userID, pagesLimit){
    var favlist = [];
    var tempFav = await this.getFav(userID);
    let page = 0;

    while(tempFav.data.length>0&&(page<pagesLimit)){
        favlist = [...favlist, ...tempFav.data];
        const maxId = "" + (BigInt(tempFav.data[tempFav.data.length-1].id_str) - 1n);
        tempFav = await this.getFav(userID, maxId);
        page++;
    }

    return favlist;
}

