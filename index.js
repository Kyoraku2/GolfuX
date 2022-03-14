var e_shapeBit = 0x0001;
var e_jointBit = 0x0002;
var e_aabbBit = 0x0004;
var e_pairBit = 0x0008;
var e_centerOfMassBit = 0x0010;

var PTM = 32;
const NUM_LEVELS = 40;
const NUM_WORLDS = Math.floor(NUM_LEVELS/10);
var max_lvl = parseInt(localStorage.getItem("level"));
const MANCHES_MAX = 18;

var stopMovements = false;
var QRgenerate = false;
var Xgenerate = false;
var nb_x = 0;
const TURN_LIMIT = 12;
var shootSound = new Audio('./sounds/shoot.mp3');
var bonkSound = new Audio('./sounds/bonk.mp3');
var sandSound = new Audio('./sounds/sand.mp3');
var voidSound = new Audio('./sounds/lava.mp3');
var waterSound = new Audio('./sounds/water.mp3');
var holeSound = new Audio('./sounds/hole.mp3');
var windSound = new Audio('./sounds/wind.mp3');
var iceSound = new Audio('./sounds/ice.mp3');
var portalSound = new Audio('./sounds/portal7.mp3');
var bubblegumSound = new Audio('./sounds/bubblegum.mp3');





var world = null;
var canvas;
var context;
var canvasBack;
var contextBack;
var myDebugDraw;        
var myQueryCallback;      
var run = true;      
var mouseDown = false;    
var mousePosPixel = {
    x: 0,
    y: 0
};
var prevMousePosPixel = {
    x: 0,
    y: 0
};        
var mousePosWorld = {
    x: 0,
    y: 0
};        
var canvasOffset = {
    x: 0,
    y: 0
};        
var viewCenterPixel = {
    x:320,
    y:240
};
var golfux;
var playType; // 0 solo, 1 multi local, 2 multi

function myRound(val,places) {
    var c = 1;
    for (var i = 0; i < places; i++)
        c *= 10;
    return Math.round(val*c)/c;
}
        
function getWorldPointFromPixelPoint(pixelPoint) {
    return {                
        x: (pixelPoint.x - canvasOffset.x)/PTM,
        y: (pixelPoint.y - (canvas.height - canvasOffset.y))/PTM
    };
}

function getPixelPointFromWorldPoint(worldPoint) {
    return {                
        x: worldPoint.x*PTM+canvasOffset.x,
        y: canvas.height -(worldPoint.y*PTM+(canvas.height - canvasOffset.y))
    };
}

function setViewCenterWorld(b2vecpos, instantaneous) {
    var cvs=document.getElementById('canvas');
    viewCenterPixel = {
        x:cvs.width/2,
        y:cvs.height/2
    };

    var currentViewCenterWorld = getWorldPointFromPixelPoint( viewCenterPixel );
    var toMoveX = b2vecpos.get_x() - currentViewCenterWorld.x;
    var toMoveY = b2vecpos.get_y() - currentViewCenterWorld.y;
    var fraction = instantaneous ? 1 : 0.25;
    canvasOffset.x -= myRound(fraction * toMoveX * PTM, 0);
    canvasOffset.y += myRound(fraction * toMoveY * PTM, 0);
}


function onMouseDown(canvas, evt) {
    updateMousePos(canvas, evt);
    golfux.onMouseDown(canvas, evt);
    if(!ballPlaced){
        placeBallInSpawn();
    }
}

function collideCircles(obj1,obj2){

}

function clickCollideRect(obj){
    return mousePosWorld.x >= obj.middle_pos.x-obj.hx
            && mousePosWorld.x <= obj.middle_pos.x+obj.hx
            && mousePosWorld.y >= obj.middle_pos.y-obj.hy
            && mousePosWorld.y <= obj.middle_pos.y+obj.hy;
}

function placeBallInSpawn(){
    if(ballIndex === null){
        return;
    }
    if(playType === 1 && localPlacedBalls[ballIndex]){
        return;
    }
    var spawn_area;
    for(var i = 0 ; i < golfux.level.obstacles['spawn'].length ; ++i){
        if(clickCollideRect(golfux.level.obstacles['spawn'][i])){
            spawn_area = golfux.level.obstacles['spawn'][i];
            break;
        }
    }
    if(spawn_area === undefined){
        return;
    }
    golfux.balls[ballIndex] = new Ball(new b2Vec2(mousePosWorld.x,mousePosWorld.y), ballIndex);
    if(playType === 1){
        localPlacedBalls[ballIndex] = true;
    }else{
        ballPlaced = true;
    }
    if(playType === 2){
        sock.emit("placeBall",{x:mousePosWorld.x,y:mousePosWorld.y});
    }
}

