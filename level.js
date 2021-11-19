class Level{
    constructor(){
        this.obstacles=[];
        this.hole = null;
    }

    createHole(radius, middle_pos){
        this.hole = new Hole();
        this.hole.setPos(middle_pos);
        this.hole.setRadius(radius);
        this.hole.createHole();

    }

    createWall(hx,hy,middle_pos){
        this.obstacles.push(new Wall(hx,hy,middle_pos));
    }

    initBasicWalls() {
        this.createWall(9.25, 0.25, new b2Vec2(9.5,0)); // Bas
        this.createWall(9.25, 0.25, new b2Vec2(9.5, 24)); // Haut
        this.createWall(0.25, 12.25, new b2Vec2(0, 12)); // Gauche 
        this.createWall(0.25, 12.25, new b2Vec2(19, 12)); // Droite

        console.log(this.obstacles[0]);
        console.log(this.obstacles[1]);
        console.log(this.obstacles[2]);
        console.log(this.obstacles[3]);
    }

    createSand(hx,hy,middle_pos){
        this.obstacles.push(new Sand(hx, hy,middle_pos));
    }

    test(){
        //this.createWall(5, 0.25,new b2Vec2(10, 12));
        this.createSand(5, 5,new b2Vec2(10, 12));
    }
}