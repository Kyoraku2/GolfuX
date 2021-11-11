class Level{
    constructor(){
        //this.map = world.CreateBody(new b2BodyDef());
        this.walls=[];
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