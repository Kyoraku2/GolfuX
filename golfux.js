var bd;
var golfux = function() {
    //constructor
}

golfux.prototype.setNiceViewCenter = function() {
    //called once when the user changes to this test from another test
    PTM = 32;
    setViewCenterWorld( new b2Vec2(0,5), true );
}

golfux.prototype.setup = function() {
    {
        var map = world.CreateBody(new b2BodyDef());

        var shapeWall1 = new b2EdgeShape();
        shapeWall1.Set(new b2Vec2(10.0,0.0),new b2Vec2(10.0,10.0))

        var shapeWall2 = new b2EdgeShape();
        shapeWall2.Set(new b2Vec2(-9.0,0.0),new b2Vec2(-9.0,10.0))

        var shape2 = new b2EdgeShape();
        shape2.Set( new b2Vec2(-9.0,10.0),new b2Vec2(10.0,10.0));

        var shape = new b2EdgeShape();
        shape.Set(new b2Vec2(-9.0, 0.0), new b2Vec2(10.0, 0.0));

        map.CreateFixture(shape, 10.0);
        map.CreateFixture(shape2,0.0);
        map.CreateFixture(shapeWall1,0.0);
        map.CreateFixture(shapeWall2,0.0);
    }

    {
        var a = 0.5;
        var shape = new b2PolygonShape();
        shape.SetAsBox(a, a);

        var x = new b2Vec2(-7.5, 0.75);
        var y = new b2Vec2();

        bd = new b2BodyDef();
        // bd.set_type( b2_dynamicBody );
        bd.set_type( Module.b2_dynamicBody );
        y = copyVec2(x);
        bd.set_position(y);  
        bd.Body = undefined;                      
        bd.Body = world.CreateBody(bd).CreateFixture(shape, 5.0);

        // - Create the Physics
        // The shape
        var shape = new b2CircleShape();
        shape.set_m_radius( 24/2 / 12 );

        // Create a static body definition
        var bodydef = new b2BodyDef();
        bodydef.set_type( b2_dynamicBody );
        bodydef.set_position( new b2Vec2( 0, 0 ) );

        // Create the body itself
        var body = world.CreateBody( bodydef );

        // Create the fixture
        var fix = new b2FixtureDef();
        fix.set_shape( shape );
        fix.set_density( 1 );
        fix.set_friction( 2 );
        fix.set_restitution( 0.3 );

        // Add fixture to the body
        body.CreateFixture( fix );
        body.SetAngularDamping( 0.9 );
        body.SetLinearDamping( 0.25 );

        bd.Body = body;

    }
}

golfux.prototype.step = function() {
    //this function will be called at the beginning of every time step
}

golfux.prototype.onKeyDown = function(canvas, evt) {
    if ( evt.keyCode == 65 ) { // 'a'
        var wind = new b2Vec2(200,0.0);
        console.log(bd);
        
        bd.Body.ApplyLinearImpulse( new b2Vec2( 0, 10 ) );
    }
}

golfux.prototype.onKeyUp = function(canvas, evt) {
    if ( evt.keyCode == 65 ) { // 'a'
        //do something when the 'a' key is released
    }
}

    BuildPhysics = function() {
        // - Create the Physics
        // The shape
        var shape = new MINIGOLF.Physics.Box2D.b2CircleShape();
        shape.set_m_radius( 24/2 / this.Scale );

        // Create a static body definition
        var bodydef = new MINIGOLF.Physics.Box2D.b2BodyDef();
        bodydef.set_type( MINIGOLF.Physics.Box2D.b2_dynamicBody );
        bodydef.set_position( new MINIGOLF.Physics.Box2D.b2Vec2( 0, 0 ) );

        // Create the body itself
        var body = this.World.CreateBody( bodydef );

        // Create the fixture
        var fix = new MINIGOLF.Physics.Box2D.b2FixtureDef();
        fix.set_shape( shape );
        fix.set_density( 1 );
        fix.set_friction( 2 );
        fix.set_restitution( 0.3 );

        // Add fixture to the body
        body.CreateFixture( fix );
        body.SetAngularDamping( 0.9 );
        body.SetLinearDamping( 0.25 );

        this.Body = body;
    }


