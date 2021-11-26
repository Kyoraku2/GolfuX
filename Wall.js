/*class Wall{
    constructor(hx,hy,middle_pos){
        this.sprite=new Image();
        this.sprite.src = './textures/wall.jpg';
        this.middle_pos=middle_pos;
        this.hy=hy;
        this.hx=hx;
        this.shape = new b2PolygonShape();
        this.bodydef = new b2BodyDef();
        this.bodydef.set_type(b2_staticBody);
        this.bodydef.set_position(middle_pos);
        this.body = world.CreateBody(this.bodydef);
        this.shape.SetAsBox(this.hx, this.hy);
        this.fixture = this.body.CreateFixture(this.shape, 0);
    }
}*/