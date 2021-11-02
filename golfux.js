var MAX_INTENSITIE=10;
var golfux = function() {
    //constructor
    this.bd=null;
    this.body_ball=null;
    this.click_down=null;
    this.click_up=null;
    this.start_pos=new b2Vec2(9.5,1);
    this.walls=[];
}

golfux.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(9.5,7), true );
}

golfux.prototype.setup = function() {
    var map = world.CreateBody(new b2BodyDef());

    var shape0 = new b2EdgeShape();
    var wall_fix = new b2FixtureDef();
    wall_fix.set_shape(shape0);
    wall_fix.set_density(100000);

    // Bas
    shape0.Set(new b2Vec2(0,0),new b2Vec2(19,0))
    map.CreateFixture(shape0, 10000.0);
    // Droite 
    shape0.Set(new b2Vec2(19,0),new b2Vec2(19,24))
    map.CreateFixture(shape0, 10000.0);
    // Gauche
    shape0.Set(new b2Vec2(0,0),new b2Vec2(0,24));
    map.CreateFixture(shape0, 10000.0);
    // Haut
    shape0.Set(new b2Vec2(0,24), new b2Vec2(19, 24));
    map.CreateFixture(shape0, 10000.0);
    

    // - Create the Physics
    // The shape
    var shape = new b2CircleShape();
    shape.set_m_radius(1);

    // Create a static body definition
    this.bd = new b2BodyDef();
    this.bd.set_type(b2_dynamicBody);
    this.bd.set_position(this.start_pos);

    // Create the body itself
    this.body_ball = world.CreateBody(this.bd);

    // Create the fixture
    var fix = new b2FixtureDef();
    fix.set_shape(shape);
    fix.set_density(1);
    fix.set_friction(0);
    fix.set_restitution(1); // Force restante après rebond

    // Add fixture to the body
    this.body_ball.CreateFixture(fix);
    this.body_ball.SetAngularDamping(100000); // La balle tourne sur elle même
    this.body_ball.SetLinearDamping(1); // Friction de base
}

golfux.prototype.onMouseDown = function(canvas, evt) {
    // Récuperation de la position du click
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
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
    this.body_ball.ApplyLinearImpulse(new b2Vec2(impulse.x*intensifie, impulse.y*intensifie),true);
}