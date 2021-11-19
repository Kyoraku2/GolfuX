class Ball{
    constructor(){
        this.bodydef=null;
        this.body=null;
        this.start_pos=new b2Vec2(9.5,1);
        this.view=null;
        this.sprite=new Image();
        this.collide = false;
        this.sand = false;
        this.sprite.src = './textures/ball.png';
    
        // The shape
        var shape = new b2CircleShape();
        shape.set_m_radius(0.3);
        
        // Create a static body definition
        this.bodydef = new b2BodyDef();
        this.bodydef.set_type(b2_dynamicBody);
        this.bodydef.set_position(this.start_pos);
        this.bodydef.set_userData(1);
    
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
        if(this.collide){
            var x = hole.getPos().x-this.x;
            var y = hole.getPos().y-this.y;
            this.body.ApplyLinearImpulse(new b2Vec2(x, y), true);
        }
    }

    isOnSand(){
        if(this.sand){
            var sand_ratio = 0.3; // TODO : mettre en var const
            this.body.ApplyLinearImpulse(new b2Vec2(-this.body.GetLinearVelocity().x*sand_ratio,-this.body.GetLinearVelocity().y*sand_ratio), true);
        }
    }

}
