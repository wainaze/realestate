var records = [{
    id: 1,
    username: 'jack',
    password: 'secret',
    displayName: 'Jack',
    photo: '/img/samples/noface.jpg',
    emails: [{
        value: 'jack@example.com'
    }],
    roles: [
        'landlord'
    ]
}, {
    id: 2,
    username: 'jill',
    password: 'birthday',
    displayName: 'Jill',
    photo: '/img/samples/noface.jpg',
    emails: [{
        value: 'jill@example.com'
    }],
    roles: [
        'landlord'
    ]
}, {
    id: 3,
    username: 'tenant',
    password: 'tenant',
    displayName: 'Tenant',
    photo: '/img/samples/noface.jpg',
    emails: [{
        value: 'wbearfromru@gmail.com'
    }],
    roles: [
        'tenant'
    ]
}];

exports.findById = function(id, cb) {
    process.nextTick(function() {
        var idx = id - 1;
        if (records[idx]) {
            cb(null, records[idx]);
        } else {
            cb(new Error('User ' + id + ' does not exist'));
        }
    });
}

exports.findByUsername = function(username, cb) {
    process.nextTick(function() {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.username === username) {
                return cb(null, record);
            }
        }
        return cb(null, null);
    });
}
