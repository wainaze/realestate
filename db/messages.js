var records = [
    { 
        id : 1,
        senderId : 3,
        recepients : [1],
        date : '20151101121821',
        messageText : 'Please help, I have a trouble',
        status: 'read'
    },
    { 
        id : 2,
        senderId : 1,
        recepients : [3],
        date : '20151101122015',
        messageText : 'What can I do for you?',
        status: 'new'
    }      
];

exports.getMessages = function(userId){
    return records.filter(function(value){
        return value.senderId == userId || value.recepients.indexOf(userId) >= 0;
    });
}

exports.addMessage = function(message){
    var newId = Math.max.apply(Math, records.map(function(o) {
        return o.id;
    })) + 1;

    message.id = newId;
    records.push(message);
    return newId;
}

exports.getMessage = function(messageId) {
    for (var i = 0; i < records.length; i++) {
        if (records[i].id == messageId)
            return records[i];
    }

    return null;    
}