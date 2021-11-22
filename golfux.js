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
        this.level.test();
        this.level.createHole(0.5, new b2Vec2(10,20));
        console.log(this.level);
        var x = this.level.hole.getPos().x-this.balls[0].x;
        var y = this.level.hole.getPos().y-this.balls[0].y;
        
        addEventListener(this.balls,this.level.hole);
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
    // now do what you wish with the fixtures
    }

    // Empty implementations for unused methods.
    listener.EndContact = function(contactPtr) {
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
                balls[idA].collide = false;
                //bodyA.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }else{
                balls[idB].collide = false;
                //bodyB.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }
        }
    };
    listener.PreSolve = function(contactPtr) {};
    listener.PostSolve = function(contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        contact.SetEnabled(true);
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

golfux.prototype.onMouseUp = function(canvas, evt) {
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
    for(var i = 0; i<this.balls.length; i++){
        this.balls[i].body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    }
    this.click_up=null;
    this.click_down=null;
}

var wall_sprite=new Image();
wall_sprite.src = './textures/wall.jpg';
golfux.prototype.step = function(){
    
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );

    for(var i = 0; i<this.balls.length; i++){
        this.balls[i].x=this.balls[i].body.GetPosition().x;
        this.balls[i].y=this.balls[i].body.GetPosition().y;
        this.balls[i].isColliding(this.level.hole);

        var pos = getPixelPointFromWorldPoint({x:this.balls[i].x,y:this.balls[i].y});
        //if(!this.ball.isInHole){//TODO ajouter et moving == false
            context.drawImage(this.balls[i].sprite, pos.x-10, cvs.height-pos.y-10,20,20);
        //}
    }
    context.fillStyle = 'rgb(255,0,0)';
    
    // Walls
    var pattern = context.createPattern(wall_sprite, 'repeat');
    context.fillStyle = pattern;
    for(let i=0,l=this.level.walls.length;i<l;++i){
        var world_pos_wall=this.level.walls[i].wall.GetPosition();
        var leftup_corner={
            x:world_pos_wall.x-this.level.walls[i].hx,
            y:world_pos_wall.y-this.level.walls[i].hy
        };
        var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
        context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.walls[i].hx*PTM*2, this.level.walls[i].hy*PTM*2);
    }
}