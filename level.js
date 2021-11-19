class Level{
    constructor(){
        this.walls=[];
        this.hole = null;
    }

    createHole(radius, middle_pos){
        this.hole = new Hole();
        this.hole.setPos(middle_pos);
        this.hole.setRadius(radius);
        this.hole.createHole();

    }

    createWall(hx,hy,middle_pos){
        this.walls.push(new Wall(hx,hy,middle_pos));
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

    createSand(hx,hy,middle_pos){
        var shape = new b2PolygonShape();
        shape.SetAsBox(hx, hy);
        var bodydef = new b2BodyDef();
        bodydef.set_type(b2_dynamicBody);
        bodydef.set_position(middle_pos);
        
        var body = world.CreateBody(bodydef);
        
        var fix = new b2FixtureDef();
        fix.set_shape(shape);
        fix.isSensor=true;
        fix.set_density(0);
        fix.set_friction(0);
        body.CreateFixture(fix);
        body.SetLinearDamping(100);
        // b2ContactListener
    }

    test(){
        //this.createWall(5, 0.25,new b2Vec2(10, 12));
        this.createSand(5, 5,new b2Vec2(10, 12));
    }
}