function onMouseUp(canvas, evt) {
    mouseDown = false;
    updateMousePos(canvas, evt);
    golfux.onMouseUp(canvas, evt);
}

function onMouseMove(canvas, evt) {
    updateMousePos(canvas, evt);
}

function onTouchDown(canvas, evt) {            
    updateMousePos(canvas, evt);
    golfux.onTouchDown(canvas, evt);
}

function onTouchUp(canvas, evt) {
    mouseDown = false;
    updateMousePos(canvas, evt);
    golfux.onTouchUp(canvas, evt);
}


function updateMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    if(evt.clientX !== undefined){
        mousePosPixel = {
            x: evt.clientX - rect.left,
            y: canvas.height - (evt.clientY - rect.top)
        };
    }else{
        if(evt.clientX === undefined && evt.touches.length !== 0){
            mousePosPixel = {
                x: evt.touches[0].clientX - rect.left,
                y: canvas.height - (evt.touches[0].clientY - rect.top)
            };
        }else{
            mousePosPixel = {
                x: evt.changedTouches[0].clientX - rect.left,
                y: canvas.height - (evt.changedTouches[0].clientY - rect.top)
            };
        }
    }
    mousePosWorld = getWorldPointFromPixelPoint(mousePosPixel);
}

function onTouchMove(evt) {
    golfux.onTouchMove(canvas, evt);
    updateMousePos(canvas, evt);
}


function init() {
    
    canvas = document.getElementById("canvas");
    context = canvas.getContext( '2d' );
    canvasBack = document.getElementById("stage");
    contextBack = canvasBack.getContext( '2d' );
    
    canvasOffset.x = canvas.width/2;
    canvasOffset.y = canvas.height/2;

    canvas.addEventListener("touchstart", function(evt){
        onTouchDown(canvas,evt);
    },false);

    canvas.addEventListener("touchend", function(evt){
        onTouchUp(canvas,evt);
    },false);

    canvas.addEventListener('touchmove', function(evt){
        evt.preventDefault();
        onTouchMove(evt);
    }, false); // mobile
    
    canvas.addEventListener('mousedown', function(evt) {
        onMouseDown(canvas,evt);
    }, false);
    
    canvas.addEventListener('mouseup', function(evt) {
        onMouseUp(canvas,evt);
    }, false);

    canvas.addEventListener('mousemove', function(evt) {
        evt.preventDefault();
        onMouseMove(canvas,evt);
    }, false);

    
    myDebugDraw = getCanvasDebugDraw();            
    myDebugDraw.SetFlags(e_shapeBit);
    
    myQueryCallback = new Box2D.JSQueryCallback();

    myQueryCallback.ReportFixture = function(fixturePtr) {
        var fixture = Box2D.wrapPointer( fixturePtr, b2Fixture );
        if ( fixture.GetBody().GetType() != Box2D.b2_dynamicBody ) //mouse cannot drag static bodies around
            return true;
        if ( ! fixture.TestPoint( this.m_point ) )
            return true;
        this.m_fixture = fixture;
        return false;
    };
}

function changeTest() {    
    resetScene();
    if ( golfux && golfux.setNiceViewCenter ){
        golfux.setNiceViewCenter();
    }
    draw();
}

function createWorld() {
    if ( world != null ) 
        Box2D.destroy(world);
        
    world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0) );
    world.SetDebugDraw(myDebugDraw);
    golfux = new Golfux();
    golfux.setup();

    //Progression
    if (localStorage.getItem("level") == null) {
        golfux.save_progression(1);
    }
    //golfux.save_progression(15); //TODO Supprimer après c'est pour le debug
}

function resetScene() {
    createWorld();
    draw();
}

function step() { // Equivalent d'update
    world.Step(1/60, 3, 2);
    draw();
    golfux.step();
}

function draw() {
    context.clearRect( 0, 0, canvas.width, canvas.height );
    
    context.save();            
    context.translate(canvasOffset.x, canvasOffset.y);
    context.scale(1,-1);                
    context.scale(PTM,PTM);
    context.lineWidth /= PTM;
    
    drawAxes(context);
    
    context.fillStyle = 'rgb(255,255,0)';
    //world.DrawDebugData(); // Affichage des éléments de débugage
    context.restore();
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
})();

function animate() {
    if ( run )
        requestAnimFrame( animate );
    step();
    if(joinedByLink !== undefined && golfux !== undefined){
        setUpSocket();
        var name = prompt("Choisir un nom :");
        while(name == "" || name == null){
            name = prompt("Choisir un nom :");
        }
        sock.emit("joinGameByLink",{id:joinedByLink,name:name});
        joinedByLink = undefined;
    }
}

