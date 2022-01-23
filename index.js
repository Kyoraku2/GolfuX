var e_shapeBit = 0x0001;
var e_jointBit = 0x0002;
var e_aabbBit = 0x0004;
var e_pairBit = 0x0008;
var e_centerOfMassBit = 0x0010;

var PTM = 32;

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
    golfux.balls.push(new Ball(new b2Vec2(mousePosWorld.x,mousePosWorld.y), golfux.balls.length));
    ballPlaced = true;
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
        onTouchMove(evt);
    }, false); // mobile
    
    canvas.addEventListener('mousedown', function(evt) {
        onMouseDown(canvas,evt);
    }, false);
    
    canvas.addEventListener('mouseup', function(evt) {
        onMouseUp(canvas,evt);
    }, false);

    canvas.addEventListener('mousemove', function(evt) {
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


var ballPlaced = false;
let sock;
document.addEventListener("DOMContentLoaded", function() {
    sock = io.connect();

    let partie = {  
                    nbPlayers: null,
                    nbManches: null,
                    code: null
                };

    var creerPartie = document.getElementById("btnCreer") //TODO Je sais pas ce qu'a mis robin donc c du random
    var rejoindrePartie = document.getElementById("btnRejoindre"); //TODO Same
    var listeParties = document.getElementById("listeParties");

    creerPartie.addEventListener("click", function(e){
        var nbJoueurs = document.getElementById("nbJoueurs");
        var nbManche = document.getElementById("nbManches");
        var prive = document.getElementById("prive");
        var code = null;

        if(prive.checked){
            code = createPassword();
            console.log(code);
        }

        partie.nbPlayers = nbJoueurs.value;
        partie.nbManches = nbManche.value;
        partie.code = code;

        sock.emit("CreateGame", partie);

    });

    rejoindrePartie.addEventListener("click", function(e){
        //TODO Afficher liste partie
        sock.emit("askListePartie");
    });

    listeParties.addEventListener("click", function(e){
        if(e.target.dataset.id){
            sock.emit("JoinPublicGame", e.target.dataset.id);
        }
    });

    //TODO Rejoindre partie privé 

    sock.on("gameStart",function(index){
        // Pas forcément sur, mais pourquoi pas s'en servir pour savoir quand stopper le loading screen
    });

    sock.on("yourTurn",function(e){
        // booléen ou autre
    });

    sock.on("ballShot",function(obj){
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
