// Game objects
var monster = {};
var mazeTileSize = 60;
var mazeDimY = 10; //yields 12:9 is a 4:3 ratio
var mazeDimX = 8;
var mazeDark = "#484848";
var mazeLight = "#888888";
var itemSize = 30;
var monsterSize = 45;
var heroSize = 40;
var itemPadding = 15;
var candy = [];
var maxFlames = 4;
var maxGhosts = 3;
var ghostSpeed = 1;
var maxDiagonalDistance = Math.sqrt(Math.pow(mazeDimY * mazeTileSize,2) + Math.pow(mazeDimX * mazeTileSize,2));
var gameOver = true;
var youWin = false;
var blinkOn = true;
var blinkSpeed = 15;
var elapsed = 0;
var hero = {
    speed: 256, // movement in pixels per second
    xbound: mazeDimX * mazeTileSize - heroSize,
    ybound: mazeDimY * mazeTileSize - heroSize
};

var xcenter = Math.round((mazeDimX * mazeTileSize) / 2);
var ycenter = Math.round((mazeDimY * mazeTileSize) / 2);

//flame x,y given in terms of grid squares
var flameInstance = [
    {"dx":0, "dy":0, "isLit":true}, //upper left (0)
    {"dx":mazeDimX - 1, "dy":0, "isLit":true}, //upper right (1)
    {"dx":0, "dy":mazeDimY - 1, "isLit":true}, //lower left (2)
    {"dx":mazeDimX - 1, "dy":mazeDimY - 1, "isLit":true} // lower right (3)
];

//ghost x,y given in actual pixels
var ghostDefault = [
    {"dx":(mazeDimX / 4) * mazeTileSize, "dy":(mazeDimY / 4) * mazeTileSize}, //upper left
    {"dx":(mazeDimX / 4) * 3 * mazeTileSize, "dy":(mazeDimY / 4) * 3 * mazeTileSize}, //lower right
    {"dx":(mazeDimX / 4) * 3 * mazeTileSize, "dy":(mazeDimY / 4) * mazeTileSize}, //upper right
    {"dx":(mazeDimX / 4) * mazeTileSize, "dy":(mazeDimY / 4) * 3 * mazeTileSize} // lower left
];
var ghostInstance = [
    {"dx":ghostDefault[0].dx, "dy":ghostDefault[0].dy, "isLeft":false, "goingTo":-1}, 
    {"dx":ghostDefault[1].dx, "dy":ghostDefault[1].dy, "isLeft":true, "goingTo":-1},
    {"dx":ghostDefault[2].dx, "dy":ghostDefault[2].dy, "isLeft":true, "goingTo":-1},
    {"dx":ghostDefault[3].dx, "dy":ghostDefault[3].dy, "isLeft":false, "goingTo":-1}    
];

// level difficulty settings
var gameLevel = 0;
var gameLevelStats = [
    {"numGhosts":1, "ghostSpeed":1}, //lev 0
    {"numGhosts":2, "ghostSpeed":1}, //1
    {"numGhosts":2, "ghostSpeed":1.5}, //2
    {"numGhosts":3, "ghostSpeed":1}, //3
    {"numGhosts":3, "ghostSpeed":1.5}  //4
    // increment speed by 1 for each level hereafter...
];

// init game
var initGame = function () {
    hero.x = canvas.width / 2;
    hero.y = canvas.height / 2;
    
    if (gameLevel <= 4) {
        maxGhosts = gameLevelStats[gameLevel].numGhosts;
        ghostSpeed = gameLevelStats[gameLevel].ghostSpeed;
    }
    
    else {
        maxGhosts = gameLevelStats[4].numGhosts;
        ghostSpeed = gameLevel - 2;
    }
	
    // init ghosts
    for (i=0; i< maxGhosts; i++) {
        ghostInstance[i].dx = ghostDefault[i].dx;
        ghostInstance[i].dy = ghostDefault[i].dy;
    }
    
    // init flames
    for (i=0; i < maxFlames; i++) {
        flameInstance[i].isLit = true;
    }
    
    initCandy();

};


