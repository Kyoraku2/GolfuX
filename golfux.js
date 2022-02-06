class Golfux{
    constructor(){
        this.click_down=null;
        this.click_up=null;
        this.balls = [];
        this.level = new Level();
        this.level.createFromJSON('level3');
        addEventListener(this.balls,this.level);
    }

    changeLevel(level) {
        if ( world != null ) 
            Box2D.destroy(world);
            
        world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0) );
        world.SetDebugDraw(myDebugDraw);
        
        this.click_down=null;
        this.click_up=null;
        this.balls = [];
        this.level = new Level();

        this.level.createFromJSON('level'+level)
        addEventListener(this.balls,this.level);
        draw();
    }

}
const MAX_INTENSITIE=8;
const BUBBLEGUM_LINEAR_DAMPLING = 18;
const SAND_LINEAR_DAMPLING = 12;
const ICE_LINEAR_DAMPLING = 0.8;
// Dimensions du monde pour déterminer le PTM (c'est le zoom un peu, le facteur de scale)
var w_width = 24;
var w_height = 32;
function addEventListener(balls, level){
    var listener = new Box2D.JSContactListener();
    listener.BeginContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var idA = bodyA.GetUserData();
        var idB = bodyB.GetUserData();
        if((idA >= 0 && idA < 99 && idB >= 100 && idB < 199) || (idA < 199 && idA >= 100 && idB < 99 && idB >= 0)){ //EVENEMENT COLLISION TROU (100 à 199)
            if(idA >= 0 && idA<99){
                balls[idA].collide = true;
            }else{
                balls[idB].collide = true;
            }
        }

        if((idA >= 0 && idA < 99 && idB>=200 && idB <=299) || (idA >= 200 && idA <= 299 && idB >= 0 && idB <= 99)){ //EVENEMENT COLLISIONS OBSTACLES SOLS (de 200 à 299)
            if(idA >= 0 && idA<99){
                switch(idB){
                    case 200:
                        balls[idA].body.SetLinearDamping(SAND_LINEAR_DAMPLING);
                        break;
                    case 201:
                        balls[idA].body.SetLinearDamping(BUBBLEGUM_LINEAR_DAMPLING);
                        break;
                    case 202:
                        setTimeout(function(body,start){ // C'est une douille, paske l'environnement veut pas faire simplemennt l'instruction
                            body.SetTransform(start,0);
                        },0,balls[idA].body,balls[idA].start_pos);
                        balls[idA].body.SetLinearVelocity(0);
                        break;
                    case 203:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyB==e.enter.body || bodyB == e.exit.body;
                        },bodyB);
                        if(taken.entered){
                            taken.entered = false;
                            return;
                        }
                        taken.entered = true;
                        var impulse = {
                            x:balls[idA].body.GetLinearVelocity().x,
                            y:balls[idA].body.GetLinearVelocity().y,
                        }
                        if(taken.enter.body == bodyA){
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.exit_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idA].body,taken,impulse);
                        }else{
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.enter_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction2, portal.direction1);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idA].body,taken,impulse);
                        }
                        break;
                    case 204:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyB==e.enter.body;
                        },bodyB);
                        if(taken == undefined){
                            return;
                        }
                        var impulse = {
                            x:balls[idA].body.GetLinearVelocity().x,
                            y:balls[idA].body.GetLinearVelocity().y,
                        }
                        setTimeout(function(body,portal,impulse){
                            body.SetTransform(portal.exit_pos,0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                            body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                        },0,balls[idA].body,taken,impulse);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyB==e.body;
                        },bodyB);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = balls[idA].body;
                        break;
                    case 207:
                        balls[idA].body.SetLinearDamping(ICE_LINEAR_DAMPLING);
                        break;
                    case 208:
                        setTimeout(function(body,lastPos){
                            body.SetTransform(new b2Vec2(lastPos.x,lastPos.y),0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            body.SetAngularVelocity(0);
                        },0,balls[idA].body,balls[idA].lastPos);
                    break;
                }
            }else{
                switch(idA){
                    case 200:
                        balls[idB].body.SetLinearDamping(SAND_LINEAR_DAMPLING);
                        break;
                    case 201:
                        balls[idB].body.SetLinearDamping(BUBBLEGUM_LINEAR_DAMPLING);
                        break;
                    case 202:
                        setTimeout(function(body,start){
                            body.SetTransform(start,0);
                        },0,balls[idB].body,balls[idB].start_pos); 
                        balls[idB].body.SetLinearVelocity(0);  
                        break;
                    case 203:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyA==e.enter.body || bodyA == e.exit.body;
                        },bodyA);
                        if(taken.entered){
                            taken.entered = false;
                            return;
                        }
                        taken.entered = true;
                        var impulse = {
                            x:balls[idB].body.GetLinearVelocity().x,
                            y:balls[idB].body.GetLinearVelocity().y,
                        }
                        if(taken.enter.body == bodyA){
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.exit_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idB].body,taken,impulse);
                        }else{
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.enter_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction2, portal.direction1);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idB].body,taken,impulse);
                        }
                        break;
                    case 204:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyA==e.enter.body;
                        },bodyA);
                        if(taken == undefined){
                            return;
                        }
                        var impulse = {
                            x:balls[idB].body.GetLinearVelocity().x,
                            y:balls[idB].body.GetLinearVelocity().y,
                        }
                        setTimeout(function(body,portal,impulse){
                            body.SetTransform(portal.exit_pos,0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                            body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                        },0,balls[idB].body,taken,impulse);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyA==e.body;
                        },bodyA);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = balls[idB].body;
                        break;
                    case 207:
                        balls[idB].body.SetLinearDamping(ICE_LINEAR_DAMPLING);
                        break;
                    case 208:
                        setTimeout(function(body,lastPos){
                            body.SetTransform(new b2Vec2(lastPos.x,lastPos.y),0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            body.SetAngularVelocity(0);
                        },0,balls[idB].body,balls[idB].lastPos);
                    break;
                }
            }
        }
    }

    // Empty implementations for unused methods.
    listener.EndContact = function(contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var idA = bodyA.GetUserData();
        var idB = bodyB.GetUserData();
        if((idA >= 0 && idA < 99 && idB >= 100 && idB < 199) || (idA < 199 && idA >= 100 && idB < 99 && idB >= 0)){
            if(idA >= 0 && idA<99){
                balls[idA].collide = false;
                balls[idA].isInHole = false;

                balls[idA].body.SetLinearDamping(1);
                balls[idA].body.GetFixtureList().SetSensor(false);
            }else{
                balls[idB].collide = false;
                balls[idB].isInHole = false;
                balls[idB].body.SetLinearDamping(1);
                balls[idB].body.GetFixtureList().SetSensor(false);
            }
        }

        if((idA >= 0 && idA < 99 && idB>=200 && idB <=299) || (idA >= 200 && idA <= 299 && idB >= 0 && idB <= 99)){
            if(idA >= 0 && idA<99){
                switch(idB){
                    case 201:
                    case 200:
                    case 207:
                        balls[idA].body.SetLinearDamping(1);
                        break;
                    case 205:

                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyB==e.body;
                        },bodyB);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = undefined;
                        break;
                }
            }else{
                switch(idA){
                    case 201:
                    case 200:
                    case 207:
                        balls[idB].body.SetLinearDamping(1);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyA==e.body;
                        },bodyA);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = undefined;
                        break;
                }
            }
        }
    };
    listener.PreSolve = function(contactPtr) {
    };
    listener.PostSolve = function(contactPtr) {
    };
    // TODO : check si y'a mieux ici aussi
    if(!world){
        return;
    }
    world.SetContactListener(listener);
}

