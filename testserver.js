var io = require('socket.io')(8080);

io.on('connection', function(socket){
    console.log('a user connected');

    console.log(socket.request.query);

    socket.on('test', function(msg){
        console.log(msg);
        console.log(socket.request.query);
    });
});

