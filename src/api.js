const path = require('path');
const session = require('express-session');
const express = require('express');
const HTTPServer = require('http');
const bodyParser = require('body-parser');
//const serveStatic = require('serve-static');

exports.APIServer = function(params, taki) {
    var app = express();
    app.use(bodyParser.json()); // todo: check error handling when not json
    
    app.set('trust proxy', 1); // trust first proxy: check this
    var sessionSettings = {
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true, maxAge: 60000 }
    };
    app.use(session(sessionSettings));
    app.use(express.static(path.resolve(__dirname, "..", "public")));

    var http = HTTPServer.Server(app);
    var auth = function(request, response, next) {
        if (!request.session.player) {
            console.warn('Unauthorized request from client');
            response.status(401).send({success: false});
            return;
        }
        request.session.authorized = true;
        next();
    }
    
    app.get('/api/info', function(request, response, next) {
        console.info('GET from info API');
        response.status(200).send('This is the taki service');
    });

    app.get('/api/view', function(request, response, next) {
        console.info('GET from VIEW API');
        response.status(200).send(JSON.stringify( taki.getView()));
    });

    app.get('/api/game', function(request, response, next) {
        console.log(request.query);
        var res = taki.getGameView({
            game: request.query.game,
            player: request.query.player
        });

        if (res.success) response.status(200).send(res);
        else response.status(400).send(res);
    });

    app.post('/api/game/move', function(request, response, next) {
        var params = {
            player: request.body.player,
            game: request.body.game,
            move: request.body.move,
            card: request.body.card
        };

        var res = taki.move(params);
        response.status(200).send(res);
    });
    app.post('/api/join', function(request, response, next) {

        var res = taki.joinGame({
            player: request.body.player,
            game: request.body.game
        });

        if (res.success) {
            console.info('Player joined game');
            response.status(200).send(res);
        } else {
            console.warn('Player request to join game denied');
            response.status(400).send(res);
        }
    });

    
    app.post('/api/leave', function(request, response, next) {
        var res = taki.leaveGame({
            player: request.body.player,
            game: request.body.game,
        });

        if (res.success) {
            console.info('Player has left game');
            response.status(200).send(res);
        } else {
            console.warn('Player request to leave game denied');
            response.status(400).send(res);
        }
    });

    app.post('/api/create', function(request, response, next) {
        console.info('New game create request');
        var player = request.body.player;
        var game = request.body.game;
        var required_players = request.body.required_players;

        var res = taki.createGame({
            player: player,
            game: game,
            required_players: required_players
        });

        let statusCode = res.success ? 200:400;
        response.status(statusCode).send(res);
    });

    app.post('/api/login', function(request, response, next) {
        const name = request.body.name;

        console.info('New login request from ' + name);
        const res = taki.registerPlayer({name: request.body.name});

        if (!res.success) {
            response.status(402).send(res);
            console.warn('Login failed. Error code ' + res.error);
        } else {
            request.session.player = {name: name};
            console.info('Login successful');
            response.status(200).send(res);
        }
    });


    app.post('/api/logout', function(request, response, next) {
        console.info('Logout request from ' + request.session.player.name);
        taki.removePlayer({name: request.session.player.name});
        delete request.session.player;
        response.status(200).send({success:true});
    });

    app.post('/api/game/message', function(request,response,next) {
        console.log('New message from ' + request.body.player);
        var res = taki.message({
            game: request.body.game,
            player: request.body.player,
            text: request.body.text
        });

        if (!res.success) response.status(400).send(res);
        else response.status(200).send(res);
    })

    this.start = function() {
        http.listen(params.port, function() {
            console.log('Listening on *:1000');
        });
    };
}