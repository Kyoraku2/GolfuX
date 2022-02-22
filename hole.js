class Hole{
    constructor(userdata){
        this.pos = null;
        this.radius = null;
        this.body = null;
        this.dataIndex = userdata;

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

    createHole(worldServer = undefined){
        var shape = new b2CircleShape();
        shape.set_m_radius(this.radius);
        
        // Create a static body definition
        this.bodyDef  = new b2BodyDef();
        this.bodyDef.set_type(b2_staticBody);
        this.bodyDef.set_position(this.pos);
        
        this.bodyDef.userData = 100;
        // Create the body itself
        if(worldServer === undefined){
            this.body = world.CreateBody(this.bodydef);
        }else{
            this.body = worldServer.CreateBody(this.bodydef);
        }
        this.bodyDef.set_userData(this.dataIndex);
    
        // Create the fixture
        var fix = new b2FixtureDef();
        fix.set_shape(shape);
        fix.set_density(10);
        fix.set_friction(0);
        fix.set_restitution(1); // Force restante après rebond
        
        fix.isSensor = true;
        // Add fixture to the body
        this.body.CreateFixture(fix);
        //bodyDef.SetAngularDamping(100000); // La balle tourne sur elle même
        //bodyDef.SetLinearDamping(1); // Friction de base

    }
}

module.exports = Hole;