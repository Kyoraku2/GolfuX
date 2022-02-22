// Chargement des modules 
var express = require('express');
const { all } = require('express/lib/application');
const { Worker } = require('worker_threads')
var app = express();

// cf. https://www.npmjs.com/package/socket.io#in-conjunction-with-express
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 8080;

server.listen(process.env.PORT || port, function() {
    console.log("C'est parti ! En attente de connexion sur le port "+port+"...");
});

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static('./'));
// set up to 
app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/index.html');
});

function readLevel(level){
    const fs = require('fs');
    let rawdata = fs.readFileSync(level+'.json');
    let jsonRes = JSON.parse(rawdata);
    //console.log(jsonRes);
    return jsonRes;
}


/***************************************************************
*           Gestion des clients et des connexions
***************************************************************/
const Ball = require('./ball.js');
const Hole = require('./hole.js');
const Level = require('./level.js');
const Obstacle = require('./Obstacle.js');
// TODo export les obstacle
var Box2D = require('./build/Box2D_v2.2.1_min.js');

Box2D().then(function(r){
    Box2D = r;
    using(Box2D, "b2.+");
    var world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0) );
    console.log(world)
    //var golfux = new GolfuxServer();
});



function using(ns, pattern) {    
    if (pattern == undefined) {
        // import all
        for (var name in ns) {
            this[name] = ns[name];
        }
    } else {
        if (typeof(pattern) == 'string') {
            pattern = new RegExp(pattern);
        }
        // import only stuff matching given pattern
        for (var name in ns) {
            if (name.match(pattern)) {
                this[name] = ns[name];
            }
        }       
    }
}

function createLevel(game,level){
    const fs = require('fs');
    let rawdata = fs.readFileSync("./levels/solo/level"+level+".json");
    let jsonRes = JSON.parse(rawdata);
    console.log(jsonRes);
    game.currentLevel = new Level();
    for(const object of jsonRes.holes){
        var hole = new Hole(100+game.currentLevel.holes.length);
        hole.setPos(new b2Vec2(object.pos.x,object.pos.y));
        hole.setRadius(object.radius);
        hole.createHole(game.world);
        game.currentLevel.holes.push(hole);
    }
    for(const [name,array] of Object.entries(jsonRes.obstacles)){
        array.forEach(object => {
            var radius = (object.shape == "circle") ? object.radius : -1;
            var vectrices = (object.shape == "polygon") ? object.vectrices : -1;
            var angle = (object.shape == "box") ? object.angle : 0;
            var width = (object.shape == "box" || name == "spawn" || name == "wind") ? object.heightWidth.width : 0;
            var height = (object.shape == "box" || name == "spawn" || name == "wind") ? object.heightWidth.height : 0;
            switch(name){
                case "bumper":
                    game.currentLevel.createBumper(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.isstatic, width, height, object.radius, object.vectrices);
                break;
                case "portal":
                    game.currentLevel.createPortal(new b2Vec2(object.enter_pos.x, object.enter_pos.y), new b2Vec2(object.exit_pos.x, object.exit_pos.y), object.bidirectional, object.hx1, object.hy1, object.hx2, object.hy2, object.direction1, object.direction2);
                break;
                case "wind":
                    game.currentLevel.createWind(new b2Vec2(object.middle_pos.x, object.middle_pos.y), width, height, object.acceleration, new b2Vec2(object.direction.x, object.direction.y));
                break;
                case "spawn":
                    game.currentLevel.createSpawn(new b2Vec2(object.middle_pos.x, object.middle_pos.y), width, height);
                break;
                default:
                    game.currentLevel["create"+name.charAt(0).toUpperCase()+name.slice(1)](new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, width, height, radius, vectrices, angle);
                break;
            }   
        });
    }
}

function clickCollideRect(pos,obj){
    return pos.x >= obj.middle_pos.x-obj.hx
            && pos.x <= obj.middle_pos.x+obj.hx
            && pos.y >= obj.middle_pos.y-obj.hy
            && pos.y <= obj.middle_pos.y+obj.hy;
}

function placeBall(game,pos){
    var spawn_area;
    for(var i = 0 ; i < game.currentLevel.obstacles['spawn'].length ; ++i){
        if(clickCollideRect(pos,game.currentLevel.obstacles['spawn'][i])){
            spawn_area = game.currentLevel.obstacles['spawn'][i];
            break;
        }
    }
    if(spawn_area === undefined){
        return false;
    }
    game.balls[game.current] = new Ball(new Box2D.b2Vec2(pos.x,pos.y),game.current,game.world);
    return true;
}