/****************************************
 *          Gestion serveur
 ***************************************/

let joinedByLink;
let ballPlaced = false;
let sock;
let ballIndex = null;
let currentBall = null;
let onlineNbPlayer;
let localNbPlayers;
let localNbManches;
let localCurrManche = 0;
let localPlacedBalls = [];
let localScores = [];
let localTurns = [];

let impulsionStack = [];
let replacementStack = [];

if('serviceWorker' in navigator){
    navigator.serviceWorker
        .register('./worker.js?v=2',{scope: "/"})
        .then(console.log('Worker v2 here !'));
};

document.addEventListener("DOMContentLoaded", function() {
    /* Join by link */
    var gameId = (window.location.href.split("?").length == 2 && window.location.href.split("?")[1].match("gameId\=.*")) ? window.location.href.split("?")[1].split('=')[1] : "";
    if(gameId){
        joinedByLink = gameId;
        history.replaceState({}, '', '/');
    }

    /********* ECOUTEURS INTERFACES *********************/

    //Création levels dynamiques
    create_levels_btn(NUM_LEVELS);
    //Monde par défaut
    change_world(1);
    //Création choix
    create_choices(MANCHES_MAX);
    //Check partie privée
    display_code("");
    //Message "your turn"
    document.getElementById("your-turn").style.display = "none";
    
    //Mode Solo
    document.getElementById("btn-play-solo").addEventListener('click', function(e){
        playType = 0;
        ballIndex = 0;
        currentBall = 0;
        display_title(false);
        document.getElementById("solo").style.display = "block";
        document.getElementById("x").style.display = "none";
    });

    //Liste niveaux 
    document.getElementById("levels").addEventListener('click', function(e) {
        if (e.target.dataset["index"] != undefined) {
            if (parseInt(e.target.dataset["index"]) <= max_lvl || parseInt(e.target.dataset["index"]) == 1) {
                document.getElementById("solo").style.display = "none";
                //Charger level X
                golfux.changeLevel(e.target.dataset["index"],true);
                document.getElementById("game").style.display = "block";
            } else {
                alert("Vous n'avez pas encore débloqué ce niveau.");
            }
        }
    });

    //Recommencer
    document.getElementById("restart-game").addEventListener('click', function(e){
        golfux.changeLevel(parseInt(golfux.level.num),true);
    });

    //Menu fin continuer
    document.getElementById("btn-continue").addEventListener('click', function(e){
        golfux.changeLevel(parseInt(golfux.level.num) + 1,true);
        if(playType == 1){
            for(var i=0 ; i<localNbPlayers ; ++i){
                localTurns[i] = 0;
            }
            stopMovements = false;
        }
        document.getElementById("end-menu").style.display = "none";
    });

    //Menu fin quitter
    var btns_quit = document.getElementsByClassName("btn-quit");
    for (var i = 0; i < btns_quit.length; i++) {
        btns_quit[i].addEventListener('click', function(e){
            if (e.target.id != "quit-game") {
                golfux.changeLevel(parseInt(golfux.level.num) + 1,true);
            }
            window.location.reload();
        });
    }

    //Leaderboard
    document.getElementById("btn-leaderboard").addEventListener('click', function(e){
        document.getElementById("game-interface").style.display = "none";
        document.getElementById("leaderboard").style.display = "block";
    });

    //Close leaderboard
    document.getElementById("close-leaderboard").addEventListener('click', function(e){
        document.getElementById("game-interface").style.display = "block";
        document.getElementById("leaderboard").style.display = "none";
    });

    //Multi Local
    document.getElementById("btn-multi-local").addEventListener('click', function(e){
        document.getElementById("x").style.display = "none";
        playType = 1;
        ballIndex = 0;
        currentBall = 0;
        display_title(false);
        document.getElementById("multi-local").style.display = "block";
    });

    //Multi Online
    document.getElementById("btn-multi-online").addEventListener('click', function(e){
        document.getElementById("x").style.display = "none";
        setTimeout(async () => {
            const result = await checkOnlineStatus();
            if(result){
                console.log("salut");
                setUpSocket();
            }else{
                alert("Vous n'êtes pas connectés à internet.");
            }
        }, 100);
        //setUpSocket();
    });

    //Raffraichir
    document.getElementById('btn-reload').addEventListener('click',function(e){
        if(playType === 2){
            document.getElementById('game-list').innerHTML="";
            sock.emit("askGameList");
            //Titre parties
            console.log(document.getElementById("game-list").childElementCount);
            setTimeout(wait_reload, 100);
        }
    });

    //Retour
    var btns_retour = document.getElementsByClassName("btn-retour");
    for (var i = 0; i < btns_retour.length; i++) {
        btns_retour[i].addEventListener('click', function(e){
            if(playType === 2){
                sock.disconnect();
            }
            document.getElementById("solo").style.display = "none";
            document.getElementById("multi-local").style.display = "none";
            document.getElementById("multi-online").style.display = "none";
            document.getElementById("creer-partie").style.display = "none";
            display_title();
        });
    }

    //Retour 2 (retour qui ne va pas sur le menu principal)
    var btns_retour_2 = document.getElementsByClassName("btn-retour-2");
    for (var i = 0; i < btns_retour_2.length; i++) {
        btns_retour_2[i].addEventListener('click', function(e){
            display_retour_online();
        });
    }

    //Retour wait room
    document.getElementById("btn-room-quit").addEventListener('click', function(e){
        if (confirm("Voulez-vous quitter cette partie en cours ?")) {
            display_retour_online();
            sock.emit("leaveRoom");
            document.querySelector("time").innerHTML = 0;
            QRgenerate = false;
        }
    });

    //Commencer
    var btns_start = document.getElementsByClassName("btn-start");
    for (var i = 0; i < btns_start.length; i++) {
        btns_start[i].addEventListener('click', function(e){
            if(this.classList.contains("unlock")) {
                if(confirm("Êtes-vous sûr de commencer cette partie avec les paramètres suivants ?")) {
                    if(playType == 2){
                        sock.emit("forceStart");
                    }else{
                        display_game();
                    }
                    if (playType != 0) {
                        document.getElementById("restart-game").style.display = "none";
                    }
                }
            }else{
                alert("Vous ne pouvez pas commencer la partie pour le moment.");
            }
        });
    }

    document.getElementById("btn-start-local").addEventListener('click', function(e){
        localNbPlayers = document.getElementById("localNbPlayers").selectedIndex+2;
        localNbManches = document.getElementById("localNbManches").value;
        for(var i=0 ; i<localNbPlayers ; ++i){
            localPlacedBalls[i] = false;
            localScores[i] = {name:"Player"+(i+1),score:0};
            localTurns[i] = 0;
        }
        updateLeaderNbPlayers(localNbPlayers);
    });

    //Créer partie
    document.getElementById("btn-creer-partie").addEventListener('click', function(e){
        var pseudo = document.getElementById("pseudo").value;
        if (pseudo.trim() != "") {
            document.getElementById("multi-online").style.display = "none";
            document.getElementById("creer-partie").style.display = "block";
        } else {
            alert("Vous ne pouvez pas créer une partie sans surnom. Veuillez renseigner ce dernier s'il vous plaît.");
        }
    });

    //Check private
    document.getElementById("btn-private").addEventListener('click', function(e){
        //display_code("");
    });

    //Bouton mondes
    for (var i = 1; i <= NUM_WORLDS; i++) {
        document.getElementById("btn-world-"+i).addEventListener('click', function(e){
            var num_world = e.target.dataset["world"];
            if (num_world != undefined) {
                change_world(num_world);
            }
        });
    }

    //X ???
    document.getElementById("x").addEventListener('click', function(e){
        nb_x++;
        //if (nb_x % 3 == 0 && nb_x != 0) {
            display_X();
        //}
    });

    function display_X() {
        document.getElementById("x").style.opacity = "1";
        document.getElementById("x").classList.add("sizeX");
        if (Xgenerate == false) {
            setTimeout(x_later0, 1000);
        } else {
            setTimeout(x_later1, 1000);
        }
        setTimeout(x_later2, 1500);
        Xgenerate = ! Xgenerate;
        function x_later0() {
            document.getElementById("x").classList.remove("sizeX");
            document.querySelector("header img").src = "./textures/grux.png";
            document.querySelector("header img").style.height = '22vw';
            document.querySelector("header img").style.width = '50vw';
            document.getElementById("x").style.left = "60%";

            document.getElementById("btn-play-solo").innerHTML = "\uD83C\uDFC6 GRUX SOLO";
            document.getElementById("btn-multi-local").innerHTML = "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 GRUX LOCAL";
            document.getElementById("btn-multi-online").innerHTML = "\uD83C\uDF0D GRUX EN LIGNE";
            document.querySelector("h1").innerHTML = 
                '<span class="animated bounce bounce-1">LE&nbsp;</span>'+
                '<span class="animated bounce bounce-2">JEU&nbsp;</span>'+
                '<span class="animated bounce bounce-3">DE&nbsp;</span>'+
                '<span class="animated bounce bounce-4">GOLF&nbsp;</span>'+
                '<span class="animated bounce bounce-5">À&nbsp;</span>'+
                '<span class="animated bounce bounce-6">JOUER&nbsp;</span>'+
                '<span class="animated bounce bounce-7">EN&nbsp;</span>'+
                '<span class="animated bounce bounce-8">COURS&nbsp;</span>'+
                '<span class="animated bounce bounce-9">MAGISTRAL&nbsp;</span>'+
                '<span class="animated bounce bounce-10">DE&nbsp;</span>'+
                '<span class="animated bounce bounce-11">JUBE&nbsp;</span>'+
                '<span class="animated bounce bounce-12">!</span>';
            document.querySelector("footer p").innerHTML =
                '<p>&copy; GruX Corporation&trade; - 2022<br>Éric GruX<br>CMI GruX - <em>Université de Franche-Comté</em>'+
                '<br><br><span id="version">[ver. G.R.U.X]</span></p>';
        }
        function x_later1() {
            document.getElementById("x").classList.remove("sizeX");
            document.querySelector("header img").src = "./textures/logo.PNG";
            document.querySelector("header img").style.height = '22vw';
            document.querySelector("header img").style.width = '60vw';
            document.getElementById("x").style.left = "68%";

            document.getElementById("btn-play-solo").innerHTML = "\uD83C\uDFC6 MODE SOLO";
            document.getElementById("btn-multi-local").innerHTML = "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 MULTIJOUEUR LOCAL";
            document.getElementById("btn-multi-online").innerHTML = "\uD83C\uDF0D MULTIJOUEUR EN LIGNE";
            document.querySelector("h1").innerHTML = 
                '<span class="animated bounce bounce-1">LE&nbsp;</span>'+
                '<span class="animated bounce bounce-2">JEU&nbsp;</span>'+
                '<span class="animated bounce bounce-3">DE&nbsp;</span>'+
                '<span class="animated bounce bounce-4">GOLF&nbsp;</span>'+
                '<span class="animated bounce bounce-5">PC&nbsp;</span>'+
                '<span class="animated bounce bounce-6">ET&nbsp;</span>'+
                '<span class="animated bounce bounce-7">MOBILE&nbsp;</span>'+
                '<span class="animated bounce bounce-8">À&nbsp;</span>'+
                '<span class="animated bounce bounce-9">JOUER&nbsp;</span>'+
                '<span class="animated bounce bounce-10">ENTRE&nbsp;</span>'+
                '<span class="animated bounce bounce-11">AMIS&nbsp;</span>'+
                '<span class="animated bounce bounce-12">!</span>';
            document.querySelector("footer p").innerHTML =
                '<p>&copy; GolfuX Corporation&trade; - 2022<br>Arthur BETARD, Robin GRAPPE, Tayeb HAKKAR<br>CMI Informatique - <em>Université de Franche-Comté</em>'+
                '<br><br><span id="version">[ver. 1.0.0]</span></p>';
        }
        function x_later2() {
            document.getElementById("x").style.opacity = "0";
        }
    }

    /***************
    Fonctions
    ***************/

    var timeout_id;
    function display_retour_online() {
        document.getElementById("wait-room").style.display = "none";
        document.getElementById("creer-partie").style.display = "none";
        document.getElementById("multi-online").style.display = "block";
        clearTimeout(timeout_id);
    }
});

