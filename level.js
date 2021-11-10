class Level{
    constructor(){
        //this.map = world.CreateBody(new b2BodyDef());
        this.walls=[];
    }

    createWall(startx,starty,vec,startpos){
        var wall_shape = new b2PolygonShape();
        var wall = new b2BodyDef();
        wall.set_type(b2_staticBody);
        wall.set_position(startpos);
        var body_wall = world.CreateBody(wall);
        wall_shape.SetAsBox(startx, starty,vec, 0);
        body_wall.CreateFixture(wall_shape,0);
        this.walls.push(body_wall);
    }



    initBasicWalls() {
        this.createWall(9.25, 0.25,new b2Vec2(0, 0),new b2Vec2(9.5,0)); // Bas
        this.createWall(9.25, 0.25,new b2Vec2(0, 0),new b2Vec2(9.5, 24)); // Haut
        this.createWall(0.25, 12.25,new b2Vec2(0, 0),new b2Vec2(0, 12)); // Gauche 
        this.createWall(0.25, 12.25,new b2Vec2(0, 0),new b2Vec2(19, 12)); // Droite

        console.log(this.walls[0]);
        console.log(this.walls[1]);
        console.log(this.walls[2]);
        console.log(this.walls[3]);
        /*// Bas
        shape.SetAsBox(9.25, 0.25,new b2Vec2(9.5, 0), 0);
        this.walls.push(this.map.CreateFixture(shape, 0.0));

        // Haut
        shape.SetAsBox(9.25, 0.25,new b2Vec2(9.5, 24), 0);
        this.walls.push(this.map.CreateFixture(shape, 0.0));

        // Gauche
        shape.SetAsBox(0.25, 12.25,new b2Vec2(0, 12), 0);
        this.walls.push(this.map.CreateFixture(shape, 0.0));

        // Droite
        shape.SetAsBox(0.25, 12.25,new b2Vec2(19, 12), 0);
        this.walls.push(this.map.CreateFixture(shape, 0.0));


        console.log(this.walls[0].GetBody());
        console.log(this.walls[1].GetBody());
        console.log(this.walls[2].GetBody());
        console.log(this.walls[3].GetBody());*/
        /*// Bas
        shape0.Set(new b2Vec2(0,0),new b2Vec2(19,0))
        this.walls.push(this.map.CreateFixture(shape0, 0.0));
        // Droite 
        shape0.Set(new b2Vec2(19,0),new b2Vec2(19,24))
        this.walls.push(this.map.CreateFixture(shape0, 0.0));
        // Gauche
        shape0.Set(new b2Vec2(0,0),new b2Vec2(0,24));
        this.walls.push(this.map.CreateFixture(shape0, 0.0));
        // Haut
        shape0.Set(new b2Vec2(0,24), new b2Vec2(19, 24));
        this.walls.push(this.map.CreateFixture(shape0, 0.0));*/
    }

    test(){
        this.createWall(5, 0.25,new b2Vec2(0, 0),new b2Vec2(10, 12));
    }
}