function shoot(game,impulsion,index){
    console.log(game.balls)
    game.balls[index].body.ApplyLinearImpulse(new b2Vec2(impulsion.x, impulsion.y),true);
}

function computeBallPos(game){
    var allPos = {};
    for(var i=0 ; i<game.balls.length ; ++i){
        allPos[i] = {
            x:game.balls[i].body.GetPosition().x,
            y:game.balls[i].body.GetPosition().y
        }
    }
    return allPos;
}

let games = {};
let counter = 0;
let bMinLevels = 1; // TODO : à changer quand on ajoute/supprime des niveaux
let bMaxLevels = 10;

function createPassword(){
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var number = "0123456789".split("");
    
    var code = "";

    for(var i = 0; i<4; i++){
        if(Math.round(Math.random()*2) == 1){
            code += alphabet[Math.round(Math.random()*(alphabet.length-1))];
        }else{
            code += number[Math.round(Math.random()*(number.length-1))];
        }
    }
    return code;
}

function generateGameList(){
    var game_list=[];
    for(var i=0, keys=Object.keys(games) ,l=keys.length; i<l; ++i){
        if(games[keys[i]].nbPlayers > games[keys[i]].joueurs.length && !games[keys[i]].isPrivate){
            game_list.push({
                id : keys[i],
                name: games[keys[i]].name,
                nbPlayers: games[keys[i]].joueurs.length,
                maxPlayers: games[keys[i]].nbPlayers,
                nbManches: games[keys[i]].nbManches
            });
        }
    }
    return game_list;
}

function findGameByCode(code){
    for(const [key, value] of Object.entries(games)) {
        if(value.code.toLowerCase() === code.toLowerCase()){
            return key;
        }
    }
    return -1;
}

function getRandomLevels(n){
    var levels = [];
    var levelsBank = [];
    for(var i = bMinLevels ; i <= bMaxLevels ; ++i){
        levelsBank.push(i);
    }
    for(var i = 0 ; i < n ; ++i){
        var id = Math.floor(Math.random() * levelsBank.length);
        levels.push(levelsBank[id]);
        levelsBank.splice(id,1);
    }
    return levels;
}

function token(){
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
}

function getPlayerFromSock(game,sock){
    for(var i=0 ; i<game.joueurs.length ; ++i){
        if(game.joueurs[i].socket === sock){
            return i;
        }
    }
    return undefined;
}

function getPlayerFromToken(game,token){
    for(var i=0 ; i<game.joueurs.length ; ++i){
        if(game.joueurs[i].token === token){
            return i;
        }
    }
    return undefined;
}

function computePlayersPos(game){
    var pos = {};
    console.log(game)
    for(var i=0 ; i<game.joueurs.length ; ++i){
        pos[i] = game.joueurs[i].pos;
    }
    return pos;
}