function display_waiting_room(game) {
    var sec = document.querySelector("time").innerHTML;
    if(!document.getElementById("generateQr").classList.contains("unlock")){
        document.getElementById("generateQr").classList.add("unlock");
    }
    if (isNaN(sec)) {
        sec = 0;
    }
    //document.getElementById("wait-room").children[1].innerHTML= '<h3><span class="emoji">&#127757;</span> '+game.name+' :</h3><br>&#128104;&#8205;&#128105;&#8205;&#128103;&#8205;&#128102; Nombre de joueurs : '+game.nbPlayers+'/'+game.maxPlayers+'<br>&#9971;  Nombre de manches : '+game.nbManches+'<br>&#128290; Code : '+game.code+'<br><br>&#8987; Temps d\'attente : <time>'+sec+'</time> seconde(s)<br>&#128206; Partager la partie : <span id="link">X</span>';
    var game_link = window.location.href+"?gameId="+game.code;
    document.getElementById("wait-room").children[1].innerHTML=
    '<h3><span class="emoji">&#127757;</span> '+game.name+' :</h3>'+
    '<br>&#128104;&#8205;&#128105;&#8205;&#128103;&#8205;&#128102; Nombre de joueurs : '+game.nbPlayers+'/'+game.maxPlayers+'<br>'+
    '&#9971;  Nombre de manches : '+game.nbManches+'<br>'+
    '&#128290; Code : '+game.code+'<br>'+
    '&#128206; Partager la partie : <input id=\'gameId\' type=\'text\' value=\''+game_link+"' placeholder=\'"+game_link+"' title=\'"+game_link+"'></input><button id='copyBtn' class='unlock' title='Copier le lien'>&#128203</button><br>"+
    /*"<button id='generateQr' class='unlock' title='Générer un QR code'>GÉNÉRER QR CODE</button>*/"<div id='qrCode'></div><br><br>"+
    '&#8987; Temps d\'attente : <time>'+sec+'</time> seconde(s)';
    
    document.getElementById("multi-online").style.display = "none";
    document.getElementById("creer-partie").style.display = "none";
    document.getElementById("wait-room").style.display = "block";
    document.getElementById("copyBtn").addEventListener("click",function(e){copyClipboard();});
    document.getElementById("generateQr").addEventListener("click", function(e){
        if (QRgenerate == false) {
            generateQRCode(game_link);
        }
        QRgenerate = true;
        document.getElementById("generateQr").classList.remove("unlock");
    });
    timer(sec);
}