Golfux.prototype.setNiceViewCenter = function() {
    var inFrame = (window.top != window.self);
    var w = ((inFrame) ? window.top.innerWidth : window.innerWidth)
    || document.documentElement.clientWidth
    || document.body.clientWidth;
    
    var h = ((inFrame) ? window.top.innerHeight : window.innerHeight)
    || document.documentElement.clientHeight
    || document.body.clientHeight;

    if(0.75 * h > w){
        h = w/0.75;
        w = 0.75 * h;
    }else{
        w = 0.75 * h;
    }
    w=0.75*h;
    canvas.height = h;
    canvas.width = w;
    canvasBack.height = h;
    canvasBack.width = w;
    PTM = w/w_width;

    var pos1 = getWorldPointFromPixelPoint({x:0,y:0});
    var pos2 = getWorldPointFromPixelPoint({x:w,y:h});
    var world_width = pos2.x - pos1.x;
    var world_height = pos2.y - pos1.y;
    setViewCenterWorld(new b2Vec2(world_width/2-0.05*world_width/2,world_height/2-0.05*world_height/2), true);
}

Golfux.prototype.setup = function() {

}

Golfux.prototype.onTouchMove = function(canvas, evt) {
    evt.preventDefault();
}

Golfux.prototype.onMouseDown = function(canvas, evt) {
    if(this.balls.length == 0 || (currentBall>=0 && this.balls[currentBall].shot) || !ballPlaced || ballIndex === null || impulsionStack.length>0 ){
        return;
    }
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
}

