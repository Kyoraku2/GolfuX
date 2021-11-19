class golfux{
    constructor(){
        this.click_down=null;
        this.click_up=null;
        this.ball = new Ball();
        this.level = new Level();
        this.level.initBasicWalls();
        this.level.test();
        this.level.createHole(1, new b2Vec2(10,20));
        console.log(this.level);
        var x = this.level.hole.getPos().x-this.ball.x;
        var y = this.level.hole.getPos().y-this.ball.y;
        
        addEventListener(this.ball,this.level.hole);
    }



}
var MAX_INTENSITIE=10;

function addEventListener(ball, hole){
    var listener = new Box2D.JSContactListener();
    listener.BeginContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var idA = bodyA.GetUserData();
        var idB = bodyB.GetUserData();
        if((idA == 1 && idB == 2) || (idA == 2 && idB == 1)){
            if(idA == 1){
                ball.collide = true;
                //bodyA.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }else{
                ball.collide = true;
                //bodyB.ApplyLinearImpulse(new b2Vec2(x, y), true);
            }
        }
        if((idA==1 && idB==3) || (idA==3 && idB==1)){
            ball.sand=true;
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

        if((idA == 1 && idB == 2) || (idA == 2 && idB == 1)){
            if(idA == 1){
                ball.collide = false;
            }else{
                ball.collide = false;
            }
        }

        if((idA==1 && idB==3) || (idA==3 && idB==1)){
            ball.sand=false;
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
    this.ball.body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
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
    this.ball.body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
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
    this.ball.body.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
    this.click_up=null;
    this.click_down=null;
}

golfux.prototype.step = function(){
    this.ball.x=this.ball.body.GetPosition().x;
    this.ball.y=this.ball.body.GetPosition().y;
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );

    // Walls
    if(this.level.obstacles.length>0){
        for(let i=0,l=this.level.obstacles.length;i<l;++i){
            var pattern = context.createPattern(this.level.obstacles[i].sprite, 'repeat');
            context.fillStyle = pattern;
            var world_pos_wall=this.level.obstacles[i].body.GetPosition();
            var leftup_corner={
                x:world_pos_wall.x-this.level.obstacles[i].hx,
                y:world_pos_wall.y-this.level.obstacles[i].hy
            };
            var wall_pos_canvas = getPixelPointFromWorldPoint(leftup_corner);
            context.fillRect(wall_pos_canvas.x, wall_pos_canvas.y, this.level.obstacles[i].hx*PTM*2, this.level.obstacles[i].hy*PTM*2);
        }
    }

    this.ball.isColliding(this.level.hole);
    this.ball.isOnSand();

    var pos = getPixelPointFromWorldPoint({x:this.ball.x,y:this.ball.y});
    context.drawImage(this.ball.sprite, pos.x-10, cvs.height-pos.y-10,20,20);

    context.fillStyle = 'rgb(255,0,0)';
}