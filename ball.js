class Ball{
    constructor(){
        this.bodydef=null;
        this.body=null;
        this.start_pos=new b2Vec2(9.5,5);
        this.view=null;
        this.sprite=new Image();
        this.sprite.src = './textures/ball.png';
    
        // The shape
        var shape = new b2CircleShape();
        shape.set_m_radius(0.3);
        //this.view = new createjs.Bitmap("./textures/ball.png");
        //this.view.regX=this.view.regY=50;
        
        // Create a static body definition
        this.bodydef = new b2BodyDef();
        this.bodydef.set_type(b2_dynamicBody);
        this.bodydef.set_position(this.start_pos);
    
        // Create the body itself
        this.body = world.CreateBody(this.bodydef);
    
        // Create the fixture
        var fix = new b2FixtureDef();
        fix.set_shape(shape);
        fix.set_density(10);
        fix.set_friction(0);
        fix.set_restitution(1); // Force restante après rebond
    
        // Add fixture to the body
        this.body.CreateFixture(fix);
        this.body.SetAngularDamping(100000); // La balle tourne sur elle même
        this.body.SetLinearDamping(1); // Friction de base
        this.x = this.body.GetPosition().x;
        this.y = this.body.GetPosition().y;
    
        //this.view.body = this.body_ball;
        //this.view.body.CreateFixture(fix);
        //this.view.body.SetAngularDamping(100000); // La balle tourne sur elle même
        //this.view.body.SetLinearDamping(1); // Friction de base
        //this.x = this.view.body.GetPosition().x;
        //this.y = this.view.body.GetPosition().y;   
    }
}
