const { all } = require("express/lib/application");
const Ball = require('./ball.js');
const Hole = require('./hole.js');
const Level = require('./level.js');
var Box2D = require('./build/Box2D_v2.2.1_min.js');

class GolfuxServer{
    constructor(){
        this.balls = [];
        this.level = new Level(11);
        //this.level.createFromJSON('level1');
        addEventListener(this.balls,this.level);
    }

    /*changeLevel(level) {
        if(world != null){
            Box2D.destroy(world);
        }
        world = new Box2D.b2World( new Box2D.b2Vec2(0.0, 0.0) );
        world.SetDebugDraw(myDebugDraw);
        this.balls = [];
        this.level = new Level(level);
        this.level.createFromJSON('level'+level)
        addEventListener(this.balls,this.level);
    }*/
}
/*
const BUBBLEGUM_LINEAR_DAMPLING = 18;
const SAND_LINEAR_DAMPLING = 8;
const ICE_LINEAR_DAMPLING = 0.6;
var allStopped;
var w_width = 24;
var w_height = 32;
*/
function addEventListener(balls, level){
    var listener = new Box2D.JSContactListener();
    listener.BeginContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var idA = bodyA.GetUserData();
        var idB = bodyB.GetUserData();
        if((idA >= 0 && idA < 99 && idB >= 100 && idB < 199) || (idA < 199 && idA >= 100 && idB < 99 && idB >= 0)){
            if(idA >= 0 && idA<99){
                balls[idA].collide = bodyB;
            }else{
                balls[idB].collide = bodyA;
            }
        }

        if((idA >= 0 && idA < 99 && idB>=200 && idB <=299) || (idA >= 200 && idA <= 299 && idB >= 0 && idB <= 99)){
            if(idA >= 0 && idA<99){
                switch(idB){
                    case 200:
                        balls[idA].body.SetLinearDamping(SAND_LINEAR_DAMPLING);
                        break;
                    case 201:
                        balls[idA].body.SetLinearDamping(BUBBLEGUM_LINEAR_DAMPLING);
                        break;
                    case 202:
                        setTimeout(function(body,start){
                            body.SetTransform(start,0);
                        },0,balls[idA].body,balls[idA].start_pos);
                        balls[idA].body.SetLinearVelocity(0);
                        break;
                    case 203:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyB==e.enter.body || bodyB == e.exit.body;
                        },bodyB);
                        if(taken.entered){
                            taken.entered = false;
                            return;
                        }
                        taken.entered = true;
                        var impulse = {
                            x:balls[idA].body.GetLinearVelocity().x,
                            y:balls[idA].body.GetLinearVelocity().y,
                        }
                        if(taken.enter.body == bodyA){
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.exit_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idA].body,taken,impulse);
                        }else{
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.enter_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction2, portal.direction1);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idA].body,taken,impulse);
                        }
                        break;
                    case 204:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyB==e.enter.body;
                        },bodyB);
                        if(taken == undefined){
                            return;
                        }
                        var impulse = {
                            x:balls[idA].body.GetLinearVelocity().x,
                            y:balls[idA].body.GetLinearVelocity().y,
                        }
                        setTimeout(function(body,portal,impulse){
                            body.SetTransform(portal.exit_pos,0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                            body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                        },0,balls[idA].body,taken,impulse);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyB==e.body;
                        },bodyB);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = balls[idA].body;
                        break;
                    case 207:
                        balls[idA].body.SetLinearDamping(ICE_LINEAR_DAMPLING);
                        break;
                    case 208:
                        setTimeout(function(body,lastPos){
                            body.SetTransform(new b2Vec2(lastPos.x,lastPos.y),0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            body.SetAngularVelocity(0);
                        },0,balls[idA].body,balls[idA].lastPos);
                    break;
                }
            }else{
                switch(idA){
                    case 200:
                        balls[idB].body.SetLinearDamping(SAND_LINEAR_DAMPLING);
                        break;
                    case 201:
                        balls[idB].body.SetLinearDamping(BUBBLEGUM_LINEAR_DAMPLING);
                        break;
                    case 202:
                        setTimeout(function(body,start){
                            body.SetTransform(start,0);
                        },0,balls[idB].body,balls[idB].start_pos); 
                        balls[idB].body.SetLinearVelocity(0); 
                        break;
                    case 203:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyA==e.enter.body || bodyA == e.exit.body;
                        },bodyA);
                        if(taken.entered){
                            taken.entered = false;
                            return;
                        }
                        taken.entered = true;
                        var impulse = {
                            x:balls[idB].body.GetLinearVelocity().x,
                            y:balls[idB].body.GetLinearVelocity().y,
                        }
                        if(taken.enter.body == bodyA){
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.exit_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idB].body,taken,impulse);
                        }else{
                            setTimeout(function(body,portal,impulse){
                                body.SetTransform(portal.enter_pos,0);
                                body.SetLinearVelocity(new b2Vec2(0,0));
                                impulse = portalNormalForce(impulse,portal.direction2, portal.direction1);
                                body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                            },0,balls[idB].body,taken,impulse);
                        }
                        break;
                    case 204:
                        var taken = level.obstacles['portal'].find(function(e){
                            return bodyA==e.enter.body;
                        },bodyA);
                        if(taken == undefined){
                            return;
                        }
                        var impulse = {
                            x:balls[idB].body.GetLinearVelocity().x,
                            y:balls[idB].body.GetLinearVelocity().y,
                        }
                        setTimeout(function(body,portal,impulse){
                            body.SetTransform(portal.exit_pos,0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            impulse = portalNormalForce(impulse,portal.direction1, portal.direction2);
                            body.ApplyLinearImpulse(new b2Vec2(impulse.x, impulse.y),true);
                        },0,balls[idB].body,taken,impulse);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyA==e.body;
                        },bodyA);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = balls[idB].body;
                        break;
                    case 207:
                        balls[idB].body.SetLinearDamping(ICE_LINEAR_DAMPLING);
                        break;
                    case 208:
                        setTimeout(function(body,lastPos){
                            body.SetTransform(new b2Vec2(lastPos.x,lastPos.y),0);
                            body.SetLinearVelocity(new b2Vec2(0,0));
                            body.SetAngularVelocity(0);
                        },0,balls[idB].body,balls[idB].lastPos);
                    break;
                }
            }
        }
    }

    // Empty implementations for unused methods.
    listener.EndContact = function(contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var bodyA = fixtureA.GetBody();
        var bodyB = fixtureB.GetBody();
        var idA = bodyA.GetUserData();
        var idB = bodyB.GetUserData();
        if((idA >= 0 && idA < 99 && idB >= 100 && idB < 199) || (idA < 199 && idA >= 100 && idB < 99 && idB >= 0)){
            if(idA >= 0 && idA<99){
                balls[idA].collide = false;
                balls[idA].isInHole = false;

                balls[idA].body.SetLinearDamping(1);
                balls[idA].body.GetFixtureList().SetSensor(false);
            }else{
                balls[idB].collide = false;
                balls[idB].isInHole = false;
                balls[idB].body.SetLinearDamping(1);
                balls[idB].body.GetFixtureList().SetSensor(false);
            }
        }

        if((idA >= 0 && idA < 99 && idB>=200 && idB <=299) || (idA >= 200 && idA <= 299 && idB >= 0 && idB <= 99)){
            if(idA >= 0 && idA<99){
                switch(idB){
                    case 201:
                    case 200:
                    case 207:
                        balls[idA].body.SetLinearDamping(1);
                        break;
                    case 205:

                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyB==e.body;
                        },bodyB);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = undefined;
                        break;
                }
            }else{
                switch(idA){
                    case 201:
                    case 200:
                    case 207:
                        balls[idB].body.SetLinearDamping(1);
                        break;
                    case 205:
                        var wind = level.obstacles['wind'].find(function(e){
                            return bodyA==e.body;
                        },bodyA);
                        if(wind == undefined){
                            return;
                        }
                        wind.enter = undefined;
                        break;
                }
            }
        }
    };
    listener.PreSolve = function(contactPtr) {
    };
    listener.PostSolve = function(contactPtr) {
    };
    if(!world){
        return;
    }
    world.SetContactListener(listener);
}
/*

GolfuxServer.prototype.shoot = function(impulsion,index) {
    this.balls[index].ApplyLinearImpulse(new b2Vec2(impulsion.x,impulsion.y),0);
}

GolfuxServer.prototype.placeBall = function(pos,index) {
    this.balls[index] = new Ball(new b2Vec2(pos.x,pos.y),index);
}

GolfuxServer.prototype.step = function(game){
    if(this.level.holes.length === 0){
        return;
    }
    var endLevel = true;

    // Wind
    if(this.level.obstacles["wind"].length>0){
        for(var i=0,l=this.level.obstacles["wind"].length;i<l;++i){
            if(this.level.obstacles["wind"][i].enter){
                this.level.obstacles["wind"][i].enter.ApplyLinearImpulse(new b2Vec2(this.level.obstacles["wind"][i].direction.x*this.level.obstacles["wind"][i].acceleration, this.level.obstacles["wind"][i].direction.y*this.level.obstacles["wind"][i].acceleration), true);
            }
        }
    }

    // Balls
    allStopped = (this.balls.length !== 0);
    for(ball of this.balls){
        if(ball){
            ball.x=ball.body.GetPosition().x;
            ball.y=ball.body.GetPosition().y;
            for(hole of this.level.holes){
                ball.isColliding(hole);
            }
    
            if(ball.body.GetLinearVelocity().Length()<1){ // Limite ici
                ball.isMoving = false;
            }else{
                ball.isMoving = true;
            }
            if(ball.body.GetLinearVelocity().Length() !== 0){
                allStopped = false;
            }

            if(!ball.isInHole || ball.isMoving){
                endLevel = false;
            }else{
                ball.body.GetFixtureList().SetSensor(true);
            }
        }else{
            endLevel = false;
        }
    }

    if(this.balls.length < game.nbPlayers){
        endLevel = false;
    }

    if(endLevel && this.balls.length !=0 && playType != 2){
        return;
    }

    if(allStopped && game.joueurs[game.current].shot && endLevel){
        var allPos = [];
        for(ball of this.balls){
            allPos.push({
                pos:{
                        x:ball.body.GetPosition().x,
                        y:ball.body.GetPosition().y
                    },
                index:ball.dataIndex
            });
        }
        for(player of game.joueurs){
            player.socket.emit("ballShotFinalPos",allPos);
        }
    }
}*/

