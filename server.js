// Chargement des modules 
var express = require('express');
var app = express();

// cf. https://www.npmjs.com/package/socket.io#in-conjunction-with-express
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(8080/*process.env.PORT || 3000*/, function() {
    console.log("C'est parti ! En attente de connexion sur le port 8080...");
});

// Configuration d'express pour utiliser le répertoire "public"
app.use(express.static('./'));
// set up to 
app.get('/', function(req, res) {  
    res.sendFile(__dirname + '/index.html');
});


app.get('/level*', function(req, res) {
    //console.log("Reçu : GET "+req.url);
    res.setHeader('Content-type', 'application/json');
    //couleur = JSON.stringify(couleur);
    //res.json({ TODO: "à compléter "});

    var level = readLevel(req.url.split('/')[1]);
    res.json(level);
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




let games = {};
let counter = 0;

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
    console.log(code)
    for(const [key, value] of Object.entries(games)) {
        if(value.code.toLowerCase() === code.toLowerCase()){
            return key;
        }
    }
    return -1;
}

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
        index = 0;
        counter++;
        game = counter;
        var code = createPassword();
        while(findGameByCode(code) !== -1){
            code = createPassword();
        }
        games[game] = partie;
        games[game].code = code;
        games[game]["current"] = -1;
        games[game].joueurs = [];
        games[game].joueurs[index] = {socket: socket, points: 0, tour: -1};
        console.log("Partie créée à l'indice "+game);
        console.log("Joueur connecté à l'indice "+index);
        socket.emit("waiting",{
            name: games[game].name,
            nbPlayers: games[game].joueurs.length,
            maxPlayers: games[game].nbPlayers,
            nbManches: games[game].nbManches,
            code: games[game].code
        });
        //TODO Afficher l'id de la partie au createur de la partie afin qu'il puisse la partager aux autres 
    });

    socket.on("JoinPublicGame", function(id){
        if(game !== null || index >= 0){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(id < 0 || games[id].isPrivate){
            socket.emit("error", {message: "Erreur, la partie sélectionnée est privée."});
            return;
        }
        if(games[id] && games[id].joueurs.length < games[id].nbPlayers){
            index = games[id].joueurs.length;
            games[id].joueurs[index] = {socket: socket, points: 0, tour: -1};
            game = id;
            console.log("Joueur connecté à l'indice "+index);
            socket.emit("waiting",{
                name: games[game].name,
                nbPlayers: games[game].joueurs.length,
                maxPlayers: games[game].nbPlayers,
                nbManches: games[game].nbManches,
                code: games[game].code
            });
            if(games[id].joueurs.length == games[id].nbPlayers){
                games[game].current = Math.floor(Math.random() * games[game].nbPlayers);
                for(var i=0 ; i<games[game].nbPlayers ; ++i){
                    games[game].joueurs[i].socket.emit("gameStart");
                    if(i != games[game].current){
                        games[game].joueurs[i].socket.emit("notYourTurn");
                    }
                    games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
                }
                games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
            }else{
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
        console.log(code);
        console.log(gameId);
        if(gameId < 0 || !games[gameId].isPrivate){
            socket.emit("error", {message: "Erreur, la partie n'existe pas ou n'est pas privée."});
            return;
        }
        if(games[gameId] && games[gameId].joueurs.length < games[gameId].nbPlayers){
            index = games[gameId].joueurs.length;
            games[gameId].joueurs[index] = {socket: socket, points: 0, tour: -1};
            game = gameId;
            console.log("Joueur connecté à l'indice "+index);
            socket.emit("waiting",{
                name: games[game].name,
                nbPlayers: games[game].joueurs.length,
                maxPlayers: games[game].nbPlayers,
                nbManches: games[game].nbManches,
                code: games[game].code
            });
            if(games[gameId].joueurs.length == games[gameId].nbPlayers){
                games[game].current = Math.floor(Math.random() * games[game].nbPlayers);
                for(var i=0 ; i<games[game].nbPlayers ; ++i){
                    games[game].joueurs[i].socket.emit("gameStart");
                    if(i != games[game].current){
                        games[game].joueurs[i].socket.emit("notYourTurn");
                    }
                    games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
                }
                games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
            }else{
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
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie, mot de passe ou id invalide"});
        }

    });

    socket.on("placeBall",function(pos){
        if(game !== null || index >= 0){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
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
        if(game !== null || index >= 0){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
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
        if(game !== null || index >= 0){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
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

        console.log(games[game].current);
        games[game].joueurs[games[game].current].socket.emit("notYourTurn");
        games[game].current = (games[game].current + 1) % games[game].nbPlayers;
        games[game].joueurs[games[game].current].socket.emit("yourTurn",games[game].current);
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            games[game].joueurs[i].socket.emit("isPlaying",games[game].current);
        }
    });
});