Golfux.prototype.onMouseUp = function(canvas, evt) {
    if(this.balls.length == 0 || !ballPlaced || ballIndex === null || !this.click_down  || this.balls[ballIndex].shot){
        return;
    }
    // Récuperation de la position de relachement du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_up={x:x,y:canvas.height-y};
    this.click_up=getWorldPointFromPixelPoint(this.click_up);

    var impulse={
        x:this.click_down.x-this.click_up.x,
        y:this.click_down.y-this.click_up.y
    };

    // Intensification en fonction de l'éloignement par rapport au click initial (valuer à changer)
    var intensifie=Math.sqrt(impulse.x*impulse.x + impulse.y*impulse.y);
    if(intensifie>MAX_INTENSITIE){
        intensifie=MAX_INTENSITIE;
    }

    // Impulsion
    this.balls[ballIndex].lastPos = {
        x:this.balls[ballIndex].body.GetPosition().x,
        y:this.balls[ballIndex].body.GetPosition().y
    }
    this.balls[ballIndex].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    this.balls[ballIndex].shot = true;
    if(playType === 2){
        sock.emit("shoot",{x:impulse.x*intensifie, y:impulse.y*intensifie});
        ballIndex=undefined;
    }else{
        ballIndex = (ballIndex < this.balls.length-1) ? ballIndex+1 : 0;
    }
    this.click_up=null;
    this.click_down=null;
}

Golfux.prototype.onTouchDown = function(canvas, evt) {
    if(this.balls.length == 0 || (currentBall>=0 && this.balls[currentBall].shot) || !ballPlaced || ballIndex === null || impulsionStack.length>0 ){
        return;
    }
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.touches[0].clientX - rect.left;
    let y = evt.touches[0].clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
}

Golfux.prototype.onTouchUp = function(canvas, evt) {
    if(this.balls.length == 0 || !ballPlaced || ballIndex === null || !this.click_down || this.balls[ballIndex].shot){
        return;
    }
    // Récuperation de la position de relachement du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.changedTouches[0].clientX - rect.left;
    let y = evt.changedTouches[0].clientY - rect.top;
    this.click_up={x:x,y:canvas.height-y};
    this.click_up=getWorldPointFromPixelPoint(this.click_up);
    
    var impulse={
        x:this.click_down.x-this.click_up.x,
        y:this.click_down.y-this.click_up.y
    };

    // Intensification en fonction de l'éloignement par rapport au click initial (valuer à changer)
    var intensifie=Math.sqrt(impulse.x*impulse.x + impulse.y*impulse.y);
    if(intensifie>MAX_INTENSITIE){
        intensifie=MAX_INTENSITIE;
    }
    // Impulsion
    this.balls[ballIndex].lastPos = {
        x:this.balls[ballIndex].body.GetPosition().x,
        y:this.balls[ballIndex].body.GetPosition().y
    }
    this.balls[ballIndex].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    this.balls[ballIndex].shot = true;
    if(playType === 2){
        sock.emit("shoot",{x:impulse.x*intensifie, y:impulse.y*intensifie});
        ballIndex=undefined;
    }else{
        ballIndex = (ballIndex < this.balls.length-1) ? ballIndex+1 : 0;
    }
    this.click_up=null;
    this.click_down=null;
}

