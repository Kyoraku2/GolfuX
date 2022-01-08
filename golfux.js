class golfux{
    constructor(){
        this.click_down=null;
        this.click_up=null;
        this.balls = [];
        this.balls[0] = new Ball(new b2Vec2(0,2), 0);
        this.balls[1] = new Ball(new b2Vec2(1,2), 1);
        //this.ball = new Ball();
        this.level = new Level();

        this.level.createFromJSON('level1')
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
        this.balls[0] = new Ball(new b2Vec2(0,2), 0);
        this.balls[1] = new Ball(new b2Vec2(1,2), 1);
        this.level = new Level();

        this.level.createFromJSON('level'+level)
        addEventListener(this.balls,this.level);
        this.ballIndex = 0;

        draw();
    }

}
var MAX_INTENSITIE=10;
// Dimensions du monde pour déterminer le PTM (c'est le zoom un peu, le facteur de scale)
var w_width = 20.25;
var w_height = 27;
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
                        balls[idA].body.SetLinearDamping(12);
                        break;
                    case 201:
                        balls[idA].body.SetLinearDamping(18);
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
                }
            }else{
                switch(idA){
                    case 200:
                        balls[idB].body.SetLinearDamping(12);
                        break;
                    case 201:
                        balls[idB].body.SetLinearDamping(18);
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
                        balls[idA].body.SetLinearDamping(1);
                        break;
                }
            }else{
                switch(idA){
                    case 201:
                    case 200:
                        balls[idB].body.SetLinearDamping(1);
                        break;
                }
            }
        }
    };
    listener.PreSolve = function(contactPtr) {
    };
    listener.PostSolve = function(contactPtr) {
    };
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
    console.log(h);
    console.log(w); 
    PTM = w/w_width;

    var pos1 = getWorldPointFromPixelPoint({x:0,y:0});
    var pos2 = getWorldPointFromPixelPoint({x:w,y:h});
    var world_width = pos2.x - pos1.x;
    var world_height = pos2.y - pos1.y;
    console.log(world_height);
    console.log(world_width); 
    console.log(canvasOffset)
    setViewCenterWorld(new b2Vec2(world_width/2-0.05*world_width/2,world_height/2-0.05*world_height/2), true);
    console.log(canvasOffset)
}

golfux.prototype.setup = function() {

}

golfux.prototype.onMouseDown = function(canvas, evt) {
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
}

golfux.prototype.onTouchDown = function(canvas, evt) {
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.touches[0].clientX - rect.left;
    let y = evt.touches[0].clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
}


golfux.prototype.onTouchUp = function(canvas, evt) {
    // Récuperation de la position de relachement du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.changedTouches[0].clientX  - rect.left;
    let y = evt.changedTouches[0].clientY  - rect.top;
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
    this.balls[this.ballIndex].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);

    this.ballIndex = (this.ballIndex < this.balls.length-1) ? this.ballIndex+1 : 0;

    
}

golfux.prototype.onTouchMove = function(evt) {
    evt.preventDefault();
}

golfux.prototype.onMouseUp = function(canvas,evt) {
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
    this.balls[this.ballIndex].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);

    this.ballIndex = (this.ballIndex < this.balls.length-1) ? this.ballIndex+1 : 0;

    this.click_up=null;
    this.click_down=null;
}

golfux.prototype.step = function(){
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );

    var endLevel = true


    context.fillStyle = "black";
    var pos = getPixelPointFromWorldPoint({x:this.level.hole.body.GetPosition().x,y:this.level.hole.body.GetPosition().y});
    context.beginPath();
    context.arc(pos.x, pos.y, this.level.hole.radius*PTM, 0, 2 * Math.PI);
    context.fill();
    context.stroke();

    context.fillStyle = 'rgb(255,0,0)';

    // Sand
    if(this.level.obstacles["sand"].length>0){
        for(var i=0,l=this.level.obstacles["sand"].length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles["sand"][i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles["sand"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["sand"][i].hx,
                y:world_pos_wall.y+this.level.obstacles["sand"][i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            //console.log("sand");
            //console.log(wall_pos_canvas);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["sand"][i].hx*PTM*2, this.level.obstacles["sand"][i].hy*PTM*2);

        }
    }

    // Bubblegum
    if(this.level.obstacles["bubblegum"].length>0){
        for(var i=0,l=this.level.obstacles["bubblegum"].length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles["bubblegum"][i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles["bubblegum"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["bubblegum"][i].hx,
                y:world_pos_wall.y+this.level.obstacles["bubblegum"][i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["bubblegum"][i].hx*PTM*2, this.level.obstacles["bubblegum"][i].hy*PTM*2);
        }
    }

    // Walls
    if(this.level.obstacles["walls"].length>0){
        for(var i=0,l=this.level.obstacles["walls"].length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles["walls"][i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles["walls"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["walls"][i].hx,
                y:world_pos_wall.y+this.level.obstacles["walls"][i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["walls"][i].hx*PTM*2, this.level.obstacles["walls"][i].hy*PTM*2);
        }
    }
    
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

    if(endLevel){
        console.log("FINI");
        this.changeLevel(2)
    }
}



