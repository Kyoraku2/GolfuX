var golfux = function() {
    //constructor
    this.bd=null;
    this.body_ball=null;
    this.click_down=null;
    this.click_up=null;
}

golfux.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,7), true );
}

golfux.prototype.setup = function() {
    var map = world.CreateBody(new b2BodyDef());

    var shape0 = new b2EdgeShape();
    // Bas
    shape0.Set(new b2Vec2(9.5,0),new b2Vec2(-9.5,0))
    map.CreateFixture(shape0, 0.0);
    // Gauche  
    shape0.Set(new b2Vec2(-9.5,0),new b2Vec2(-9.5,24))
    map.CreateFixture(shape0, 0.0);
    // Droite
    shape0.Set( new b2Vec2(9.5,0),new b2Vec2(9.5,24));
    map.CreateFixture(shape0, 0.0);
    // Haut
    shape0.Set(new b2Vec2(9.5,24), new b2Vec2(-9.5, 24));
    map.CreateFixture(shape0, 0.0);


    // - Create the Physics
    // The shape
    var shape = new b2CircleShape();
    shape.set_m_radius(1);

    // Create a static body definition
    this.bd = new b2BodyDef();
    this.bd.set_type(b2_dynamicBody);
    this.bd.set_position(new b2Vec2(0,1));

    // Create the body itself
    this.body_ball = world.CreateBody(this.bd);

    // Create the fixture
    var fix = new b2FixtureDef();
    fix.set_shape(shape);
    fix.set_density(1);
    fix.set_friction(2);
    fix.set_restitution(0.3);

    // Add fixture to the body
    this.body_ball.CreateFixture(fix);
    this.body_ball.SetAngularDamping(0.9);
    this.body_ball.SetLinearDamping(0.25);
}

golfux.prototype.onMouseDown = function(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_down={x:x,y:canvas.height-y};
    this.click_down=getWorldPointFromPixelPoint(this.click_down);
    console.log(this.click_down);
    /*var mouse_click={x:x,y:canvas.height-y};
    mouse_click=getWorldPointFromPixelPoint(mouse_click);
    this.body_ball.ApplyLinearImpulse(new b2Vec2(0, 10),this.body_ball.GetPosition(),true);*/
}

golfux.prototype.onMouseUp = function(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    let x = evt.clientX - rect.left;
    let y = evt.clientY - rect.top;
    this.click_up={x:x,y:canvas.height-y};
    this.click_up=getWorldPointFromPixelPoint(this.click_up);
    console.log(this.click_up);

    var impulse={
        x:this.click_down.x-this.click_up.x,
        y:this.click_down.y-this.click_up.y
    };

    this.body_ball.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
}