function display_game() {
    document.getElementById("multi-local").style.display = "none";
    document.getElementById("multi-online").style.display = "none";
    document.getElementById("creer-partie").style.display = "none";
    document.getElementById("wait-room").style.display = "none";
    //Charger level aléatoire
    document.getElementById("game").style.display = "block";
}

function timer(sec) {
    var display = document.querySelector("time");
    display.innerHTML = sec;
    timeout_id = setInterval(add_sec => {
        sec++;
        display.innerHTML = sec;
    }, 1000);
}

function display_title(display=true) {
    if (display == false) {
        document.getElementById("menu").style.display = "none";
        document.querySelector("header").style.display = "none";
        document.querySelector("footer").style.display = "none";
    } else {
        document.getElementById("menu").style.display = "block";
        document.querySelector("header").style.display = "block";
        document.querySelector("footer").style.display = "block";
        document.getElementById("x").style.display = "block";
        change_world(1);
    }
}

function create_levels_btn(lvl_number) {
    for (var i = 0; i < lvl_number; i++) {
        var world_lvl = Math.floor(i/10) + 1;
        var num_lvl = i%10 + 1;
        var levels = document.getElementById("world-"+world_lvl);
        var button = document.createElement("button");
        button.dataset["index"] = i+1;
        var content;
        var stars = document.createElement("span");
        stars.classList.add("stars");
        if (i+1 <= max_lvl || i+1 == 1) {
            content = world_lvl +"-"+ num_lvl;
            button.classList.add("unlock");
            button.title = "Niveau "+content;
            //stars.appendChild(document.createTextNode("\n\u2B50\u2B50\u2B50"));
        } else {
            content = "\uD83D\uDD12";
            button.title = "Verrouillé";
        }
        var txt = document.createTextNode(content);
        button.appendChild(txt);
        button.appendChild(stars);
        levels.appendChild(button);
    }
}

