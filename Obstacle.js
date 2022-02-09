class Obstacle{
    constructor(middle_pos,shape,userdata,isstatic,issensor,hx,hy,radius,vectrices,angle){ // Constructeur
        // other attribute
        this.middle_pos=middle_pos;
        this.static = isstatic;
        // shape 
        switch(shape){
            case "polygon":
                this.type = "polygon";
                this.vectrices = [];
                for(var i=0, l=vectrices.length ; i<l ; ++i){
                    this.vectrices.push(new b2Vec2(vectrices[i].x, vectrices[i].y));
                }
                this.shape = createPolygonShape(this.vectrices);
                break;
            case "circle":
                this.shape = new b2CircleShape();
                this.type = "circle";
                this.radius=radius;
                this.shape.set_m_radius(this.radius);
                break;
            case "box":
                this.shape = new b2PolygonShape();
                this.type = "box";
                this.hx=hx;
                this.hy=hy;
                if(angle !== -1){
                    this.angle = angle;
                    this.shape.SetAsBox(this.hx, this.hy, this.middle_pos, this.angle); 
                }else{
                    this.shape.SetAsBox(this.hx, this.hy);
                }
                break;
        }
        // bodydef
        this.bodydef = new b2BodyDef();
        this.bodydef.set_userData(userdata);
        if(this.angle === undefined){
            this.bodydef.set_position(this.middle_pos);
        }
        
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
}


class FloorObstacle extends Obstacle{
    constructor(middle_pos,shape,userdata,hx,hy,radius,vectrices,angle){
        switch(shape){
            case "polygon":
                super(middle_pos,shape,userdata,true,true,-1,-1,-1,vectrices); 
                break;
            case "circle":
                super(middle_pos,shape,userdata,true,true,-1,-1,radius,-1); 
                break;
            case "box":
                super(middle_pos,shape,userdata,true,true,hx,hy,-1,-1,angle);  
                break;
        }
    }
}

class SolidObstacle extends Obstacle{
    constructor(middle_pos,shape,userdata,isstatic,hx,hy,radius,vectrices,angle){
        switch(shape){
            case "polygon":
                super(middle_pos,shape,userdata,isstatic,false,-1,-1,-1,vectrices);  
                break;
            case "circle":
                super(middle_pos,shape,userdata,isstatic,false,-1,-1,radius,-1); 
                break;
            case "box":
                super(middle_pos,shape,userdata,isstatic,false,hx,hy,-1,-1,angle);     
                break;
        }
    }
}

class Wall extends SolidObstacle{
    constructor(middle_pos,shape,isstatic,hx,hy,radius,vectrices,angle){
        super(middle_pos,shape,9999,isstatic,hx,hy,radius,vectrices,angle);
        this.sprite=new Image();
        this.sprite.src = './textures/wall.jpg';
    }
}

class Bumper extends SolidObstacle{
    constructor(middle_pos,shape,isstatic,hx,hy,radius,vectrices){
        super(middle_pos,shape,9999,isstatic,hx,hy,radius,vectrices,-1);
        this.sprite=new Image();
        this.sprite.src = './textures/wall.jpg';
    }
}

class Sand extends FloorObstacle{
    constructor(middle_pos,shape,hx,hy,radius,vectrices,angle){
        super(middle_pos,shape,200,hx,hy,radius,vectrices,angle);
        this.sprite=new Image();
        this.sprite.src = './textures/sand.jpg';
    }
}

class Ice extends FloorObstacle{
    constructor(middle_pos,shape,hx,hy,radius,vectrices,angle){
        super(middle_pos,shape,207,hx,hy,radius,vectrices,angle);
        this.sprite=new Image();
        this.sprite.src = './textures/ice.jpg';
    }
}


class SpawnArea extends FloorObstacle{
    constructor(middle_pos,hx,hy){
        super(middle_pos,'box',206,hx,hy,-1,-1,-1);
    }
}

class Void extends FloorObstacle{
    constructor(middle_pos,shape,hx,hy,radius,vectrices,angle){
        super(middle_pos,shape,202,hx,hy,radius,vectrices,angle);
        this.sprite=new Image();
        this.sprite.src = './textures/void.jpg';
    }
}

class Water extends FloorObstacle{
    constructor(middle_pos,shape,hx,hy,radius,vectrices,angle){
        super(middle_pos,shape,208,hx,hy,radius,vectrices,angle);
        this.sprite=new Image();
        this.sprite.src = './textures/water.jpg';
    }
}

class Bubblegum extends FloorObstacle{
    constructor(middle_pos,shape,hx,hy,radius,vectrices,angle){
        super(middle_pos,shape,201,hx,hy,radius,vectrices,angle);
        this.sprite=new Image();
        this.sprite.src = './textures/bubblegum.jpg';
    }
}


class Wind extends FloorObstacle{
    constructor(middle_pos,hx,hy,acceleration,direction){
        super(middle_pos,"box",205,hx,hy,-1,-1,-1);
        this.direction = direction;
        this.acceleration = acceleration;
        this.enter = false;
        this.sprite=new Image();
        this.sprite.src = './textures/wind.png';
    }
}

class Portal{
    constructor(enter_pos,exit_pos,userdata,hx1,hy1,hx2,hy2,direction1,direction2){
        this.enter = new Obstacle(enter_pos,"box",userdata,true,true,hx1,hy1,-1,-1,-1); // 2O3
        this.exit = new Obstacle(exit_pos,"box",userdata,true,true,hx2,hy2,-1,-1,-1); // 2O3
        this.enter_pos = enter_pos;
        this.exit_pos = exit_pos;
        this.direction1 = direction1;
        this.direction2 = direction2;
        this.bidirectional = (userdata == 203);
    }
}

class BiDirectionPortal extends Portal{
    constructor(enter_pos,exit_pos,hx1,hy1,hx2,hy2,direction1,direction2){
        super(enter_pos,exit_pos,203,hx1,hy1,hx2,hy2,direction1,direction2);
        this.entered = false;
    }
}

class UniDirectionPortal extends Portal{
    constructor(enter_pos,exit_pos,hx1,hy1,hx2,hy2,direction1,direction2){
        super(enter_pos,exit_pos,204,hx1,hy1,hx2,hy2,direction1,direction2);
    }
}
