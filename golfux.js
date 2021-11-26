class golfux{
    constructor(){
        this.click_down=null;
        this.click_up=null;
        this.balls = [];
        this.balls[0] = new Ball(new b2Vec2(0,2), 0);
        this.balls[1] = new Ball(new b2Vec2(1,2), 1);
        //this.ball = new Ball();
        this.level = new Level();
        this.level.initBasicWalls();
        this.level.createHole(0.5, new b2Vec2(10,20));
        console.log(this.level);
        var x = this.level.hole.getPos().x-this.balls[0].x;
        var y = this.level.hole.getPos().y-this.balls[0].y;
        
        addEventListener(this.balls,this.level.hole);
        this.ballIndex = 0;
        //addEventListener(this.balls[0],this.level.hole);
    }



}
var MAX_INTENSITIE=10;

function addEventListener(balls, hole){
    var listener = new Box2D.JSContactListener();
    listener.BeginContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        console.log(contact)
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var idA = bodyA.GetUserData();
        var idB = bodyB.GetUserData();
        if((idA >= 0 && idA < 99 && idB >= 100 && idB < 199) || (idA < 199 && idA >= 100 && idB < 99 && idB >= 0)){
            if(idA >= 0 && idA<99){
                balls[idA].collide = true;
                //bodyA.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }else{
                balls[idB].collide = true;
                //bodyB.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }
        }
        if((idA==1 && idB==3) || (idA==3 && idB==1)){ // sand
            ball.body.SetLinearDamping(14);
        }
        if((idA==1 && idB==4) || (idA==4 && idB==1)){ // bubble
            ball.body.SetLinearDamping(18);
        }
        if((idA==1 && idB==5) || (idA==5 && idB==1)){ // void
            //ball.bodydef.set_position();
            //ball.body.SetTransform(b2Vec2(0,0),ball.body.GetAngle());
        }
    // now do what you wish with the fixtures
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
                //bodyA.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }else{
                balls[idB].collide = false;
                balls[idB].isInHole = false;
                //bodyB.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }
        }
        if((idA==1 && idB==3) || (idA==3 && idB==1)){
            ball.body.SetLinearDamping(1); // TODO : Constante pour ça
        }
        if((idA==1 && idB==4) || (idA==4 && idB==1)){
            ball.body.SetLinearDamping(1);
        }
    };
    listener.PreSolve = function(contactPtr) {
    };
    listener.PostSolve = function(contactPtr) {
    };
    world.SetContactListener(listener);
}

golfux.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(9.5,7), true );
}

golfux.prototype.setup = function() {

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
    for(var i = 0; i<this.balls.length; i++){
        this.balls[i].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    }
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
    for(var i = 0; i<this.balls.length; i++){
        this.balls[i].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    }
    
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
    console.log(this.balls.length)
    this.ballIndex = (this.ballIndex < this.balls.length-1) ? this.ballIndex+1 : 0;

    this.click_up=null;
    this.click_down=null;
}

golfux.prototype.step = function(){
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );
    for(var i = 0; i<this.balls.length; i++){
        this.balls[i].x=this.balls[i].body.GetPosition().x;
        this.balls[i].y=this.balls[i].body.GetPosition().y;
        this.balls[i].isColliding(this.level.hole);
        if(this.balls[i].body.GetLinearVelocity().Length()<1){
            this.balls[i].isMoving = false;
        }else{
            this.balls[i].isMoving = true;
        }
        var pos = getPixelPointFromWorldPoint({x:this.balls[i].x,y:this.balls[i].y});
        if(!this.balls[i].isInHole || this.balls[i].isMoving){
            context.drawImage(this.balls[i].sprite, pos.x-10, cvs.height-pos.y-10,20,20);
        }
    }

    // Sand
    if(this.level.obstacles["sand"].length>0){
        for(let i=0,l=this.level.obstacles["sand"].length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles["sand"][i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles["sand"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["sand"][i].hx,
                y:world_pos_wall.y-this.level.obstacles["sand"][i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["sand"][i].hx*PTM*2, this.level.obstacles["sand"][i].hy*PTM*2);
        }
    }


    // bubblegum
    if(this.level.obstacles["bubblegum"].length>0){
        for(let i=0,l=this.level.obstacles["bubblegum"].length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles["bubblegum"][i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles["bubblegum"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["bubblegum"][i].hx,
                y:world_pos_wall.y-this.level.obstacles["bubblegum"][i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["bubblegum"][i].hx*PTM*2, this.level.obstacles["bubblegum"][i].hy*PTM*2);
        }
    }

    // Walls
    if(this.level.obstacles["walls"].length>0){
        for(let i=0,l=this.level.obstacles["walls"].length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles["walls"][i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles["walls"][i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles["walls"][i].hx,
                y:world_pos_wall.y-this.level.obstacles["walls"][i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles["walls"][i].hx*PTM*2, this.level.obstacles["walls"][i].hy*PTM*2);
        }
    }

    this.ball.isColliding(this.level.hole);

    var pos = getPixelPointFromWorldPoint({x:this.ball.x,y:this.ball.y});
    context.drawImage(this.ball.sprite, pos.x-10, cvs.height-pos.y-10,20,20);
    context.fillStyle = 'rgb(255,0,0)';
}