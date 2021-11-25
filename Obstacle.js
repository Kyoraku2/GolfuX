class Obstacle{
    constructor(middle_pos,shape,userdata,isstatic,issensor){ // Constructeur
        // other attribute
        this.middle_pos=middle_pos;
        this.static = isstatic;
        // bodydef
        this.bodydef = new b2BodyDef();
        this.bodydef.set_userData(userdata);
        this.bodydef.set_position(this.middle_pos);
        if(isstatic){
            this.bodydef.set_type(b2_staticBody);
        }else{
            this.bodydef.set_type(b2_dynamicBody);
        }
        // body
        this.body = world.CreateBody(this.bodydef);
        this.body.CreateFixture(this.fix);
        // fixture
        this.fix = new b2FixtureDef();
        this.fix.isSensor=issensor;
        this.fix.set_shape(this.shape);
        if(shape==="polygon" || shape==="box"){
            this.shape = new b2PolygonShape();
        }else{
            if(shape==="circle"){
                this.shape = new b2CircleShape();
            }  
        }
    }

    constructorBox(middle_pos,hx,hy,userdata,isstatic,issensor){ // Constructor box
        this(middle_pos,"box",userdata,isstatic,issensor);
        this.type = "box";
        this.hx=hx;
        this.hy=hy;
        this.shape.SetAsBox(this.hx, this.hy);

    }

    constructorPolygon(middle_pos,hx,hy,userdata,isstatic,issensor){ // Constructor polygon
        this(middle_pos,"polygon",userdata,isstatic,issensor);
        // TODO
        this.type = "polygon";
        this.hx=hx;
        this.hy=hy;
    }

    constructorCirle(middle_pos,radius,userdata,isstatic,issensor){ // Constructor cercle
        this(middle_pos,"circle",userdata,isstatic,issensor);
        // à check
        this.type = "circle";
        this.radius=radius;
        this.shape.set_m_radius(this.radius);
    }
}