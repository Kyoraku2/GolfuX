var MAX_INTENSITIE=10;
var shot = false;
var golfux = function() {
    //constructor
    this.click_down=null;
    this.click_up=null;
    this.ball = new Ball();
    this.level = new Level();
    this.level.initBasicWalls();
    this.level.test();
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

    shot = true;
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

    shot = false;
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

var wall_sprite=new Image();
wall_sprite.src = './textures/wall.jpg';

golfux.prototype.step = function(){
    this.ball.x=this.ball.body.GetPosition().x;
    this.ball.y=this.ball.body.GetPosition().y;
    var cvs=document.getElementById('canvas');
    var context = cvs.getContext( '2d' );

    var pos = getPixelPointFromWorldPoint({x:this.ball.x,y:this.ball.y});
    context.drawImage(this.ball.sprite, pos.x-10, cvs.height-pos.y-10,20,20);

    context.fillStyle = '#FF0000';
    
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

    //Segment
    var segment = compute_segment();
    //Si on tire en fait
    if (segment[0] && segment[1] && shot == true) {
        context.beginPath();
        print_segment(segment[0].x, segment[0].y, segment[1].x, segment[1].y);
        context.stroke();
    }

    function compute_segment() {
        let segment = Array();
        let ball_pos = {x: pos.x, y: cvs.height-pos.y};
        let click_pos = {x: mousePosPixel.x, y: cvs.height-mousePosPixel.y};
        let diff_pos = {x: Math.abs(click_pos.x - ball_pos.x), y: Math.abs(click_pos.y - ball_pos.y)};
        let final_pos = {x: ball_pos.x, y: ball_pos.y};
        if (click_pos.x < ball_pos.x) {
            final_pos.x += diff_pos.x;
        } else {
            final_pos.x -= diff_pos.x;
        }
        if (click_pos.y < ball_pos.y) {
            final_pos.y += diff_pos.y;
        } else {
            final_pos.y -= diff_pos.y;
        }
        segment[0] = ball_pos;
        segment[1] = final_pos;
        return segment;
    }

    //Fonction pour print la flèche (trucs mystiques pour le bout tkt)
    function print_segment(fromx, fromy, tox, toy) {
        context.strokeStyle = "#FF0000";
        context.lineWidth = 3;
        var headlen = 10; // length of head in pixels
        var dx = tox - fromx;
        var dy = toy - fromy;
        var angle = Math.atan2(dy, dx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
        context.moveTo(tox, toy);
        context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
      }
}