// init candy;
var initCandy = function() {
    for (x=0; x < mazeDimX; x++){
        candy[x] = [];
        
        for(y=0; y < mazeDimY; y++){

            if (((x == 0) && (y == 0)) ||
               ((x == mazeDimX - 1) && (y == 0)) ||
               ((x == 0) && (y == mazeDimY - 1)) ||
               ((x == mazeDimX - 1) && (y == mazeDimY - 1)))
           
                candy[x][y] = false;
        
            else 
                candy[x][y] = true;
        }
    }
};


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = mazeDimX * mazeTileSize;
canvas.height = mazeDimY * mazeTileSize;
document.body.appendChild(canvas);


// spritesheet stuff
function sprite(options) {
    var that = {},
        frameIndex = 0,
        tickCount = 0,
        ticksPerFrame = options.ticksPerFrame || 0,
        numberOfFrames = options.numberOfFrames || 1;
    
    that.context = options.context;
    that.width = options.width;
    that.height = options.height;
    that.image = options.image;

    that.update = function() {
        tickCount += 1;
        
        if (tickCount > ticksPerFrame) {
            tickCount = 0;
            
            if (frameIndex < numberOfFrames - 1)
                frameIndex += 1;
            else 
                frameIndex = 0;
        }
    };
    
    that.render = function(dx, dy, sz) {
        that.context.drawImage(
            that.image,
            frameIndex * that.width / numberOfFrames,
            0,
            that.width / numberOfFrames,
            that.height,
            dx,
            dy,
            sz,
            sz                     
        );
    };

    return that;
};

// followIdlePattern
var ghostIdle = function(gi) {
				
	var relx = 0;
    var rely = 0;			
	var minY = Math.round(mazeDimY / 3 * mazeTileSize);
	var minX = Math.round(mazeDimX / 3 * mazeTileSize);				
	var maxY = Math.round(mazeDimY / 3 * mazeTileSize * 2);
	var maxX = Math.round(mazeDimX / 3 * mazeTileSize * 2);
	var midY = Math.round(mazeDimY / 2 * mazeTileSize);
	var midX = Math.round(mazeDimX / 2 * mazeTileSize);
	var dx = ghostInstance[gi].dx;
	var dy = ghostInstance[gi].dy;
	
	if (dy < midY && dx >= midX) {// upper right
		// move right & down
		if (dy < maxY)
			rely = 1;
		
		if (dx < maxX)
			relx = 1;
		
	} else if (dy >= midY && dx >= midX) {// lower right
		// move down & left
		if (dy < maxY)
			rely = 1;
		
		if (dx > minX)
			relx = -1;
	
	} else if (dy >= midY && dx < midX) { //lower left
		// move left & up
		if (dy > minY)
			rely = -1;
		
		if (dx > minX)
			relx = -1;
	
	} else if (dy < midY && dx < midX) { //upper left
		// move right & up
		if (dy > minY)
			rely = -1;
		
		if (dx < maxX)
			relx = 1;
	}
						
	if (relx > 0)
        ghostInstance[gi].isLeft = false;
    else 
        ghostInstance[gi].isLeft = true;

    ghostInstance[gi].dx += Math.round(relx * ghostSpeed);
    ghostInstance[gi].dy += Math.round(rely * ghostSpeed);
};