Golfux.prototype.step = function(){
    // TODO : voir si on peut pas faire mieux
    if(!this.level.hole){
        return;
    }
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );
    var endLevel = true;

    updateBackground(this.level);
    
    // Wind
    if(this.level.obstacles["wind"].length>0){
        for(var i=0,l=this.level.obstacles["wind"].length;i<l;++i){
            if(this.level.obstacles["wind"][i].enter){
                this.level.obstacles["wind"][i].enter.ApplyLinearImpulse(new b2Vec2(this.level.obstacles["wind"][i].direction.x*this.level.obstacles["wind"][i].acceleration, this.level.obstacles["wind"][i].direction.y*this.level.obstacles["wind"][i].acceleration), true);
            }
        }
    }

    // Balls
    var allStopped = (this.balls.length !== 0);
    for(ball of this.balls){
        if(ball){
            ball.x=ball.body.GetPosition().x;
            ball.y=ball.body.GetPosition().y;
            ball.isColliding(this.level.hole);
    
            if(ball.body.GetLinearVelocity().Length()==0){ // Limite ici
                ball.isMoving = false;
            }else{
                ball.isMoving = true;
                allStopped = false;
            }
    
            var pos = getPixelPointFromWorldPoint({
                x:ball.x-ball.radius,
                y:ball.y+ball.radius
            });
            if(!ball.isInHole || ball.isMoving){
                context.drawImage(ball.sprite, pos.x, pos.y,ball.radius*PTM*2,ball.radius*PTM*2);
                endLevel = false;
            }else{
                ball.body.GetFixtureList().SetSensor(true);
            }
        }
    }

    // Détection de fin de tour
    if(allStopped && currentBall>=0 && this.balls[currentBall] && this.balls[currentBall].shot){
        this.balls[currentBall].shot = false;
        if(playType == 2){
            var endPos = [];
            this.balls.forEach(function(ball,index){
                endPos.push({index:index,pos:{x:ball.body.GetPosition().x,y:ball.body.GetPosition().y}});
            });
            sock.emit("endPos",endPos);
        }
    }

    if(allStopped && playType == 2){
        if(replacementStack.length > 0 && replacementStack.length === lastReplecementLength){
            lastReplecementLength = replacementStack.length;
            for(obj of replacementStack[0]){
                var localPos = golfux.balls[obj.index].body.GetPosition();
                if(localPos.x != obj.pos.x || localPos.y != obj.pos.y){
                    golfux.balls[obj.index].lastPos = {
                        x:golfux.balls[obj.index].body.GetPosition().x,
                        y:golfux.balls[obj.index].body.GetPosition().y
                    }
                    golfux.balls[obj.index].body.SetTransform(new b2Vec2(obj.pos.x, obj.pos.y), 0);
                }
            }
            replacementStack.splice(0,1);
        }
        if(impulsionStack.length>0){
            this.balls[impulsionStack[0].index].lastPos = {
                x:this.balls[impulsionStack[0].index].body.GetPosition().x,
                y:this.balls[impulsionStack[0].index].body.GetPosition().y
            }
            this.balls[impulsionStack[0].index].body.ApplyLinearImpulse(new b2Vec2(impulsionStack[0].impulse.x, impulsionStack[0].impulse.y),true);
            impulsionStack.splice(0,1);
        }
    }
    

    if(this.click_down && this.balls.length != 0 && ballIndex !== null && this.balls[ballIndex] && !this.balls[ballIndex].shot){
        var click_pos = getPixelPointFromWorldPoint(this.click_down);
        var ball_pos = getPixelPointFromWorldPoint(this.balls[ballIndex].body.GetPosition());
        var mouse_pos = getPixelPointFromWorldPoint(mousePosWorld);
        var vector = {
            x:click_pos.x-mouse_pos.x,
            y:click_pos.y-mouse_pos.y
        }
        var dest = {
            y:ball_pos.y+vector.y,
            x:ball_pos.x+vector.x
        }
        var norm = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
        var unit_vector = {
            x:vector.x/norm,
            y:vector.y/norm
        }

        if(norm > MAX_INTENSITIE*PTM){
            norm = MAX_INTENSITIE*PTM;
            dest.x=ball_pos.x+MAX_INTENSITIE*PTM*unit_vector.x
            dest.y=ball_pos.y+MAX_INTENSITIE*PTM*unit_vector.y
        }
        print_segment(norm,ball_pos.x,ball_pos.y,dest.x, dest.y);
    }

    if(endLevel && this.balls.length !=0){
        console.log("FINI");
        this.changeLevel(2)
    }
}

function allImagesLoaded(level){
    for(const type in level.obstacles){
        for(var i=0,l=level.obstacles[type].length;i<l;++i){
            if(level.obstacles[type][i].sprite !== undefined){
                if(level.obstacles[type][i].sprite.complete === false){
                    return false;
                }
            }
        }
    }

    return true;
}

