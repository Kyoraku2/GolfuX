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
        index = 0;
        counter++;
        game = counter;
        games[game] = partie;
        games[game].joueurs = [];
        games[game].joueurs[index] = {socket: socket, points: 0, tour: -1};
        console.log("Partie créée à l'indice "+game);
        console.log("Joueur connecté à l'indice "+index);
        //TODO Afficher l'id de la partie au createur de la partie afin qu'il puisse la partager aux autres 
    });

    socket.on("JoinPublicGame", function(id){
        if(games[id] && games[id].joueurs.length < games[id].nbJoueurs){
            index = games[id].joueurs.length;
            games[id].joueurs[index] = {socket: socket, points: 0, tour: -1};
            game = id;
            console.log("Joueur connecté à l'indice "+index);
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie"});
        }
    });

    socket.on("JoinPrivateGame", function(info){
        if(games[info.id] && games[info.id].code === info.code && games[info.id].joueurs.length < games[info.id].nbJoueurs){
            index = games[info.id].joueurs.length;
            games[id].joueurs[index] = {socket: socket, points: 0, tour: -1};
            game = info.id;
            console.log("Joueur connecté à l'indice "+index);
        }else{
            socket.emit("error", {message: "Erreur, impossible de rejoindre la partie, mot de passe ou id invalide"});
        }
    })




});
