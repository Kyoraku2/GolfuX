function Ball(){
    this.bd=null;
    this.body_ball=null;
    this.start_pos=new b2Vec2(9.5,1);
    this.view=null;

    // The shape
    var shape = new b2CircleShape();
    shape.set_m_radius(1);
    this.view = new createjs.Bitmap("./textures/ball.png");
    this.view.regX=this.view.regY=50;
    
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
    //this.body_ball.CreateFixture(fix);
    //this.body_ball.SetAngularDamping(100000); // La balle tourne sur elle même
    //this.body_ball.SetLinearDamping(1); // Friction de base

    this.view.body = this.body_ball;
    this.view.body.CreateFixture(fix);
    this.view.body.SetAngularDamping(100000); // La balle tourne sur elle même
    this.view.body.SetLinearDamping(1); // Friction de base
    this.view.onTick = tick;
}

tick = function(e){
    this.x = this.body.GetPosition().x;
    this.y = this.body.GetPosition().y;
}