function updateBackground(level){
    if(level.rendered){
        return;
    }
    level.rendered = allImagesLoaded(level);
    contextBack.fillStyle = 'rgb(0,153,0)';
    contextBack.fillRect( 0, 0, canvasBack.width, canvasBack.height );
    contextBack.fillStyle = "black";
    contextBack.strokeStyle = "black";
    var pos = getPixelPointFromWorldPoint({x:level.hole.body.GetPosition().x,y:level.hole.body.GetPosition().y});
    contextBack.beginPath();
    contextBack.arc(pos.x, pos.y, level.hole.radius*PTM, 0, 2 * Math.PI);
    contextBack.fill();
    contextBack.stroke();

    contextBack.fillStyle = '#FF0000';
    
    // Sand
    renderObjectType("sand",level,"white",contextBack);

    // Ice
    renderObjectType("ice",level,"lime",contextBack);

    // Bubblegum
    renderObjectType("bubblegum",level,"black",contextBack);

    // Void
    renderObjectType("void",level,"grey",contextBack);

    // Water
    renderObjectType("water",level,"yellow",contextBack);

    // Bumper
    renderObjectType("bumper",level,"blue",contextBack);

    // Spawn area
    renderObjectType("spawn",level,"rgb(0,110,0)",contextBack);

    // Wind
    if(level.obstacles["wind"].length>0){
        for(var i=0,l=level.obstacles["wind"].length;i<l;++i){
            var world_pos_wall=level.obstacles["wind"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-level.obstacles["wind"][i].hx,
                y:world_pos_wall.y+level.obstacles["wind"][i].hy
            };
            contextBack.fillStyle = 'rgb(0,130,0)';
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            var wall_pos_canvas_center = getPixelPointFromWorldPoint(world_pos_wall);
            contextBack.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, level.obstacles["wind"][i].hx*PTM*2, level.obstacles["wind"][i].hy*PTM*2);
            contextBack.save();
            contextBack.translate(wall_pos_canvas_center.x,wall_pos_canvas_center.y);
            var angle = 2*Math.atan(level.obstacles["wind"][i].direction.y/(level.obstacles["wind"][i].direction.x+Math.sqrt(Math.pow(level.obstacles["wind"][i].direction.x,2) + Math.pow(level.obstacles["wind"][i].direction.y,2))));
            contextBack.rotate(Math.PI*1.5);
            contextBack.rotate(-angle);
            contextBack.drawImage(level.obstacles["wind"][i].sprite, -level.obstacles["wind"][i].hx*PTM, -level.obstacles["wind"][i].hy*PTM , level.obstacles["wind"][i].hx*PTM*2, level.obstacles["wind"][i].hy*PTM*2);
            contextBack.restore();
        }
    }

    // Portal
    if(level.obstacles["portal"].length>0){
        for(var i=0,l=level.obstacles["portal"].length;i<l;++i){
            if(!level.obstacles["portal"][i].bidirectional){
                renderSquareObject(level.obstacles["portal"][i].enter,"aqua",contextBack);
                renderSquareObject(level.obstacles["portal"][i].exit,"orange",contextBack);
            }else{
                renderSquareObject(level.obstacles["portal"][i].enter,"purple",contextBack);
                renderSquareObject(level.obstacles["portal"][i].exit,"purple",contextBack);
            }
        }
    }
    // Walls
    renderObjectType("walls",level,"red",contextBack);
}

function renderObjectType(type,level,debugColor,ctx){
    if(level.obstacles[type].length>0){
        for(var i=0,l=level.obstacles[type].length;i<l;++i){
            switch(level.obstacles[type][i].type){
                case "circle":
                    renderRoundObject(level.obstacles[type][i],debugColor,ctx);
                break;
                case "box":
                    renderSquareObject(level.obstacles[type][i],debugColor,ctx);
                break;
                case "polygon":
                    renderPolygonObject(level.obstacles[type][i],debugColor,ctx);
                break;
            }
        }
    }
}

