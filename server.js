// Chargement des modules 
var express = require('express');
var app = express();

// cf. https://www.npmjs.com/package/socket.io#in-conjunction-with-express
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(8080, function() {
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

io.on('connection', function (socket) {
    console.log("Un client s'est connecté");
    let index = -1;
    let game = null;

    socket.on("CreateGame", function(partie){
        if(!(game === null || index < 0)){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        index = 0;
        counter++;
        game = counter;
        games[game] = partie;
        games[game]["current"] = -1;
        games[game].joueurs = [];
        games[game].joueurs[index] = {socket: socket, points: 0, tour: -1}; // Je pose ça la, mais comme j'ai compris le truc, tour ça dit si c'est son tour ou nan. Mais du coup c'est plus simple de faire avec un attribut "current" dans la partie qui désigne l'index du joueur nan?
        console.log("Partie créée à l'indice "+game);
        console.log("Joueur connecté à l'indice "+index);
        //TODO Afficher l'id de la partie au createur de la partie afin qu'il puisse la partager aux autres 
    });

    socket.on("JoinPublicGame", function(id){
        if(!(game === null || index < 0)){ // Tayeb : j'ai juste ajouté ces vérifs là dans le doute
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(games[id] && games[id].joueurs.length < games[id].nbJoueurs){
            index = games[id].joueurs.length;
            games[id].joueurs[index] = {socket: socket, points: 0, tour: -1};
            game = id;
            console.log("Joueur connecté à l'indice "+index);
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie"});
        }
        // TODO lancer quand c'est plein
    });

    socket.on("JoinPrivateGame", function(info){
        if(!(game === null || index < 0)){
            socket.emit("error", {message: "Erreur, une partie est déjà en cours."});
            return;
        }
        if(games[info.id] && games[info.id].code === info.code && games[info.id].joueurs.length < games[info.id].nbJoueurs){
            index = games[info.id].joueurs.length;
            games[id].joueurs[index] = {socket: socket, points: 0, tour: -1};
            game = info.id;
            console.log("Joueur connecté à l'indice "+index);
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie, mot de passe ou id invalide"});
        }
        // TODO lancer quand c'est plein
    });

    socket.on("ballPlaced",function(pos){
        if(game === null || index < 0){
            socket.emit("error", {message: "Erreur, pas de partie en cours."});
            return;
        }
        if(games[game.current != index]){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballShot",{index:games[game].current,pos:pos});
            }
        }
    });

    socket.on("shoot",function(impulse){
        if(game === null || index < 0){
            socket.emit("error", {message: "Erreur, pas de partie en cours."});
            return;
        }
        if(games[game.current != index]){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballShot",{index:games[game].current,impulse:impulse});
            }
        }
        games[game].current = (games[game].current + 1) % games[game].nbPlayers;
    });

    socket.on("endPos",function(pos){
        // Pas vraiment nécessaire avant le trou
        if(game === null || index < 0){
            socket.emit("error", {message: "Erreur, pas de partie en cours."});
            return;
        }
        if(games[game.current != index]){
            socket.emit("error", {message: "Erreur, ce n'est pas ton tour."});
            return;
        }
        for(var i=0 ; i<games[game].nbPlayers ; ++i){
            if(i != games[game].current){
                games[game].joueurs[i].socket.emit("ballShotFinalPos",{index:games[game].current,pos:pos});
            }
        }
        // Faudra qu'on récupère peut-être la position du trou ici pour pouvoir vérifier quand il met la balle

    });
    




});
