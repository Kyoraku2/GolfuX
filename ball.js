class Ball{
    constructor(start_pos=new b2Vec2(9.5,1), index){
        this.bodydef=null;
        this.body=null;
        this.start_pos=start_pos;
        this.sprite=new Image();
        this.collide = false;
        this.sprite.src = './textures/ball.png';
        this.isInHole = false;
        this.isMoving = false;
        this.shot = false;
        this.lastPos = undefined;
        this.awareServerInHole = false;
    
        // The shape
        var shape = new b2CircleShape();
        this.radius = 0.3;
        shape.set_m_radius(0.3);
        
        // Create a static body definition
        this.bodydef = new b2BodyDef();
        this.bodydef.set_type(b2_dynamicBody);
        this.bodydef.set_position(this.start_pos);
        this.bodydef.set_userData(index);
    
        // Create the body itself
        this.body = world.CreateBody(this.bodydef);
    
        // Create the fixture
        var fix = new b2FixtureDef();
        fix.set_shape(shape);
        fix.set_density(10);
        fix.set_friction(0);
        fix.set_restitution(1); // Force restante après rebond
        //fix.filter.maskBits = 0x0002;
        // Add fixture to the body
        this.body.CreateFixture(fix);
        this.body.SetAngularDamping(100000); // La balle tourne sur elle même
        this.body.SetLinearDamping(1); // Friction de base
        this.x = this.body.GetPosition().x;
        this.y = this.body.GetPosition().y;
    }

    isColliding(hole){
        const FORCE = 25;
        const BALL_FALLING_SPEED = 7.5
        if(this.collide != false){
            var addedCoef = 1;
            var velocity = this.body.GetLinearVelocity().Length();
            if(velocity <= BALL_FALLING_SPEED){
                this.body.SetLinearDamping(10);
            }
            var x = this.collide.GetPosition().x-this.x;
            var y = this.collide.GetPosition().y-this.y;
            this.body.ApplyLinearImpulse(new b2Vec2(x*FORCE, y*FORCE), true);
            //this.body.SetLinearVelocity()
            this.isInHole= true;
        }
    }
}