/*function save_progression(last_lvl) {
    var progress = localStorage.getItem("level");
    progress = (!progress) ? {} : JSON.parse(progress);
    progress = last_lvl;
    localStorage.setItem("level", JSON.stringify(progress));
}*/

function change_world(num_world) {
    document.querySelector("body").classList = [];
    document.querySelector("body").classList.add("background-w"+num_world);
    for (var i = 1; i <= NUM_WORLDS; i++) {
        document.getElementById("world-"+i).style.display = "none";
        document.getElementById("btn-world-"+i).classList.add("unlock");
    }
    document.getElementById("world-"+num_world).style.display = "block";
    document.getElementById("btn-world-"+num_world).classList.remove("unlock");
}

function create_choices(nb_choices) {
    var selects = document.getElementsByClassName("manches");
    for (var i = 0; i < selects.length; i++) {
        for (var j = 0; j < nb_choices; j++) {
            var option = document.createElement("option");
            var txt = document.createTextNode(j+1);
            option.appendChild(txt);
            selects[i].appendChild(option);
        }
    }
}

function display_code(code) {
    if (document.getElementById("check-private").checked) {
        document.getElementById("code-display").innerHTML = "<br>Code : "+code;
    } else {
        document.getElementById("code-display").innerHTML = "";
    }
}

