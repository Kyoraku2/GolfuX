class Level{
    constructor(){
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
        this.hole = null;
    }

    createHole(radius, middle_pos){
        this.hole = new Hole();
        this.hole.setPos(middle_pos);
        this.hole.setRadius(radius);
        this.hole.createHole();
    }

    createWall(middle_pos,shape,isstatic,hx,hy,radius,vectrices){
        this.obstacles["walls"].push(new Wall(middle_pos,shape,isstatic,hx,hy,radius,vectrices));
    }

    createBumper(middle_pos,shape,isstatic,hx,hy,radius,vectrices){
        this.obstacles["bumper"].push(new Wall(middle_pos,shape,isstatic,hx,hy,radius,vectrices));
    }

    createWind(middle_pos,hx,hy,acceleration,direction){
        this.obstacles["wind"].push(new Wind(middle_pos,hx,hy,acceleration,direction));
    }

    initBasicWalls() {
        this.createWall(new b2Vec2(9.5,0), 'box', true, 9.25, 0.25, -1, -1); // Bas
        this.createWall(new b2Vec2(9.5, 24), 'box', true, 9.25, 0.25, -1, -1); // Haut
        this.createWall(new b2Vec2(0, 12), 'box', true, 0.25, 12.25, -1, -1); // Gauche 
        this.createWall(new b2Vec2(19, 12), 'box', true, 0.25, 12.25, -1, -1); // Droite
        this.createWall(new b2Vec2(10, 12), 'box', true, 4.25, 0.25, -1, -1); // Centre
        this.createBumper(new b2Vec2(10, 6), 'circle', true, -1, -1, 1, -1);
        this.createSand(new b2Vec2(3, 14), 'box', 3, 2,-1,-1);
        this.createBubblegum(new b2Vec2(16, 10), 'box', 3, 2,-1,-1);
        this.createVoid(new b2Vec2(9.5, 11), 'box', 3.5, 1,-1,-1);
        this.createPortal(new b2Vec2(0.4, 18),new b2Vec2(18.6, 18),true,0.1,1,0.1,1);
        this.createWind(new b2Vec2(10, 3), 1, 1, 1.3, new b2Vec2(0.5, 0.5));
    }

    createSand(middle_pos,shape,hx,hy,radius,vectrices){
        this.obstacles["sand"].push(new Sand(middle_pos,shape,hx,hy,radius,vectrices));
    }

    createIce(middle_pos,shape,hx,hy,radius,vectrices){
        this.obstacles["sand"].push(new Ice(middle_pos,shape,hx,hy,radius,vectrices));
    }

    createBubblegum(middle_pos,shape,hx,hy,radius,vectrices){
        this.obstacles["bubblegum"].push(new Bubblegum(middle_pos,shape,hx,hy,radius,vectrices));
    }

    createVoid(middle_pos,shape,hx,hy,radius,vectrices){
        this.obstacles["void"].push(new Void(middle_pos,shape,hx,hy,radius,vectrices));
    }

    createWater(middle_pos,shape,hx,hy,radius,vectrices){
        this.obstacles["water"].push(new Water(middle_pos,shape,hx,hy,radius,vectrices));
    }

    createPortal(enter_pos,exit_pos,bidirectional,hx1,hy1,hx2,hy2){
        if(!bidirectional){
            this.obstacles["portal"].push(new UniDirectionPortal(enter_pos,exit_pos,hx1,hy1,hx2,hy2));
        }else{
            this.obstacles["portal"].push(new BiDirectionPortal(enter_pos,exit_pos,hx1,hy1,hx2,hy2));
        }
    }

    createSpawn(middle_pos,hx,hy){
        this.obstacles["spawn"].push(new SpawnArea(middle_pos,hx,hy));
    }

    async createFromJSON(level){
        var response = await fetch("/"+level);
        if (response.status == 200) {

            var data = await response.json();
            this.createHole(data.hole.radius,new b2Vec2(data.hole.pos.x,data.hole.pos.y));
            for(const [name,array] of Object.entries(data.obstacles)){
                array.forEach(object => {
                    switch(name){
                        case "wall":
                            this.createWall(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.isstatic, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                        case "sand":
                            this.createSand(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                        case "bubblegum":
                            this.createBubblegum(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                        case "void":
                            this.createVoid(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                        case "bumper":
                            this.createBumper(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.isstatic, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                        case "portal":
                            this.createPortal(new b2Vec2(object.enter_pos.x, object.enter_pos.y), new b2Vec2(object.exit_pos.x, object.exit_pos.y), object.bidirectional, object.hx1, object.hy1, object.hx2, object.hy2);
                        break;
                        case "wind":
                            this.createWind(new b2Vec2(object.middle_pos.x, object.middle_pos.y), object.hx, object.hy, object.acceleration, new b2Vec2(object.direction.x, object.direction.y));
                        break;
                        case "spawn":
                            this.createSpawn(new b2Vec2(object.middle_pos.x, object.middle_pos.y), object.hx, object.hy);
                        break;
                        case 'ice':
                            this.createIce(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                        case 'water':
                            this.createWater(new b2Vec2(object.middle_pos.x,object.middle_pos.y), object.shape, object.hx, object.hy, object.radius, object.vectrices);
                        break;
                    }
                        
                });
                
            }
        }
    }

    /*randomLevel(){

    }*/
    
}
