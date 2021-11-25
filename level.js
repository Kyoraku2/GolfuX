class Level{
    constructor(){
        this.obstacles={
            walls:[],
            sand:[],
            bubblegum:[],
            void:[]
        };
        this.hole = null;
    }

    createHole(radius, middle_pos){
        this.hole = new Hole();
        this.hole.setPos(middle_pos);
        this.hole.setRadius(radius);
        this.hole.createHole();
    }

    createWall(hx,hy,middle_pos){
        this.obstacles["walls"].push(new Wall(hx,hy,middle_pos));
    }

    initBasicWalls() {
        this.createWall(9.25, 0.25, new b2Vec2(9.5,0)); // Bas
        this.createWall(9.25, 0.25, new b2Vec2(9.5, 24)); // Haut
        this.createWall(0.25, 12.25, new b2Vec2(0, 12)); // Gauche 
        this.createWall(0.25, 12.25, new b2Vec2(19, 12)); // Droite
        this.createWall(4.25, 0.25,new b2Vec2(10, 12));
        this.createSand(3, 2,new b2Vec2(3, 12));
        this.createBubblegum(3, 2,new b2Vec2(16, 12));
        this.createVoid(3.5, 1,new b2Vec2(9.5, 11));
    }

    createSand(hx,hy,middle_pos){
        this.obstacles["sand"].push(new Sand(hx, hy,middle_pos));
    }

    createBubblegum(hx,hy,middle_pos){
        this.obstacles["bubblegum"].push(new Bubblegum(hx, hy,middle_pos));
    }

    createVoid(hx,hy,middle_pos){
        this.obstacles["void"].push(new Void(hx, hy,middle_pos,5));
    }
}