// actionAI
var actionAI = function(gi) {
    /*
     * Question: which lit lamp is closest to me, and how do I get there?
     * 
     */
    var shortDistance = maxDiagonalDistance;
    var nearestFlame = -1;
    var relx = 0;
    var rely = 0;
    
    for (f=0; f < maxFlames; f++) {
        // convert flame grid coords to pixel coords
        var flamePx = [];
        flamePx.dx = flameInstance[f].dx * mazeTileSize + itemPadding;
        flamePx.dy = flameInstance[f].dy * mazeTileSize + itemPadding;

        // compute distance a la: a^2 + b^2 = c^2 !!!!!
        var xdist = Math.abs(ghostInstance[gi].dx - flamePx.dx);
        var ydist = Math.abs(ghostInstance[gi].dy - flamePx.dy);
        var mydist = Math.sqrt(Math.pow(xdist,2) + Math.pow(ydist,2));

        // collision?
        if (mydist < itemSize) {
            flameInstance[f].isLit = false;
			ghostInstance[gi].goingTo = -1;
            
			
            if (!flameInstance[0].isLit &&
                !flameInstance[1].isLit &&
                !flameInstance[2].isLit &&
                !flameInstance[3].isLit)
            
                gameOver = true;
			
        }

        // is this the shortest distance so far & is it lit?
        if ((mydist < shortDistance) && (flameInstance[f].isLit)) {
            
            // is anybody else already closer to this lamp than than me??
            var somebodyElseCloser = false;
            
            // check each other ghost
            for (g = 0; g < maxGhosts; g++) {
                if (gi !== g) {
                    xdist = Math.abs(ghostInstance[g].dx - flamePx.dx);
                    ydist = Math.abs(ghostInstance[g].dy - flamePx.dy);
                    var hisdist = Math.sqrt(Math.pow(xdist,2) + Math.pow(ydist,2));
                    
					// compare distances AND whether or not he is already going to a lamp
                    //if ((hisdist < mydist) && (!ghostInstance[g].isEngaged)) {
					if ((hisdist < mydist) && ghostInstance[g].goingTo == f){
					
                        somebodyElseCloser = true;
                    }
                }
            }
            
            // if nobody is closer, then I'll go here
            if (!somebodyElseCloser) {
				ghostInstance[gi].goingTo = f;
                shortDistance = mydist;
                nearestFlame = f;  
                
                if (flamePx.dx < ghostInstance[gi].dx) 
                    relx = -1;
                else if (flamePx.dx > ghostInstance[gi].dx)
                    relx = 1;

                if (flamePx.dy < ghostInstance[gi].dy)
                    rely = -1;
                else if (flamePx.dy > ghostInstance[gi].dy)
                    rely = 1;
            }
			
			else { // I have nothing to do, so I'll follow idle pattern
				ghostInstance[gi].goingTo = -1;

			} // ...if nobody's closer than me
					
        } // ...if this is closest & it's lit
    
    } // ...for each lamp flame

	if (ghostInstance[gi].goingTo == -1)
		ghostIdle(gi);
	
	else {
		if (relx > 0)
			ghostInstance[gi].isLeft = false;
		else 
			ghostInstance[gi].isLeft = true;

    ghostInstance[gi].dx += Math.round(relx * ghostSpeed);
    ghostInstance[gi].dy += Math.round(rely * ghostSpeed);
	}

};


// Background tiles
var drawMaze = function() {
    var candyCount = 0;
    
    for (x=0; x < mazeDimX; x++){
        for(y=0; y < mazeDimY; y++){
            //indicate when starting drawing a rectangle
            ctx.beginPath();
            
            ctx.strokeStyle = "#000000";
            ctx.strokeRect(x * mazeTileSize, y * mazeTileSize, x * mazeDimX + mazeTileSize, y * mazeDimY + mazeTileSize);
            
            ctx.rect(x * mazeTileSize, y * mazeTileSize, x * mazeDimX + mazeTileSize, y * mazeDimY + mazeTileSize);
            
            // determine which quadrant we are in 
            if (y >= mazeDimY / 2)
                quadrant = 2;
            else 
                quadrant = 0;
            
            if (x >= mazeDimX / 2)
                quadrant += 1;
            
            // if flame in this quadrant is lit, color accordingly
            if (flameInstance[quadrant].isLit)
                ctx.fillStyle = mazeLight;
            else 
                ctx.fillStyle = mazeDark;
            

            ctx.fill();
            
            //draw candy while we're here
            if (candyReady) {
                if (candy[x][y]) {
                    ctx.drawImage(candyImage, x * mazeTileSize + itemPadding, y * mazeTileSize + itemPadding, itemSize, itemSize);  
                    candyCount++;
                } 
            }           

            //indicating when finished drawing the rectangle
            ctx.closePath();
        } // ...inner loop
    } // ...outer loop
    
    if (candyReady && candyCount == 0)
        youWin = true;
};


// flame image
var flameReady = false;
var flameImage = new Image();
flameImage.onload = function () {
    flameReady = true;
};
flameImage.src = "images/flamesheet.png";


// brazier image
var brazierReady = false;
var brazierImage = new Image();
brazierImage.onload = function () {
    brazierReady = true;
};
brazierImage.src = "images/brazier.png";


// flame sprite
var flame = sprite({
    context: ctx,
    width: 2000,
    height: 200,
    image: flameImage,
    ticksPerFrame: 10,
    numberOfFrames: 10
});

// monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/ghostsheet.png";

// ghost sprite
var ghost = sprite({
    context: ctx,
    width: 800,
    height: 200,
    image: monsterImage,
    ticksPerFrame: 25,
    numberOfFrames: 4
});

// left monster image
var leftMonsterReady = false;
var leftMonsterImage = new Image();
leftMonsterImage.onload = function () {
	leftMonsterReady = true;
};
leftMonsterImage.src = "images/leftghostsheet.png";


// left ghost sprite
var leftGhost = sprite({
    context: ctx,
    width: 800,
    height: 200,
    image: leftMonsterImage,
    ticksPerFrame: 25,
    numberOfFrames: 4
});


// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/pumpkinsheet.png";


// hero sprite
var heroPumpkin = sprite({
    context: ctx,
    width: 800,
    height: 200,
    image: heroImage,
    ticksPerFrame: 15,
    numberOfFrames: 4
});


// candy image
var candyReady = false;
var candyImage = new Image();
candyImage.onload = function () {
    initCandy();
    candyReady = true;
};
candyImage.src = "images/candy.png";


// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);



// Update game objects
var update = function (modifier) {
    elapsed++; //what is this? ticks or seconds????
    
    var rely = 0;
    var relx = 0;
    // get player input
    if (38 in keysDown) { // Player holding up
        rely = -1;  
    }
    if (40 in keysDown) { // Player holding down
        rely = 1;            
    }
    if (37 in keysDown) { // Player holding left
        relx = -1;         
    }
    if (39 in keysDown) { // Player holding right
        relx = 1;        
    }
    
    // start new game
    if (32 in keysDown && gameOver) {
        gameLevel = 0;
        initGame();
        gameOver = false;
    }
    
    if (youWin) {
        gameLevel++;
        initGame();
        youWin = false;
    }
    
    if (!gameOver) {        
        hero.y += Math.round(rely * hero.speed * modifier);
        hero.x += Math.round(relx * hero.speed * modifier);
        
        if (hero.x < 0) 
            hero.x = 0;
        
        else if (hero.x > hero.xbound)
            hero.x = hero.xbound;
        
        if (hero.y < 0)
            hero.y = 0;
        
        else if (hero.y > hero.ybound)
            hero.y = hero.ybound;
        
        // check if hero has activated lamp
        // assumes 4 lamps, one in each corner
        if (hero.x < mazeTileSize && hero.y < mazeTileSize)
            flameInstance[0].isLit = true;

        else if (hero.x > (mazeDimX - 1) * mazeTileSize && hero.y < mazeTileSize)
            flameInstance[1].isLit = true;

        else if (hero.x < mazeTileSize && hero.y > (mazeDimY - 1) * mazeTileSize)
            flameInstance[2].isLit = true;

        else if (hero.x > (mazeDimX - 1) * mazeTileSize && hero.y > (mazeDimY - 1) * mazeTileSize)
            flameInstance[3].isLit = true;

        // picked up a candy?
        // which grid square am I in?
        var x = Math.round(hero.x / mazeTileSize);
        var y = Math.round(hero.y / mazeTileSize);
        if (candyReady)
            if (candy[x][y])
                candy[x][y] = false;
    } // ...if NOT game over

};

