class Level{
    constructor(){
        //this.map = world.CreateBody(new b2BodyDef());
        this.walls=[];
        this.hole = null;
    }

    createHole(radius, middle_pos){
        var shape = new b2CircleShape();
        shape.set_m_radius(radius);
        //this.view = new createjs.Bitmap("./textures/ball.png");
        //this.view.regX=this.view.regY=50;
        
        // Create a static body definition
        var holeDef  = new b2BodyDef();
        holeDef.set_type(b2_dynamicBody);
        holeDef.set_position(middle_pos);
    
        // Create the body itself
        var bodyDef = world.CreateBody(holeDef);
    
        // Create the fixture
        var fix = new b2FixtureDef();
        fix.set_shape(shape);
        fix.set_density(10);
        fix.set_friction(0);
        fix.set_restitution(1); // Force restante après rebond
        
        fix.isSensor = true;
        // Add fixture to the body
        bodyDef.CreateFixture(fix);
        bodyDef.SetAngularDamping(100000); // La balle tourne sur elle même
        bodyDef.SetLinearDamping(1); // Friction de base

        this.hole

    }

    createWall(hx,hy,middle_pos){
        var wall_shape = new b2PolygonShape();
        var wall = new b2BodyDef();
        wall.set_type(b2_staticBody);
        wall.set_position(middle_pos);
        var body_wall = world.CreateBody(wall);
        wall_shape.SetAsBox(hx, hy);
        body_wall.CreateFixture(wall_shape, 0);
        this.walls.push({wall:body_wall,hx:hx,hy:hy});
    }



    initBasicWalls() {
        this.createWall(9.25, 0.25, new b2Vec2(9.5,0)); // Bas
        this.createWall(9.25, 0.25, new b2Vec2(9.5, 24)); // Haut
        this.createWall(0.25, 12.25, new b2Vec2(0, 12)); // Gauche 
        this.createWall(0.25, 12.25, new b2Vec2(19, 12)); // Droite

        console.log(this.walls[0]);
        console.log(this.walls[1]);
        console.log(this.walls[2]);
        console.log(this.walls[3]);
    }

    test(){
        this.createWall(5, 0.25,new b2Vec2(10, 12));
    }
}