function correct_code(code) {
    if (code.length != 4) {
        return false;
    }
    code = code.toUpperCase();
    var regex = new RegExp(/^(?:[0-9]|[A-Z]){4}$/, "g");
    if (code.match(regex) == null) {
        return false;
    }
    return true;
}

function create_game_list(list){
    for(var i=0, l=list.length ; i < l ; ++i){
        var btn = document.createElement("button");
        btn.className = "btn-wait unlock";
        btn.dataset.id = list[i].id
        btn.title = "Rejoindre la partie publique";
        btn.innerHTML = '<strong>"'+list[i].name+'" :</strong> ('+list[i].nbPlayers+'/'+list[i].maxPlayers+')<br>Manches :'+list[i].nbManches+'</button>'
        document.getElementById("game-list").appendChild(btn);
    }
}

function updateLeaderNbPlayers(nbPlayers){
    if(nbPlayers < 0 || nbPlayers > 4){
        return false;
    }
    var leaderBoard = document.getElementById("leaderboard");
    for(var i = 0, l = leaderBoard.children[1].children.length ; i < l ; ++i){
        leaderBoard.children[1].children[i].classList.remove("hidden");
    }
    for(var i = nbPlayers, l = leaderBoard.children[1].children.length ; i < l ; ++i){
        leaderBoard.children[1].children[i].classList.add("hidden");
    }
    return true;
}

function copyClipboard(){
    /* Get the text field */
    var copyText = document.getElementById("gameId");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);
}  

