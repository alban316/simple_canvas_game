// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var monster = {};
var monstersCaught = 0;
var mazeTileSize = 60;
var mazeDimY = 12; //yields 12:9 is a 4:3 ratio
var mazeDimX = 9;


// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = mazeDimX * mazeTileSize;
canvas.height = mazeDimY * mazeTileSize;
document.body.appendChild(canvas);

// Background tiles
var drawMaze = function() {
	
	for (x=0; x < mazeDimX; x++){
		for(y=0; y < mazeDimY; y++){
			//indicate when starting drawing a rectangle
			ctx.beginPath();
			ctx.rect(x * mazeTileSize, y * mazeTileSize, x * mazeDimX + mazeTileSize, y * mazeDimY + mazeTileSize);

			//fill the rectangle with the selected color
			//alternate colors in a checkerboard
			if ((x % 2)^(y %2)) {
				ctx.fillStyle = "#aaaaaa";
			}
			else {
				ctx.fillStyle = "#bbbbbb";
			}
	  
			ctx.fill();

			//indicating when finished drawing the rectangle
			ctx.closePath();
		}
	}	
}


// Pellets
var pelletReady = false;
var pelletImage = new Image();
pelletImage.onload = function() {
	pelletReady = true;
};
pelletImage.src = "images/monster.png";


// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";


// Flame image
var flameReady = false;
var flameImage = new Image();
flameImage.onload = function () {
	flameReady = true;
}
flameImage.src = "images/flame.gif";



// Monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
	monsterReady = true;
};
monsterImage.src = "images/monster.png";



// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a monster
var reset = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;

	// Throw the monster somewhere on the screen randomly
	monster.x = 32 + (Math.random() * (canvas.width - 64));
	monster.y = 32 + (Math.random() * (canvas.height - 64));
};

// Update game objects
var update = function (modifier) {
	if (38 in keysDown) { // Player holding up
		hero.y -= hero.speed * modifier;
	}
	if (40 in keysDown) { // Player holding down
		hero.y += hero.speed * modifier;
	}
	if (37 in keysDown) { // Player holding left
		hero.x -= hero.speed * modifier;
	}
	if (39 in keysDown) { // Player holding right
		hero.x += hero.speed * modifier;
	}

	// Are they touching?
	if (
		hero.x <= (monster.x + 32)
		&& monster.x <= (hero.x + 32)
		&& hero.y <= (monster.y + 32)
		&& monster.y <= (hero.y + 32)
	) {
		++monstersCaught;
		reset();
	}
};

// Draw everything
var render = function () {
	/*
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}
	*/
	drawMaze();
	
	if (flameReady) {
		ctx.drawImage(flameImage, 15, 15, 30, 30);
	}
	
	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (monsterReady) {
		ctx.drawImage(monsterImage, monster.x, monster.y);
	}

	/*
	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
	*/
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
reset();
main();


/*
REFERENCES:
http://www.williammalone.com/articles/create-html5-canvas-javascript-sprite-animation/
https://ccrgeek.wordpress.com/graphics/character-sprites/

*/



/* SAMPLE CODE

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
*/