// Draw everything
var render = function () {

    // draw maze (and candy) 
    drawMaze(); 

    // draw flames
    if (flameReady && brazierReady) {
        for (i = 0; i < maxFlames; i++) {
            // draw brazier first
            ctx.drawImage(brazierImage, flameInstance[i].dx * mazeTileSize + itemPadding, flameInstance[i].dy * mazeTileSize + itemPadding * 1.5, itemSize, itemSize);

            // now flame, if lit
            if (flameInstance[i].isLit) {
                flame.render(flameInstance[i].dx * mazeTileSize + itemPadding, flameInstance[i].dy * mazeTileSize + itemPadding * .5, itemSize);
                flame.update();   
            }
        }
    }

    if (heroReady) {
        //ctx.drawImage(heroImage, hero.x, hero.y, heroSize, heroSize);
        heroPumpkin.render(hero.x, hero.y, heroSize, heroSize);
        heroPumpkin.update();
    }

    if (monsterReady && leftMonsterReady) {
        for (i = 0; i < maxGhosts; i++) {
            actionAI(i);
            
            if (ghostInstance[i].isLeft) {
                leftGhost.render(ghostInstance[i].dx, ghostInstance[i].dy, monsterSize);
                leftGhost.update();
            }
            else {
                ghost.render(ghostInstance[i].dx, ghostInstance[i].dy, monsterSize);
                ghost.update();                
            }
        }
    }

    if (gameOver) {
        ctx.fillStyle = "rgb(250, 250, 250)";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        
        ctx.fillText("Use Arrows To Move", xcenter, ycenter + 32 * -2);
        ctx.fillText("Collect All The Candy To Win", xcenter, ycenter + 32 * -1);
        ctx.fillText("Ghosts Will Put Out Lamps", xcenter, ycenter + 32 * 0);
        ctx.fillText("Touch Lamps to Relight", xcenter, ycenter + 32 * 1);
        ctx.fillText("If All Lamps Go Out, You Lose", xcenter, ycenter + 32 * 2);
        
        if (blinkOn) {
            ctx.fillText("GAME OVER", xcenter, ycenter + 32 * -4);        
            ctx.fillText("PRESS SPACE", xcenter, ycenter + 32 * 4);
        }
        
        if (elapsed > blinkSpeed) {
            blinkOn = !blinkOn;
            elapsed = 0;
        }
    }


    // ctx.fillStyle = "rgb(250, 250, 250)";
    // ctx.font = "24px Helvetica";
    // ctx.textAlign = "left";
    // ctx.textBaseline = "top";
	// ctx.fillText("Ghost 0:" + ghostInstance[0].goingTo + " Loc:" + ghostInstance[0].dx + "," + ghostInstance[0].dy, 32, 32);
	// ctx.fillText("Ghost 1:" + ghostInstance[1].goingTo + " Loc:" + ghostInstance[1].dx + "," + ghostInstance[1].dy, 32, 64);
	// ctx.fillText("Ghost 2:" + ghostInstance[2].goingTo + " Loc:" + ghostInstance[2].dx + "," + ghostInstance[2].dy, 32, 96);
	// ctx.fillText("Ghost 3:" + ghostInstance[3].goingTo + " Loc:" + ghostInstance[3].dx + "," + ghostInstance[3].dy, 32, 128);	
	//	ctx.fillText("Level:" + gameLevel, 32, 32);
//    ctx.fillText("Dimensions(x,y): " + mazeDimX * mazeTileSize + "," + mazeDimY * mazeTileSize, 32, 64);
//    ctx.fillText("Elapsed:" + elapsed, 32, 32);

};

// The main game loop
var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    requestAnimationFrame(main);

};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
//reset();
initGame();
main();


/*
REFERENCES:
http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
https://ccrgeek.wordpress.com/graphics/character-sprites/

*/



/* SAMPLE CODE

// Pellets
var pelletReady = false;
var pelletImage = new Image();
pelletImage.onload = function() {
	pelletReady = true;
};
pelletImage.src = "images/monster.png";


// how to use concat
//myText = myText.concat(x, ",", y, "(", x % 2, ",", y % 2, "); ");
//myText = myText.concat(x, ",", y, "(", x % 2, ",", y % 2, ")[", (x % 2)^(y %2), "]; ");


// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

//draw a white border for the rectangle
//ctx.strokeStyle = "#000000";
//ctx.stroke();

// ctx.fillStyle = "#000000";
// ctx.font = "16px Helvetica";
// ctx.textAlign = "left";
// ctx.textBaseline = "top";
// ctx.fillText(myText, 32, 32);
            
// Flame image
var flameReady = false;
var flameImage = new Image();
flameImage.onload = function () {
	flameReady = true;
};
flameImage.src = "images/flame.gif"; 
            
//	if (flameReady) {
//		ctx.drawImage(flameImage, itemPadding, itemPadding, itemSize, itemSize);
//	}
    
    

// Score
ctx.fillStyle = "rgb(250, 250, 250)";
ctx.font = "24px Helvetica";
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);

if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
}

            //fill the rectangle with the selected color
            //alternate colors in a checkerboard
//            if ((x % 2)^(y %2)) {
//                    ctx.fillStyle = "#aaaaaa";
//            }
//            else {
//                    ctx.fillStyle = "#bbbbbb";
//            }
*/