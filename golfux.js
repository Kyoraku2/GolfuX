class golfux{
    constructor(){
        this.click_down=null;
        this.click_up=null;
        this.balls = [];
        //this.balls[0] = new Ball(new b2Vec2(0,2), 0);
        //this.balls[1] = new Ball(new b2Vec2(0,2), 1);
        //this.ball = new Ball();
        this.level = new Level();
        this.level.createFromJSON('level3')
        //this.level.initBasicWalls();
        //this.level.createHole(0.5, new b2Vec2(10,20));
        addEventListener(this.balls,this.level);
        this.ballIndex = 0;
        
    }

    changeLevel(level) {
        if ( world != null ) 
            Box2D.destroy(world);
            
        world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0) );
        world.SetDebugDraw(myDebugDraw);
        
        this.click_down=null;
        this.click_up=null;
        this.balls = [];
        //this.balls[0] = new Ball(new b2Vec2(0,2), 0);
        //this.balls[1] = new Ball(new b2Vec2(1,2), 1);
        this.level = new Level();

        this.level.createFromJSON('level'+level)
        addEventListener(this.balls,this.level);
        this.ballIndex = 0;

        draw();
    }

}
const MAX_INTENSITIE=8;
const BUBBLEGUM_LINEAR_DAMPLING = 18;
const SAND_LINEAR_DAMPLING = 12;
const ICE_LINEAR_DAMPLING = 0.8;
// Dimensions du monde pour déterminer le PTM (c'est le zoom un peu, le facteur de scale)
var w_width = 24.3;
var w_height = 32.4;
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
                        if(taken.enter.body == bodyB){
                            setTimeout(function(body,start){
                                body.SetTransform(start,0);
                            },0,balls[idA].body,taken.exit_pos);
                        }else{
                            setTimeout(function(body,start){
                                body.SetTransform(start,0);
                            },0,balls[idA].body,taken.enter_pos);
                        }
                        break;
                    case 204:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyB==e.enter.body;
                        },bodyB);
                        if(taken == undefined){
                            return;
                        }
                        setTimeout(function(body,start){
                            body.SetTransform(start,0);
                        },0,balls[idA].body,taken.exit_pos);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyB==e.body;
                        },bodyB);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = balls[idB].body;
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
                        if(taken.enter.body == bodyA){
                            setTimeout(function(body,start){
                                body.SetTransform(start,0);
                            },0,balls[idB].body,taken.exit_pos);
                        }else{
                            setTimeout(function(body,start){
                                body.SetTransform(start,0);
                            },0,balls[idB].body,taken.enter_pos);
                        }
                        break;
                    case 204:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyA==e.enter.body;
                        },bodyA);
                        if(taken == undefined){
                            return;
                        }
                        setTimeout(function(body,start){
                            body.SetTransform(start,0);
                        },0,balls[idB].body,taken.exit_pos);
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

golfux.prototype.setNiceViewCenter = function() {
    var cvs=document.getElementById('canvas');
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
    cvs.height = h;
    cvs.width = w;
    PTM = w/w_width;

    var pos1 = getWorldPointFromPixelPoint({x:0,y:0});
    var pos2 = getWorldPointFromPixelPoint({x:w,y:h});
    var world_width = pos2.x - pos1.x;
    var world_height = pos2.y - pos1.y;
    setViewCenterWorld(new b2Vec2(world_width/2-0.05*world_width/2,world_height/2-0.05*world_height/2), true);
}

golfux.prototype.setup = function() {

}

golfux.prototype.onTouchMove = function(canvas, evt) {
    evt.preventDefault();
}

golfux.prototype.onMouseDown = function(canvas, evt) {
    if(this.balls.length == 0){
        return;
    }
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
}

