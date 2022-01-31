var e_shapeBit = 0x0001;
var e_jointBit = 0x0002;
var e_aabbBit = 0x0004;
var e_pairBit = 0x0008;
var e_centerOfMassBit = 0x0010;

var PTM = 32;
const NUM_LEVELS = 18;
var max_lvl = localStorage.getItem("level");
const MANCHES_MAX = 18;

var world = null;
var canvas;
var context;
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
    ballPlaced = true;
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
    context.fillStyle = 'rgb(0,153,0)';
    context.fillRect( 0, 0, canvas.width, canvas.height );
    
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
}

/****************************************
 *          Gestion serveur
 ***************************************/


let ballPlaced = false;
let sock;
let ballIndex = null;
let currentBall = null;
// TODO faire un truc pour que ça affiche la flèche quand c'est un autre joueur qui joue
document.addEventListener("DOMContentLoaded", function() {
    /********* ECOUTEURS INTERFACES *********************/

    //Création levels dynamiques
    create_levels_btn(NUM_LEVELS);
    //Progression
    if (localStorage.getItem("level") == null) {
        save_progression(1);
    }
    //Création choix
    create_choices(MANCHES_MAX);
    //Check partie privée
    display_code("");
    
    //Mode Solo
    document.getElementById("btn-play-solo").addEventListener('click', function(e){
        playType = 0;
        ballIndex = 0;
        display_title(false);
        document.getElementById("solo").style.display = "block";
    });

    //Liste niveaux 
    document.getElementById("levels").addEventListener('click', function(e) {
        if (e.target.dataset["index"] != undefined) {
            if (e.target.dataset["index"] <= max_lvl) {
                document.getElementById("solo").style.display = "none";
                //Charger level X
                document.getElementById("game").style.display = "block";
            } else {
                alert("Vous n'avez pas encore débloqué ce niveau.");
            }
        }
    });

    //Multi Local
    document.getElementById("btn-multi-local").addEventListener('click', function(e){
        playType = 1
        display_title(false);
        document.getElementById("multi-local").style.display = "block";
    });

    //Multi Online
    document.getElementById("btn-multi-online").addEventListener('click', function(e){
        display_title(false);
        document.getElementById("multi-online").style.display = "block";
        playType = 2;
        /***************** Partie serveur  *******************/
        sock = io.connect();

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
            var isPrivate = document.getElementById("check-private").checked;
            var nbPlayers = document.getElementById("onlineNbPlayer").selectedIndex+2;
            var nbManches = document.getElementById("onlineNbManches").value;
            partie.name = gameName;
            partie.nbPlayers = nbPlayers;
            partie.nbManches = nbManches;
            partie.isPrivate = isPrivate;
            partie.code = createPassword();
            sock.emit("CreateGame", partie);
        });

        gameList.addEventListener("click",function(e){
            if(e.target.dataset.id){
                console.log(e.target);
                sock.emit("JoinPublicGame",e.target.dataset.id);
            }
        });

        joinPrivateGame.addEventListener("click",function(e){
            sock.emit("JoinPrivateGame",document.getElementById("code").value);
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
            console.log("coucou");
            display_waiting_room(game);
        });

        sock.on("gameStart",function(){
            display_game();
        });

        sock.on("endGame",function(obj){

        })

        sock.on("yourTurn",function(index){
            ballIndex = index;
            alert("Your turn");
        });

        sock.on("notYourTurn",function(){
            ballIndex = null;
        });

        //sock.on("isPlaying",function(id){
        //    currentBall = id;
        //});

        sock.on("ballShot",function(obj){
            golfux.balls[obj.index].lastPos = {
                x:golfux.balls[obj.index].body.GetPosition().x,
                y:golfux.balls[obj.index].body.GetPosition().y
            }
            golfux.balls[obj.index].body.ApplyLinearImpulse(new b2Vec2(obj.impulse.x, obj.impulse.y),true);
        });

        sock.on("ballPlaced",function(obj){
            golfux.balls[obj.index] = new Ball(new b2Vec2(obj.pos.x, obj.pos.y), obj.index);
        });

        sock.on("ballShotFinalPos",function(obj){
            // pas forcément nécessaire
            var localPos = golfux.balls[obj.index].body.GetPosition();
            if(localPos.x != obj.pos.x || localPos.y != obj.pos.y){
                golfux.balls[obj.index].body.SetTransform(new b2Vec2(obj.pos.x, obj.pos.y), 0);
            }
        });
    });

    //Retour
    var btns_retour = document.getElementsByClassName("btn-retour");
    for (var i = 0; i < btns_retour.length; i++) {
        btns_retour[i].addEventListener('click', function(e){
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
        }
    });

    //Commencer
    var btns_start = document.getElementsByClassName("btn-start");
    for (var i = 0; i < btns_start.length; i++) {
        btns_start[i].addEventListener('click', function(e){
            if (btns_start[i].classList.contains("unlock")) {
                if (confirm("Êtes-vous sûr de commencer cette partie avec les paramètres suivants ?")) {
                    display_game();
                }
            } else {
                alert("Vous ne pouvez pas commencer la partie pour le moment.");
            }
        });
    }

    document.getElementById("btn-start-local").addEventListener('click', function(e){
        if (confirm("Êtes-vous sûr de commencer cette partie avec les paramètres suivants ?")) {
            display_game();
        }
    });

    //Créer partie
    document.getElementById("btn-creer-partie").addEventListener('click', function(e){
        document.getElementById("multi-online").style.display = "none";
        document.getElementById("creer-partie").style.display = "block";
    });

    //Check private
    document.getElementById("btn-private").addEventListener('click', function(e){
        display_code("");
    });

    //Rejoindre partie par code
    /*document.getElementById("btn-join-code").addEventListener('click', function(e){ // TODO : modifier ici
        var content = document.getElementById("code").value;
        if (correct_code(content) == false) {
            alert("La saisie du code est incorrecte. Veuillez recommencer.");
        } else {
            if (confirm("Voulez-vous rejoindre la partie suivante ?")) {
                display_waiting_room();
            }
        }
    });*/

    //Rejoindre waiting room
    /*var btns_wait = document.getElementsByClassName("btn-wait");
    for (var i = 0; i < btns_wait.length; i++) {
        btns_wait[i].addEventListener('click', function(e){
            if (confirm("Êtes-vous sûr de commencer cette partie avec les paramètres suivants ?")) {
                display_waiting_room();
            }
        });
    }*/

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

    function display_waiting_room(game) {
        // TODO : voir si y'a pas plus propre mdr
        document.getElementById("wait-room").children[1].innerHTML= '<div class="block"><h3><span class="emoji">&#127757;</span> '+game.name+' :</h3><br>&#128104;&#8205;&#128105;&#8205;&#128103;&#8205;&#128102; Nombre de joueurs : '+game.nbPlayers+'/'+game.maxPlayers+'<br>&#9971;  Nombre de manches : '+game.nbManches+'<br>&#128290; Code : <br><br>&#8987; Temps d\'attente : <time>0</time> seconde(s)</div>';
        document.getElementById("multi-online").style.display = "none";
        document.getElementById("creer-partie").style.display = "none";
        document.getElementById("wait-room").style.display = "block";
        timer();
    }

    function display_game() {
        document.getElementById("multi-local").style.display = "none";
        document.getElementById("multi-online").style.display = "none";
        document.getElementById("creer-partie").style.display = "none";
        document.getElementById("wait-room").style.display = "none";
        //Charger level aléatoire
        document.getElementById("game").style.display = "block";
    }

    function timer() {
        var display = document.querySelector("time");
        var sec = 0;
        display.innerHTML = sec;
        timeout_id = setInterval(add_sec => {
            sec++;
            display.innerHTML = sec;
            //console.log(sec);
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
        }
    }

    function create_levels_btn(lvl_number) {
        var levels = document.getElementById("levels");
        for (var i = 0; i < lvl_number; i++) {
            var button = document.createElement("button");
            button.dataset["index"] = i+1;
            var content;
            if (i+1 <= max_lvl) {
                content = i+1;
                button.classList.add("unlock");
                button.title = "Niveau "+content;
            } else {
                content = "\uD83D\uDD12";
                button.title = "Verrouillé";
            }
            var txt = document.createTextNode(content);
            button.appendChild(txt);
            levels.appendChild(button);
        }
    }

    function save_progression(last_lvl) {
        var progress = localStorage.getItem("level");
        progress = (!progress) ? {} : JSON.parse(progress);
        progress = last_lvl;
        localStorage.setItem("level", JSON.stringify(progress));
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
});

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

