class Obstacle{
    constructor(middle_pos,shape,userdata,isstatic,issensor,hx,hy,radius,vectrices){ // Constructeur
        console.log(middle_pos,shape,userdata,isstatic,issensor,hx,hy,radius,vectrices);
        // other attribute
        this.middle_pos=middle_pos;
        this.static = isstatic;
        // shape 
        if(shape==="polygon"){
            this.shape = new b2PolygonShape();
            // TODO
        }else{
            if(shape==="circle"){
                this.shape = new b2CircleShape();
                // à check
                this.type = "circle";
                this.radius=radius;
                this.shape.set_m_radius(this.radius);
            }else{
                if(shape==="box"){
                    this.shape = new b2PolygonShape();
                    this.type = "box";
                    this.hx=hx;
                    this.hy=hy;
                    this.shape.SetAsBox(this.hx, this.hy);
                }
            }
        }
        // bodydef
        this.bodydef = new b2BodyDef();
        this.bodydef.set_userData(userdata);
        this.bodydef.set_position(this.middle_pos);
        if(isstatic){
            this.bodydef.set_type(b2_staticBody);
        }else{
            this.bodydef.set_type(b2_dynamicBody);
        }
        // fixture
        this.fix = new b2FixtureDef();
        this.fix.isSensor=issensor;
        this.fix.set_shape(this.shape);
 
        // body
        this.body = world.CreateBody(this.bodydef);
        this.body.CreateFixture(this.fix);
    }

    /*class Sand{
    constructor(hx,hy,middle_pos){
        this.shape = new b2PolygonShape();
        this.shape.SetAsBox(this.hx, this.hy);
        this.bodydef = new b2BodyDef();
        this.bodydef.set_type(b2_staticBody);
        this.bodydef.set_position(this.middle_pos);
        this. bodydef.set_userData(3);
        
        this.body = world.CreateBody(this.bodydef);
        
        this.fix = new b2FixtureDef();
        this.fix.set_shape(this.shape);
        this.fix.isSensor=true;
        this.body.CreateFixture(this.fix);
    }
}*/
}


class FloorObstacle extends Obstacle{
    constructor(middle_pos,shape,userdata,hx,hy,radius,vectrices){
        if(shape==="polygon"){
            super(middle_pos,shape,userdata,true,true,-1,-1,-1,vectrices);   
        }else{
            if(shape==="circle"){
                super(middle_pos,shape,userdata,true,true,-1,-1,radius,-1);   
            }else{
                if(shape==="box"){
                    super(middle_pos,shape,userdata,true,true,hx,hy,-1,-1);           
                }
            }
        }
    }
}

class SolidObstacle extends Obstacle{
    constructor(middle_pos,shape,userdata,isstatic,hx,hy,radius,vectrices){
        if(shape==="polygon"){
            super(middle_pos,shape,userdata,isstatic,false,-1,-1,-1,vectrices);   
        }else{
            if(shape==="circle"){
                super(middle_pos,shape,userdata,isstatic,false,-1,-1,radius,-1);   
            }else{
                if(shape==="box"){
                    super(middle_pos,shape,userdata,isstatic,false,hx,hy,-1,-1);           
                }
            }
        }
    }
}

class Wall extends SolidObstacle{
    constructor(middle_pos,shape,userdata,isstatic,hx,hy,radius,vectrices){
        super(middle_pos,shape,userdata,isstatic,hx,hy,radius,vectrices);
        this.sprite=new Image();
        this.sprite.src = './textures/wall.jpg';
    }
}

class Bumper extends SolidObstacle{
    constructor(middle_pos,shape,userdata,isstatic,hx,hy,radius,vectrices){
        super(middle_pos,shape,userdata,isstatic,hx,hy,radius,vectrices);
        this.sprite=new Image();
        this.sprite.src = '';
    }
}

class Sand extends FloorObstacle{
    constructor(middle_pos,shape,userdata,hx,hy,radius,vectrices){
        super(middle_pos,shape,userdata,hx,hy,radius,vectrices);
        this.sprite=new Image();
        this.sprite.src = './textures/sand.jpg';
    }
}

class Void extends FloorObstacle{
    constructor(middle_pos,shape,userdata,hx,hy,radius,vectrices){
        super(middle_pos,shape,userdata,hx,hy,radius,vectrices);
        this.sprite=new Image();
        this.sprite.src = './textures/void.jpg';
    }
}

class Bubblegum extends FloorObstacle{
    constructor(middle_pos,shape,userdata,hx,hy,radius,vectrices){
        super(middle_pos,shape,userdata,hx,hy,radius,vectrices);
        this.sprite=new Image();
        this.sprite.src = './textures/bubblegum.jpg';
    }
}