golfux.prototype.onMouseUp = function(canvas, evt) {
    if(this.balls.length == 0 || !this.click_down){
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
    this.balls[this.ballIndex].lastPos = {
        x:this.balls[this.ballIndex].body.GetPosition().x,
        y:this.balls[this.ballIndex].body.GetPosition().y
    }
    this.balls[this.ballIndex].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    this.ballIndex = (this.ballIndex < this.balls.length-1) ? this.ballIndex+1 : 0;
    this.click_up=null;
    this.click_down=null;
}

golfux.prototype.onTouchDown = function(canvas, evt) {
    if(this.balls.length == 0){
        return;
    }
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.touches[0].clientX - rect.left;
    let y = evt.touches[0].clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
}

golfux.prototype.onTouchUp = function(canvas, evt) {
    if(this.balls.length == 0){
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
    this.balls[this.ballIndex].lastPos = {
        x:this.balls[this.ballIndex].body.GetPosition().x,
        y:this.balls[this.ballIndex].body.GetPosition().y
    }
    this.balls[this.ballIndex].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    this.ballIndex = (this.ballIndex < this.balls.length-1) ? this.ballIndex+1 : 0;
    this.click_up=null;
    this.click_down=null;
}

golfux.prototype.step = function(){
    // TODO : voir si on peut pas faire mieux
    if(!this.level.hole){
        return;
    }
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );

    var endLevel = true;

    context.fillStyle = "black";
    context.strokeStyle = "black";
    var pos = getPixelPointFromWorldPoint({x:this.level.hole.body.GetPosition().x,y:this.level.hole.body.GetPosition().y});
    context.beginPath();
    context.arc(pos.x, pos.y, this.level.hole.radius*PTM, 0, 2 * Math.PI);
    context.fill();
    context.stroke();

    context.fillStyle = '#FF0000';
    // Sand
    renderObjectType("sand",this.level,"white");

    // Ice
    renderObjectType("ice",this.level,"lime");

    // Bubblegum
    renderObjectType("bubblegum",this.level,"black");

    // Void
    renderObjectType("void",this.level,"grey");

    // Water
    renderObjectType("water",this.level,"yellow");

    // Bumper
    renderObjectType("bumper",this.level,"blue");

    // Spawn area
    renderObjectType("spawn",this.level,"rgb(0,110,0)");

    // Wind
    if(this.level.obstacles["wind"].length>0){
        for(var i=0,l=this.level.obstacles["wind"].length;i<l;++i){
            var world_pos_wall=this.level.obstacles["wind"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["wind"][i].hx,
                y:world_pos_wall.y+this.level.obstacles["wind"][i].hy
            };
            context.fillStyle = 'rgb(0,130,0)';
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            var wall_pos_canvas_center = getPixelPointFromWorldPoint(world_pos_wall);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["wind"][i].hx*PTM*2, this.level.obstacles["wind"][i].hy*PTM*2);
            context.save();
            context.translate(wall_pos_canvas_center.x,wall_pos_canvas_center.y);
            var angle = 2*Math.atan(this.level.obstacles["wind"][i].direction.y/(this.level.obstacles["wind"][i].direction.x+Math.sqrt(Math.pow(this.level.obstacles["wind"][i].direction.x,2) + Math.pow(this.level.obstacles["wind"][i].direction.y,2))));
            context.rotate(Math.PI*1.5);
            context.rotate(-angle);
            context.drawImage(this.level.obstacles["wind"][i].sprite, -this.level.obstacles["wind"][i].hx*PTM, -this.level.obstacles["wind"][i].hy*PTM , this.level.obstacles["wind"][i].hx*PTM*2, this.level.obstacles["wind"][i].hy*PTM*2);
            context.restore();

            if(this.level.obstacles["wind"][i].enter){
                this.level.obstacles["wind"][i].enter.ApplyLinearImpulse(new b2Vec2(this.level.obstacles["wind"][i].direction.x*this.level.obstacles["wind"][i].acceleration, this.level.obstacles["wind"][i].direction.y*this.level.obstacles["wind"][i].acceleration), true);
            }

        }
    }

    // Portal
    if(this.level.obstacles["portal"].length>0){
        for(var i=0,l=this.level.obstacles["portal"].length;i<l;++i){
            if(!this.level.obstacles["portal"][i].bidirectional){
                renderSquareObject(this.level.obstacles["portal"][i].enter,"aqua");
                renderSquareObject(this.level.obstacles["portal"][i].exit,"orange");
            }else{
                renderSquareObject(this.level.obstacles["portal"][i].enter,"purple");
                renderSquareObject(this.level.obstacles["portal"][i].exit,"purple");
            }
        }
    }
    // Walls
    renderObjectType("walls",this.level,"red");
    
    // Balls
    for(var i = 0; i<this.balls.length; i++){
        this.balls[i].x=this.balls[i].body.GetPosition().x;
        this.balls[i].y=this.balls[i].body.GetPosition().y;
        this.balls[i].isColliding(this.level.hole);

        if(this.balls[i].body.GetLinearVelocity().Length()<1){
            this.balls[i].isMoving = false;
        }else{
            this.balls[i].isMoving = true;
        }

        var pos = getPixelPointFromWorldPoint({
            x:this.balls[i].x-this.balls[i].radius,
            y:this.balls[i].y+this.balls[i].radius
        });
        if(!this.balls[i].isInHole || this.balls[i].isMoving){
            context.drawImage(this.balls[i].sprite, pos.x, pos.y,this.balls[i].radius*PTM*2,this.balls[i].radius*PTM*2);
            endLevel = false;

        }else{
            this.balls[i].body.GetFixtureList().SetSensor(true);
            
        }
    }

    if(this.click_down && this.balls.length != 0){
        var click_pos = getPixelPointFromWorldPoint(this.click_down);
        var ball_pos = getPixelPointFromWorldPoint(this.balls[this.ballIndex].body.GetPosition());
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

    if(endLevel){
        endLevel = (this.balls.length !=0);
    }
    if(endLevel){
        console.log("FINI");
        this.changeLevel(2)
    }
}

function renderObjectType(type,level,debugColor){
    if(level.obstacles[type].length>0){
        for(var i=0,l=level.obstacles[type].length;i<l;++i){
            switch(level.obstacles[type][i].type){
                case "circle":
                    renderRoundObject(level.obstacles[type][i],debugColor);
                break;
                case "box":
                    renderSquareObject(level.obstacles[type][i],debugColor);
                break;
            }
        }
    }
}

function renderRoundObject(obj,debugColor){
    if(obj.sprite !== undefined){
        var pattern = context.createPattern(obj.sprite, 'repeat');
        context.fillStyle = pattern;
    }else{
        context.fillStyle = debugColor;
    }
    var pos = getPixelPointFromWorldPoint(obj.body.GetPosition());
    context.beginPath();
    context.arc(pos.x, pos.y, obj.radius*PTM, 0, 2 * Math.PI);
    context.fill();
}

function renderSquareObject(obj,debugColor){
    if(obj.sprite !== undefined){
        var pattern = context.createPattern(obj.sprite, 'repeat');
        context.fillStyle = pattern;
    }else{
        context.fillStyle = debugColor;
    }
    var world_pos=obj.body.GetPosition();
    var leftup_corner={
        x:world_pos.x-obj.hx,
        y:world_pos.y+obj.hy
    };
    var canvas_pos = getPixelPointFromWorldPoint(leftup_corner);
    context.fillRect(canvas_pos.x, canvas_pos.y, obj.hx*PTM*2, obj.hy*PTM*2);
}

//Fonction pour print la flèche (trucs mystiques pour le bout tkt)
function print_segment(norme, fromx, fromy, tox, toy) {
    var percents = (100 * norme) / (MAX_INTENSITIE*PTM);
    var color = "rgb(255, "+(255 - norme)+", 0)";
    context.fillStyle = color;
    context.strokeStyle = color;
    context.font = "bold 20px comic sans ms";
    context.fillText(Math.trunc(percents)+"%", (tox + fromx)/2 - 15, (toy + fromy)/2 - 15);
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
