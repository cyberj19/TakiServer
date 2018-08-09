const path = require('path');
const session = require('express-session');
const express = require('express');
const HTTPServer = require('http');
const bodyParser = require('body-parser');


exports.APIServer = function(params, taki) {
    let app = express();
    app.use(bodyParser.json());
    
    app.set('trust proxy', 1); 
    const sessionSettings = {
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true, maxAge: 60000 }
    };
    app.use(session(sessionSettings));
    app.use(express.static(path.resolve(__dirname, "..", "public")));

    let http = HTTPServer.Server(app);
    const auth = function(request, response, next) {
        if (!request.session.player) {
            console.warn('Unauthorized request from client');
            response.status(401).send({success: false});
            return;
        }
        request.session.authorized = true;
        next();
    }
    
    app.get('/api/view', function(request, response, next) {
        let res = taki.getView(request.query.player);

        if (res.success) response.status(200).send(res);
        else response.status(400).send(res);
    });

    app.get('/api/info', function(request, response, next) {
        console.info('GET from info API');
        response.status(200).send('This is the taki service');
    });

    app.post('/api/game/move', function(request, response, next) {
        const params = {
            player: request.body.player,
            game: request.body.game,
            move: request.body.move,
            card: request.body.card
        };

        let res = taki.move(params);
        response.status(200).send(res);
    });

    app.post('/api/join', function(request, response, next) {

        let res = taki.joinGame({
            player: request.body.player,
            game: request.body.game,
            asObserver: request.body.asObserver
        });

        if (res.success) {
            console.info('Player joined game');
            response.status(200).send(res);
        } else {
            console.warn('Player request to join game denied');
            console.log(res);
            response.status(400).send(res);
        }
    });

    app.post('/api/leave', function(request, response, next) {
        let res = taki.leaveGame({
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

    app.post('/api/game/remove', function(request, response) {
        console.info('Game remove request');
        const game = request.body.game;
        const creator=request.body.player;
        taki.removeGame(game,creator, err => {
            if (err) {
                console.warn('Remove game failed. Error code ' + err);
                response.status(400).send({success:false,error:err});
            } else {
                console.info('Game removed successfuly');
                response.status(200).send({success:true});
            }
        });
    });
    app.post('/api/game/create', function(request, response, next) {
        console.info('New game create request');
        console.debug(request.body);
        const player = request.body.player;
        const game = request.body.game;
        const required_players = request.body.required_players;

        const res = taki.createGame({
            player: player,
            game: game,
            required_players: required_players
        });

        let statusCode = res.success ? 200:400;
        response.status(statusCode).send(res);
    });

    app.post('/api/login', function(request, response, next) {
        const player = request.body.player;
        console.info('New login request from ' + player);
        taki.registerPlayer(player, (err) => {
            if (err) {
                console.warn('Login failed. Error code: ' + err);
                response.status(400).send({success:false, error: err});
            } else {
                console.info('Login successful ' + player);
                response.status(200).send({success:true});
            }
        });
    });


    app.post('/api/logout', function(request, response, next) {
        const player  = request.body.player;
        console.info('Logout request from ' + player);
        taki.removePlayer(player);
        //delete request.player;
        response.status(200).send({success:true});
    });

    app.post('/api/game/message', function(request,response,next) {
        console.log('New message from ' + request.body.player);
        const res = taki.message({
            game: request.body.game,
            player: request.body.player,
            text: request.body.text
        });

        if (!res.success) response.status(400).send(res);
        else response.status(200).send(res);
    })

    this.start = function() {
        http.listen(params.port, function() {
            console.log('Listening on *:'+params.port);
        });
    };
}