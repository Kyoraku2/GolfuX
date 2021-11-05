function Level(){
    this.map = world.CreateBody(new b2BodyDef());
    this.wall=[];
    var shape0 = new b2EdgeShape();
    var wall_fix = new b2FixtureDef();
    wall_fix.set_shape(shape0);
    wall_fix.set_density(100000);

    // Bas
    shape0.Set(new b2Vec2(0,0),new b2Vec2(19,0))
    this.wall.push(this.map.CreateFixture(shape0, 0.0));
    // Droite 
    shape0.Set(new b2Vec2(19,0),new b2Vec2(19,24))
    this.wall.push(this.map.CreateFixture(shape0, 0.0));
    // Gauche
    shape0.Set(new b2Vec2(0,0),new b2Vec2(0,24));
    this.wall.push(this.map.CreateFixture(shape0, 0.0));
    // Haut
    shape0.Set(new b2Vec2(0,24), new b2Vec2(19, 24));
    this.wall.push(this.map.CreateFixture(shape0, 0.0));
}