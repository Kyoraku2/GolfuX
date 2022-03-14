class Level{
    constructor(num){
        this.obstacles={
            walls:[],
            sand:[],
            bubblegum:[],
            void:[],
            bumper:[],
            portal:[],
            wind:[],
            spawn:[],
            ice:[],
            water:[]
        };
        this.rendered = false;
        this.holes = [];
        this.num = num;
        this.backgroundColor = null;
    }

    createHole(radius, middle_pos){
        var hole = new Hole(100+this.holes.length);
        hole.setPos(middle_pos);
        hole.setRadius(radius);
        hole.createHole();
        this.holes.push(hole);
    }

    createWall(middle_pos,shape,hx,hy,radius,vectrices,angle){
        this.obstacles["walls"].push(new Wall(middle_pos,shape,true,hx,hy,radius,vectrices,angle));
    }

    createBumper(middle_pos,shape,isstatic,hx,hy,radius,vectrices){
        this.obstacles["bumper"].push(new Wall(middle_pos,shape,isstatic,hx,hy,radius,vectrices));
    }

    createWind(middle_pos,hx,hy,acceleration,direction){
        this.obstacles["wind"].push(new Wind(middle_pos,hx,hy,acceleration,direction));
    }

    createSand(middle_pos,shape,hx,hy,radius,vectrices,angle){
        this.obstacles["sand"].push(new Sand(middle_pos,shape,hx,hy,radius,vectrices,angle));
    }

    createIce(middle_pos,shape,hx,hy,radius,vectrices,angle){
        this.obstacles["ice"].push(new Ice(middle_pos,shape,hx,hy,radius,vectrices,angle));
    }

    createBubblegum(middle_pos,shape,hx,hy,radius,vectrices,angle){
        this.obstacles["bubblegum"].push(new Bubblegum(middle_pos,shape,hx,hy,radius,vectrices,angle));
    }

    createVoid(middle_pos,shape,hx,hy,radius,vectrices,angle){
        this.obstacles["void"].push(new Void(middle_pos,shape,hx,hy,radius,vectrices,angle));
    }

    createWater(middle_pos,shape,hx,hy,radius,vectrices,angle){
        this.obstacles["water"].push(new Water(middle_pos,shape,hx,hy,radius,vectrices,angle));
    }

    createPortal(enter_pos,exit_pos,bidirectional,hx1,hy1,hx2,hy2,direction1,direction2){
        if(!bidirectional){
            this.obstacles["portal"].push(new UniDirectionPortal(enter_pos,exit_pos,hx1,hy1,hx2,hy2,direction1,direction2));
        }else{
            this.obstacles["portal"].push(new BiDirectionPortal(enter_pos,exit_pos,hx1,hy1,hx2,hy2,direction1,direction2));
        }
    }

    createSpawn(middle_pos,hx,hy){
        this.obstacles["spawn"].push(new SpawnArea(middle_pos,hx,hy));
    }

    async createFromJSON(level,solo){
        if(solo){
            var response = await fetch("/levels/solo/"+level+".json");
        }else{
            var response = await fetch("/levels/multi/"+level+".json");
        }
        if (response.status == 200) {

            var data = await response.json();
            this.backgroundColor = data.backgroundColor;
            for(const object of data.holes){
                this.createHole(object.radius,new b2Vec2(object.pos.x,object.pos.y));
            }
            for(const [name,array] of Object.entries(data.obstacles)){
                array.forEach(object => {
                    var radius = (object.shape == "circle") ? object.radius : -1;
                    var vectrices = (object.shape == "polygon") ? object.vectrices : -1;
                    var angle = (object.shape == "box") ? object.angle : 0;
                    var width = (object.shape == "box" || name == "spawn" || name == "wind") ? object.heightWidth.width : 0;
                    var height = (object.shape == "box" || name == "spawn" || name == "wind") ? object.heightWidth.height : 0;
                    switch(name){ //this["create"+X]() || Destructuring
                        case "bumper":
                            this.createBumper(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.isstatic, width, height, object.radius, object.vectrices);
                        break;
                        case "portal":
                            this.createPortal(new b2Vec2(object.enter_pos.x, object.enter_pos.y), new b2Vec2(object.exit_pos.x, object.exit_pos.y), object.bidirectional, object.hx1, object.hy1, object.hx2, object.hy2, object.direction1, object.direction2);
                        break;
                        case "wind":
                            this.createWind(new b2Vec2(object.middle_pos.x, object.middle_pos.y), width, height, object.acceleration, new b2Vec2(object.direction.x, object.direction.y));
                        break;
                        case "spawn":
                            this.createSpawn(new b2Vec2(object.middle_pos.x, object.middle_pos.y), width, height);
                        break;
                        default:
                            this["create"+name.charAt(0).toUpperCase()+name.slice(1)](new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, width, height, radius, vectrices, angle);
                        break;
                    }
                        
                });
                
            }
        }
    }

    /*randomLevel(){

    }*/
    
}
