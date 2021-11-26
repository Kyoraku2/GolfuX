class Hole{
    constructor(){
        this.pos = null;
        this.radius = null;
        this.body = null;
        
    }

    setRadius(radius){
        this.radius = radius;
    }

    setPos(pos){
        this.pos = pos;
    }

    getPos(){
        return this.pos;
    }

    createHole(){
        var shape = new b2CircleShape();
        shape.set_m_radius(this.radius);
        
        // Create a static body definition
        var holeDef  = new b2BodyDef();
        holeDef.set_type(b2_staticBody);
        holeDef.set_position(this.pos);
        
        holeDef.userData = 100;
        // Create the body itself
        var bodyDef = world.CreateBody(holeDef);
        console.log(bodyDef);
        this.body = bodyDef;
        
    
        // Create the fixture
        var fix = new b2FixtureDef();
        fix.set_shape(shape);
        fix.set_density(10);
        fix.set_friction(0);
        fix.set_restitution(1); // Force restante après rebond
        
        fix.isSensor = true;
        // Add fixture to the body
        bodyDef.CreateFixture(fix);
        //bodyDef.SetAngularDamping(100000); // La balle tourne sur elle même
        //bodyDef.SetLinearDamping(1); // Friction de base

    }
}