function generateQRCode(link){
    var qrcode = new QRCode("qrCode", {
        text: link,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

function wait_reload() {
    document.getElementById("nb-game").innerHTML = document.getElementById("game-list").childElementCount;
}

function setUpSocket(){
    sock = io.connect();
    /*console.log(sock)
    if(!sock.status){
        alert("Vous n'êtes pas connectés à internet.")
        return;
    }*/
    display_title(false);
    document.getElementById("multi-online").style.display = "block";
    document.querySelector("body").classList.add("background-online");
    //Titre parties
    setTimeout(wait_reload, 100);
    playType = 2;
    /***************** Partie serveur  *******************/
    let partie = { 
        name:null,
        nbPlayers: null,
        nbManches: null,
        code: null,
        isPrivate: null
    };

    var btnCreateGame = document.getElementById("createGame");
    var joinPrivateGame = document.getElementById("btn-join-code");
    var gameList = document.getElementById("game-list");

    btnCreateGame.addEventListener("click",function(e){
        var gameName = document.getElementById("nom-partie").value;
        if(gameName.trim() === ""){
            alert('Merci de renseigner un nom de partie non vide.');
            return;
        }
        var name = document.getElementById("pseudo").value;
        var isPrivate = document.getElementById("check-private").checked;
        var nbPlayers = document.getElementById("onlineNbPlayer").selectedIndex+2;
        var nbManches = document.getElementById("onlineNbManches").value;
        partie.name = gameName;
        partie.nbPlayers = nbPlayers;
        partie.nbManches = nbManches;
        partie.isPrivate = isPrivate;
        sock.emit("CreateGame", {partie:partie,name:name});
    });

    gameList.addEventListener("click",function(e){
        if(e.target.dataset.id){
            var name = document.getElementById("pseudo").value;
            if (name.trim() != "") {
                sock.emit("JoinPublicGame",{id:e.target.dataset.id,name:name});
            } else {
                alert("Vous ne pouvez pas rejoindre une partie sans surnom. Veuillez renseigner ce dernier s'il vous plaît.");
            }
        }
    });

    joinPrivateGame.addEventListener("click",function(e){
        var name = document.getElementById("pseudo").value;
        if (name.trim() != "") {
            sock.emit("JoinPrivateGame",{code:document.getElementById("code").value,name:name});
        } else {
            alert("Vous ne pouvez pas rejoindre une partie sans surnom. Veuillez renseigner ce dernier s'il vous plaît.");
        }
    });

    sock.on("error",function(msg){
        alert(msg.message);
    });

    sock.on("gameList",function(list){
        create_game_list(list);
    });

    sock.on("waiting",function(game){
        display_waiting_room(game);
    });

    sock.on("playerJoined",function(game){
        alert("update"); // TODO ça casse le QR code
        display_waiting_room(game);
    });

    sock.on("canForceStart",function(){
        document.getElementById("forceStartOnline").classList.add("unlock");
    });
    
    sock.on("unableForceStart",function(){
        document.getElementById("forceStartOnline").classList.remove("unlock");
    });

    sock.on("gameStart",function(obj){
        golfux.changeLevel(obj.level,false);
        onlineNbPlayer = obj.players;
        updateLeaderNbPlayers(onlineNbPlayer);
        display_game();
        document.getElementById("restart-game").style.display = "none";
    });

    sock.on("endGame",function(obj){
        stopMovements = true;
        document.getElementById("end-menu").style.display = "block";
        if (msg_display == false) {
            var rigolo_msg = [
                "Bien joué <em>Little Player</em> ! Un jour tu deviendras plus grand... &#128170;",
                "Peut mieux faire... Non non je ne juge pas. &#128064;",
                "Mouais après le niveau était simple nan ? &#129300;",
                "Le <em>TrophuX</em> est à portée de main ! &#129351;",
                "Sans doûte un niveau de petit joueur ! &#128526;",
                "Trop lent à finir ce niveau : pire que Jube et ses copies... &#128195;",
                "C'est une première étape, mais il reste encore beaucoup de chemin à faire... &#128579;",
                "Brillant ! Autant de talent, beauté et intelligence que ceux qui ont conçu le jeu. &#129321;",
                "Quelle magnifique performance ! Seul un jeu en JavaScript peut nous apporter ça. &#129394;",
                "+ 1000000 social crédits. &#128200;"
            ];
            var rand = Math.floor(Math.random() * rigolo_msg.length);
            document.querySelector("#end-menu p").innerHTML = rigolo_msg[rand];
            //TODO : afficher leaderBoard
            document.getElementById("btn-continue").style.display = "none";
            msg_display = true;
            document.getElementById("leaderboard").style.display = "block";
        }
    });

    sock.on("yourTurn",function(index){
        ballIndex = index;
        displayYouTurn();
    });

    sock.on("notYourTurn",function(){
        ballIndex = null;
        golfux.click_down=null;
        golfux.click_up=null;
    });

    sock.on("isPlaying",function(id){
        currentBall = id;
    });

    sock.on("ballShot",function(obj){
        impulsionStack.push(obj);
    });

    sock.on("ballPlaced",function(obj){
        golfux.balls[obj.index] = new Ball(new b2Vec2(obj.pos.x, obj.pos.y), obj.index);
    });

    sock.on("ballShotFinalPos",function(positions){
        replacementStack.push(positions);
    });

    sock.on("nextManche",function(level){
        ballPlaced = false;
        ballIndex = null;
        currentBall = null;
        impulsionStack = [];
        replacementStack = [];
        setTimeout(function(game,level){
            game.changeLevel(level,false);
        },1000,golfux,level);
    });

    sock.on("results",function(scores){
        updateLeaderScores(scores);
        // TODO : update l'affichage, coté serveur manque les noms et un soucis avec le calcul izou
    });
}

function updateLeaderScores(scores){
    var leaderBoard = document.getElementById("leaderboard");
    var sorted = [];
    for(var i = 0, l = Object.keys(scores).length ; i < l ; ++i){
        sorted.push(scores[i]);
    }
    sorted.sort((a, b) => a.score - b.score);
    for(var i = 0, l = sorted.length ; i < l ; ++i){
        switch(i){
            case 0:
                leaderBoard.children[1].children[i].innerHTML = "&#129351; "+sorted[i].name+" : "+sorted[i].score+"&nbsp;pts";
                break;
            case 1:
                leaderBoard.children[1].children[i].innerHTML = "&#129352; "+sorted[i].name+" : "+sorted[i].score+"&nbsp;pts";
                break;
            case 2:
                leaderBoard.children[1].children[i].innerHTML = "&#129353; "+sorted[i].name+" : "+sorted[i].score+"&nbsp;pts";
                break;
            case 3:
                leaderBoard.children[1].children[i].innerHTML = "&#127851; "+sorted[i].name+" : "+sorted[i].score+"&nbsp;pts";
                break;
        }
    }
}

const checkOnlineStatus = async () => {
    try {
      const online = await fetch("/textures/1pixel.png",{cache: "no-store"});
      return online.status >= 200 && online.status < 300; // either true or false
    } catch (err) {
      return false; // definitely offline
    }
};

function displayYouTurn() {
    document.getElementById("your-turn").style.display = "block";
    setTimeout(displayTurn, 500);
    setTimeout(stopDisplay1, 3000);
    setTimeout(stopDisplay2, 4000);
    function displayTurn() {
        document.getElementById("your-turn").classList.add("display-turn");
    }
    function stopDisplay1() {
        document.getElementById("your-turn").classList.remove("display-turn");
    }
    function stopDisplay2() {
        document.getElementById("your-turn").style.display = "none";
    }
}