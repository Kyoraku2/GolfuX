// Chargement des modules 
var express = require('express');
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


/*app.get('/level*', function(req, res) {
    //console.log("Reçu : GET "+req.url);
    res.setHeader('Content-type', 'application/json');
    //couleur = JSON.stringify(couleur);
    //res.json({ TODO: "à compléter "});

    var level = readLevel(req.url.split('/')[1]);
    res.json(level);
});*/

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
    console.log(games)
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

/*function collideCircles(obj1, obj2){
    var dx = obj1.x - obj1.x;
    var dy = obj1.y - obj1.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    return distance < obj1.radius + obj2.radius;
}*/


io.on('connection', function (socket) {
    console.log("Un client s'est connecté");
    let index = -1;
    let game = null;


    socket.emit("gameList",generateGameList());

    socket.on("CreateGame", function(partie){
        if(game !== null || index >= 0){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(partie.nbPlayers < 2 || partie.nbPlayers > 4 || partie.nbManches < 1 || partie.nbManches > 18 || games[game]){
            socket.emit("error", {message: "Erreur, mauvaises options de partie."});
            return;
        }
        index = 0;
        counter++;
        game = counter;
        var code = createPassword();
        while(findGameByCode(code) !== -1){
            code = createPassword();
        }
        games[game] = partie;
        games[game].code = code;
        games[game].levels = getRandomLevels(games[game].nbManches);
        games[game]["current"] = -1;
        games[game].joueurs = [];
        games[game].turnTimer = null;
        games[game].joueurs[index] = {socket: socket, points: 0, inHole:false};
        console.log("Partie créée à l'indice "+game);
        console.log("Joueur connecté à l'indice "+index);
        socket.emit("waiting",{
            name: games[game].name,
            nbPlayers: games[game].joueurs.length,
            maxPlayers: games[game].nbPlayers,
            nbManches: games[game].nbManches,
            code: games[game].code,
            id: game
        });
    });

    // TODO : retirer l'attribue index et travailler directement avec la position dans le tableau joueurs (ça simplifiera tout ce qui est gestion de "quitter la waiting room")

    socket.on("JoinPublicGame", function(id){
        if(game !== null || index >= 0 || !games[id]){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(id < 0 || games[id].isPrivate){
            socket.emit("error", {message: "Erreur, la partie sélectionnée est privée."});
            return;
        }
        if(games[id] && games[id].joueurs.length < games[id].nbPlayers){
            index = games[id].joueurs.length;
            games[id].joueurs[index] = {socket: socket, points: 0, inHole:false};
            game = id;
            console.log("Joueur connecté à l'indice "+index);
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
            if(games[id].joueurs.length == games[id].nbPlayers){
                startGame();
            }else{
                updateWaitingRoom();
            }
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie"});
        }
    });

    socket.on("JoinPrivateGame", function(code){
        if(game !== null || index >= 0){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }

        var gameId = findGameByCode(code);
        if(gameId < 0 || !games[gameId].isPrivate){
            socket.emit("error", {message: "Erreur, la partie n'existe pas ou n'est pas privée."});
            return;
        }
        if(games[gameId] && games[gameId].joueurs.length < games[gameId].nbPlayers){
            index = games[gameId].joueurs.length;
            games[gameId].joueurs[index] = {socket: socket, points: 0, inHole:false};
            game = gameId;
            console.log("Joueur connecté à l'indice "+index);
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

    /*socket.on("leaveWaitingRoom",function(){
        if(game === null || index < 0 || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }

        if(){

        }
    });*/

    socket.on("forceStart",function(){
        games[game].nbPlayers = games[game].joueurs.length;
        startGame();
    });

    socket.on("placeBall",function(pos){
        if(game === null || index < 0 || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        if(games[game].current != index){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballPlaced",{index:games[game].current,pos:pos});
            }
        }
    });

    socket.on("shoot",function(impulse){
        if(game === null || index < 0 || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        if(games[game].current != index){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballShot",{index:games[game].current,impulse:impulse});
            }
        }
    });

    socket.on("endPos",function(allPos){
        if(game === null || index < 0 || !games[game]){
            socket.emit("error", {message: "Erreur, vous n'êtes pas dans la partie"});
            return;
        }
        if(games[game].current != index){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballShotFinalPos",allPos);
            }
        }

        var allInHole = true;
        for(player of  games[game].joueurs){
            if(!player.inHole){
                allInHole = false; 
            }
        }
        if(!allInHole){
            console.log(games[game].current);
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
    });

    socket.on("inHole",function(id){
        if(game === null || index < 0 || !games[game]){
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
                deleteGame(game);
            }
        }
    });

    /****************
    *   Functions   *
    *****************/

    function startGame(){
        games[game].current = Math.floor(Math.random() * games[game].nbPlayers);
        console.log(games[game].levels)
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            games[game].joueurs[i].socket.emit("gameStart",games[game].levels[0]);
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("notYourTurn");
            }
            games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
        }
        games[game].levels.splice(0,1);
        games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
        clearTimeout(games[game].turnTimer);
        setTurnTimer(game);
    }

    function updateWaitingRoom(){
        for(var i=0, l=games[game].joueurs.length ; i<l-1 ; ++i){
            if(i != index){
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
        console.log("salut")
        games[game].turnTimer = setTimeout(function(current,sock){
            console.log(current)
            console.log(games[game].current)
            if(games[game].current === current){
                sock.emit("notYourTurn");
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
        },15000,games[game].current,games[game].joueurs[index].socket);
    }
});

// TODO : faire quand on place la balle