function renderPolygonObject(obj,debugColor,ctx){
    if(obj.sprite !== undefined){
        var pattern = ctx.createPattern(obj.sprite, 'repeat');
        ctx.fillStyle = pattern;
    }else{
        ctx.fillStyle = debugColor;
    }
    var vectrices = [];
    for(var i=0, l=obj.vectrices.length ; i<l ; ++i){
        vectrices.push(getPixelPointFromWorldPoint(obj.vectrices[i]));
    }
    ctx.beginPath();
    ctx.moveTo(vectrices[0].x,vectrices[0].y);
    for(var i=1, l=vectrices.length ; i<l ; ++i){
        ctx.lineTo(vectrices[i].x,vectrices[i].y);
    }
    ctx.closePath();
    ctx.fill();
}

function renderRoundObject(obj,debugColor,ctx){
    if(obj.sprite !== undefined){
        var pattern = ctx.createPattern(obj.sprite, 'repeat');
        ctx.fillStyle = pattern;
    }else{
        ctx.fillStyle = debugColor;
    }
    var pos = getPixelPointFromWorldPoint(obj.middle_pos);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, obj.radius*PTM, 0, 2 * Math.PI);
    ctx.fill();
}

function renderSquareObject(obj,debugColor,ctx){
    if(obj.sprite !== undefined){
        var pattern = ctx.createPattern(obj.sprite, 'repeat');
        ctx.fillStyle = pattern;
    }else{
        ctx.fillStyle = debugColor;
    }
    var leftup_corner={
        x:obj.middle_pos.x-obj.hx,
        y:obj.middle_pos.y+obj.hy
    };

    var canvas_pos;
    if(!obj.angle){
        canvas_pos = getPixelPointFromWorldPoint(leftup_corner);
        ctx.fillRect(canvas_pos.x, canvas_pos.y, obj.hx*PTM*2, obj.hy*PTM*2);
    }else{
        canvas_pos = getPixelPointFromWorldPoint(obj.middle_pos);
        ctx.save();
        ctx.translate(canvas_pos.x,canvas_pos.y);
        ctx.rotate(-obj.angle);
        ctx.fillRect(-obj.hx*PTM, -obj.hy*PTM, obj.hx*PTM*2, obj.hy*PTM*2);
        ctx.restore();
    }
}

//Fonction pour print la flèche (trucs mystiques pour le bout tkt)
function print_segment(norme, fromx, fromy, tox, toy) {
    var percents = (100 * norme) / (MAX_INTENSITIE*PTM);
    var color = "rgb(255, "+(255 - norme)+", 0)";
    context.fillStyle = color;
    context.strokeStyle = color;
    context.font = "bold 20px comic sans ms";
    //if(ballIndex == currentBall){
        context.fillText(Math.trunc(percents)+"%", (tox + fromx)/2 - 15, (toy + fromy)/2 - 15);
    //}
    context.lineWidth = 2;
    var headlen = 10; // length of head in pixels
    var dx = tox - fromx;
    var dy = toy - fromy;
    var angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
}

function portalNormalForce(impulse,dirEnter,dirExit){
    switch(dirEnter){
        case "N":
            switch(dirExit){
                case "N":
                    impulse.y*=-1;
                    break;
                case "E":
                    var tmp = impulse.x;
                    impulse.x = -impulse.y;
                    impulse.y = tmp;
                    break;
                case "W":
                    var tmp = impulse.x;
                    impulse.x = impulse.y;
                    impulse.y = tmp;
                    break;
            }
        case "S":
            switch(dirExit){
                case "S":
                    impulse.y*=-1;
                    break;
                case "E":
                    var tmp = impulse.x;
                    impulse.x = impulse.y;
                    impulse.y = tmp;
                    break;
                case "W":
                    var tmp = impulse.x;
                    impulse.x = -impulse.y;
                    impulse.y = tmp;
                    break;
            }
            break;
        case "E":
            switch(dirExit){
                case "S":
                    var tmp = impulse.y;
                    impulse.y = -impulse.x
                    impulse.x = tmp;
                    break;
                case "N":
                    var tmp = impulse.y;
                    impulse.y = impulse.x
                    impulse.x = tmp;
                    break;
                case "E":
                    impulse.x *= -impulse.x;
                    break;
            }
            break;
        case "W":
            switch(dirExit){
                case "S":
                    var tmp = impulse.y;
                    impulse.y = impulse.x
                    impulse.x = tmp;
                    break;
                case "N":
                    var tmp = impulse.y;
                    impulse.y = -impulse.x
                    impulse.x = tmp;
                    break;
                case "W":
                    impulse.x *= -impulse.x;
                    break;
            }
            break;
    }
    return impulse;
}