function portalNormalForce(impulse,dirEnter,dirExit){
    switch(dirEnter){
        case "N":
            switch(dirExit){
                case "N":
                    impulse.y*=-1;
                    break;
                case "E":
                    var tmp = impulse.x;
                    impulse.x = -impulse.y;
                    impulse.y = tmp;
                    break;
                case "W":
                    var tmp = impulse.x;
                    impulse.x = impulse.y;
                    impulse.y = tmp;
                    break;
            }
        case "S":
            switch(dirExit){
                case "S":
                    impulse.y*=-1;
                    break;
                case "E":
                    var tmp = impulse.x;
                    impulse.x = impulse.y;
                    impulse.y = tmp;
                    break;
                case "W":
                    var tmp = impulse.x;
                    impulse.x = -impulse.y;
                    impulse.y = tmp;
                    break;
            }
            break;
        case "E":
            switch(dirExit){
                case "S":
                    var tmp = impulse.y;
                    impulse.y = -impulse.x
                    impulse.x = tmp;
                    break;
                case "N":
                    var tmp = impulse.y;
                    impulse.y = impulse.x
                    impulse.x = tmp;
                    break;
                case "E":
                    impulse.x *= -impulse.x;
                    break;
            }
            break;
        case "W":
            switch(dirExit){
                case "S":
                    var tmp = impulse.y;
                    impulse.y = impulse.x
                    impulse.x = tmp;
                    break;
                case "N":
                    var tmp = impulse.y;
                    impulse.y = -impulse.x
                    impulse.x = tmp;
                    break;
                case "W":
                    impulse.x *= -impulse.x;
                    break;
            }
            break;
    }
    return impulse;
}

module.exports = GolfuxServer;