io.on('connection', function (socket) {
    console.log("Un client s'est connecté");
    let game = null;
    
    socket.emit("gameList",generateGameList());

    socket.on("askToken",function(){
        socket.emit("getToken",token());
    });

    socket.on("CreateGame", function(obj){
        if(game !== null){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(obj.partie.nbPlayers < 2 || obj.partie.nbPlayers > 4 || obj.partie.nbManches < 1 || obj.partie.nbManches > 18 || games[game]){
            socket.emit("error", {message: "Erreur, mauvaises options de partie."});
            return;
        }
        counter++;
        game = counter;
        var code = createPassword();
        while(findGameByCode(code) !== -1){
            code = createPassword();
        }
        games[game] = obj.partie;
        games[game].code = code;
        games[game].levels = getRandomLevels(games[game].nbManches);
        games[game]["current"] = -1;
        games[game].joueurs = [];
        games[game].turnTimer = null;
        games[game].joueurs[0] = {socket: socket, points: 0, inHole:false, token: obj.token, pos:null, shot:false};
        console.log("Partie créée à l'indice "+game);
        console.log("Joueur connecté à l'indice 0");
        socket.emit("waiting",{
            name: games[game].name,
            nbPlayers: games[game].joueurs.length,
            maxPlayers: games[game].nbPlayers,
            nbManches: games[game].nbManches,
            code: games[game].code
        });

        // Simulation part
        games[game].world = new b2World(new b2Vec2(0.0, 0.0));
        games[game].world.Step(1/60, 3, 2);
        games[game].balls = [];
        games[game].currentLevel = null;
    });

    socket.on("JoinPublicGame", function(obj){
        if(game !== null || !games[obj.id] || getPlayerFromSock(games[obj.id],socket) !== undefined){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(obj.id < 0 || games[obj.id].isPrivate){
            socket.emit("error", {message: "Erreur, la partie sélectionnée est privée."});
            return;
        }

        if(games[obj.id] && games[obj.id].joueurs.length < games[obj.id].nbPlayers){
            games[obj.id].joueurs[games[obj.id].joueurs.length] = {socket: socket, points: 0, inHole:false, token:obj.token, pos:null, shot:false};
            game = obj.id;
            console.log("Joueur connecté à l'indice "+(games[game].joueurs.length-1));
            socket.emit("waiting",{
                name: games[game].name,
                nbPlayers: games[game].joueurs.length,
                maxPlayers: games[game].nbPlayers,
                nbManches: games[game].nbManches,
                code: games[game].code
            });
            if(games[game].joueurs.length >= 2){
                games[game].joueurs[0].socket.emit("canForceStart");
            }
            if(games[obj.id].joueurs.length == games[obj.id].nbPlayers){
                startGame();
            }else{
                updateWaitingRoom();
            }
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie"});
        }
    });

    socket.on("JoinPrivateGame", function(obj){
        if(game !== null){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }

        var gameId = findGameByCode(obj.code);
        if(gameId < 0){
            socket.emit("error", {message: "Erreur, la partie n'existe pas."});
            return;
        }

        var joiningPlayer = getPlayerFromToken(games[gameId],obj.token);
        if(joiningPlayer !== undefined){
            game = gameId;
            games[gameId].joueurs[joiningPlayer].socket = socket;
            games[gameId].joueurs[joiningPlayer].socket.emit("joinBack",{
                positions:computePlayersPos(games[gameId]),
                players:games[gameId].nbPlayers,
                level:games[gameId].levels[0],
                placed:!((games[gameId].joueurs[joiningPlayer].pos === null || games[gameId].joueurs[joiningPlayer].pos === undefined)),
                inHole:games[gameId].joueurs[joiningPlayer].inHole
            });
            console.log(games[gameId].joueurs[0].pos)
            console.log(games[gameId].joueurs[1].pos)

            console.log(games[gameId].joueurs[joiningPlayer].pos)
            games[gameId].joueurs[joiningPlayer].socket.emit("isPlaying",games[gameId].current);
            if(joiningPlayer === games[gameId].current){
                games[gameId].joueurs[joiningPlayer].socket.emit("yourTurn",games[gameId].current);
            }
            return;
        }

        if(games[gameId] && games[gameId].joueurs.length < games[gameId].nbPlayers){
            games[gameId].joueurs[games[gameId].joueurs.length] = {socket: socket, points: 0, inHole:false, token:obj.token, pos:null, shot:false};
            game = gameId;
            console.log("Joueur connecté à l'indice "+games[game].joueurs.length-1);
            socket.emit("waiting",{
                name: games[game].name,
                nbPlayers: games[game].joueurs.length,
                maxPlayers: games[game].nbPlayers,
                nbManches: games[game].nbManches,
                code: games[game].code
            });
            if(games[game].joueurs.length >= 2){
                games[game].joueurs[0].socket.emit("canForceStart");
            }
            if(games[gameId].joueurs.length == games[gameId].nbPlayers){
                startGame();
            }else{
                updateWaitingRoom();
            }
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie, mot de passe ou id invalide"});
        }

    });

    socket.on("leaveRoom",function(){
        var playerId = getPlayerFromSock(games[game],socket);
        if(game === null  || playerId === undefined || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        if(playerId == 0){
            games[game].joueurs[playerId].socket.emit('unableForceStart');
        }
        games[game].joueurs.splice(playerId,1);
        for(var i=0, l=games[game].joueurs.length ; i<l ; ++i){
            games[game].joueurs[i].socket.emit("playerJoined",{
                name: games[game].name,
                nbPlayers: games[game].joueurs.length,
                maxPlayers: games[game].nbPlayers,
                nbManches: games[game].nbManches,
                code: games[game].code
            });
        }
        if(games[game].joueurs.length >= 2){
            games[game].joueurs[0].socket.emit('canForceStart');
        }
        game = null;
    });

    socket.on("forceStart",function(){
        games[game].nbPlayers = games[game].joueurs.length;
        startGame();
    });

    socket.on("placeBall",function(pos){
        var playerId = getPlayerFromSock(games[game],socket);
        if(game === null  || playerId === undefined || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        if(games[game].current != playerId){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        if(placeBall(games[game],pos)){
            for(var i=0 ; i<games[game].nbPlayers ; ++i){
                games[game].joueurs[i].socket.emit("allPosition",computeBallPos(games[game]));
            } 
        }
    });

    socket.on("shoot",function(impulse){
        var playerId = getPlayerFromSock(games[game],socket);
        if(game === null || playerId === undefined || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        if(games[game].current != playerId){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        shoot(games[game],impulse,playerId);
        var allInHole = true;
        var allStopped = true;
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballShot",{index:games[game].current,impulse:impulse});
            }
        }
        var allInHole = true;
        for(player of  games[game].joueurs){
            if(!player.inHole){
                allInHole = false; 
            }
        }
        if(!allInHole){
            games[game].joueurs[games[game].current].socket.emit("notYourTurn");
            
            do{
                games[game].current = (games[game].current + 1) % games[game].nbPlayers;
            }while(games[game].joueurs[games[game].current].inHole);
            games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
            for(var i=0 ; i<games[game].nbPlayers ; ++i){
                games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
            }
            clearTimeout(games[game].turnTimer);
            setTurnTimer(game);
        }else{
            if(games[game].levels.length > 0){
                for(player of  games[game].joueurs){
                    player.inHole = false;
                    player.pos = null;
                    player.shot = false;
                    player.socket.emit("nextManche",games[game].levels[0]);
                }
                games[game].balls = [];
                createLevel(games[game],games[game].levels[0]);
                games[game].joueurs[games[game].current].socket.emit("notYourTurn");
                games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
                for(var i=0 ; i<games[game].nbPlayers ; ++i){
                    games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
                }
                clearTimeout(games[game].turnTimer);
                setTurnTimer(game);
                games[game].levels.splice(0,1);
            }else{
                for(player of  games[game].joueurs){
                    player.socket.emit("endGame");
                }
                clearTimeout(games[game].turnTimer);
                deleteGame(game);
            }
        }
    });

    /*
    socket.on("inHole",function(id){
        var playerId = getPlayerFromSock(games[game],socket);
        if(game === null || playerId===undefined || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        games[game].joueurs[id].inHole = true;
        var allInHole = true;
        for(player of  games[game].joueurs){
            if(!player.inHole){
                allInHole = false; 
            }
        }
        if(allInHole){
            if(games[game].levels.length > 0){
                for(player of  games[game].joueurs){
                    player.inHole = false;
                    player.socket.emit("nextManche",games[game].levels[0]);
                }
                games[game].joueurs[games[game].current].socket.emit("notYourTurn");
                games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
                for(var i=0 ; i<games[game].nbPlayers ; ++i){
                    games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
                }
                clearTimeout(games[game].turnTimer);
                setTurnTimer(game);
                games[game].levels.splice(0,1);
            }else{
                for(player of  games[game].joueurs){
                    player.socket.emit("endGame");
                }
                clearTimeout(games[game].turnTimer);
                deleteGame(game);
            }
        }
    });*/

    function startGame(){
        games[game].current = Math.floor(Math.random() * games[game].nbPlayers);
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            games[game].joueurs[i].socket.emit("gameStart",{level:games[game].levels[0],players:games[game].joueurs.length});
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("notYourTurn");
            }
            games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
        }
        createLevel(games[game],games[game].levels[0]);
        games[game].levels.splice(0,1);
        games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
        clearTimeout(games[game].turnTimer);
        setTurnTimer(game);
    }

    function updateWaitingRoom(){
        for(var i=0, l=games[game].joueurs.length ; i<l-1 ; ++i){
            if(i != getPlayerFromSock(games[game],socket)){
                games[game].joueurs[i].socket.emit("playerJoined",{
                    name: games[game].name,
                    nbPlayers: games[game].joueurs.length,
                    maxPlayers: games[game].nbPlayers,
                    nbManches: games[game].nbManches,
                    code: games[game].code
                });
            }
        }
    }

    function deleteGame(game) {
        console.log("Suppression de la partie " + game);
        delete games[game];
    }

    function setTurnTimer(game){
        games[game].turnTimer = setTimeout(function(current){
            if(games[game].current === current){
                games[game].joueurs[games[game].current].socket.emit("notYourTurn");
                do{
                    games[game].current = (games[game].current + 1) % games[game].nbPlayers;
                }while(games[game].joueurs[games[game].current].inHole);
                games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
                for(var i=0 ; i<games[game].nbPlayers ; ++i){
                    games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
                }
                clearTimeout(games[game].turnTimer);
                setTurnTimer(game);
            }
        },15000,games[game].current);
    }
});



// TODO : changer les intéractions pour que la simu se fasse coté serveur