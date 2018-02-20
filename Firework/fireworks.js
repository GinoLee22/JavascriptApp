// pre-setting of browsers
window.requestAnimFrame = ( function() {
	return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				function( callback ) {
					window.setTimeout( callback, 1000 / 60 );
				};
})();

// set basic variable for fireworks
var canvas = document.getElementById('myCanvas'),
	ctx = canvas.getContext('2d'),

	cw = window.innerWidth,
	ch = window.innerHeight,
	// firework/particle/word collection
	fireworks = [],
	particles = [],
	words = [],

	hue = 120,

	// when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
	limiterTotal = 2,
	limiterTick = 0,
	// this will time the auto lauches of fireworks, one lauch per 80 loop ticks
	timerTotal = 20,
	timerTick = 0,
	mousedown = false,
	// mouse x/y coordinate
	mx,
	my;

// set canvas dimensions
canvas.width = cw;
canvas.height = ch;
// ctx.lineWidth = 2,

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function calDst(p1x, p1y, p2x, p2y) {
	return Math.sqrt(Math.pow((p1x - p2x), 2) + Math.pow((p1y - p2y), 2));
}

// create word
function Word(wx, wy) {
	this.x = wx;
	this.y = wy;
	this.hue = random(hue - 50, hue + 50);
	this.radius = 1.5;
}

Word.prototype.draw = function() {
	ctx.beginPath();
	// move to last tracked coordinates in the set, then draw line to the current x and y
	// ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
	// ctx.lineTo(this.x, this.y);
	// ctx.moveTo(this.x, this.y);
	// ctx.lineTo(this.x + 1, this.y);
	// ctx.strokeStyle = "hsl(" + this.hue + ", 100%, " + this.brightness + "%)";
	ctx.lineWidth = 2;
	ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2 );
	ctx.fill();
	ctx.stroke();
}

// create firework
function Firework(sx, sy, tx, ty) {
	// actual coordiates
	this.x = sx;
	this.y = sy;
	// start coordinates
	this.sx = sx;
	this.sy = sy;
	// target coordinates
	this.tx = tx;
	this.ty = ty;
	// distance from start to target
	this.dstToTarget = calDst(sx, sy, tx,ty);
	this.dstTraveled = 0;
	// track the past coordinates offeach firework to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	// populate initial coordinate collection with the current coordinates
	while (this.coordinateCount) {
		this.coordinates.push([this.x, this.y]);
		this.coordinateCount--;
	}
	this.angle = Math.atan2(ty - sy, tx - sx);
	this.speed = 1.5;
	this.acceleration = 1.05;
	this.brightness = random(50, 70);
	// circle target indictor radius
	this.targetRadius = 1;
}

// update firework
Firework.prototype.update = function(index) {
	// remove last position in coordinate array & add current position
	this.coordinates.pop();
	this.coordinates.unshift([this.x, this.y]);

	// cycle the circle target indicator radius
	if (this.targetRadius < 8) {
		this.targetRadius += 0.3;
	} else {
		this.targetRadius = 1;
	}

	// speed up the firework
	this.speed *= this.acceleration;

	// get the curretn velocities based on angle and speed
	var vx = Math.cos(this.angle) * this.speed,
		vy = Math.sin(this.angle) * this.speed;
	// distance with this velocity
	this.dstTraveled = calDst(this.sx, this.sy, this.x + vx, this.y + vy);

	// if distance traveled >= the distance between start & target -> blast
	if (this.dstTraveled >= this.dstToTarget) {
		createParticles(this.tx, this.ty);
		// remove the fireworks
		fireworks.splice(index, 1);
	} else {			// target not reached
		this.x += vx;
		this.y += vy;
	}
}

// draw firework
Firework.prototype.draw = function() {
	// console.log(this.coordinates);
	// 1st: draw the firework
	ctx.beginPath();
	// move to last tracked coordinates in the set, then draw a line to the current x and y
	ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
	ctx.stroke();

	// 2nd: draw the target
	ctx.beginPath();
	// draw the target for this firework with a pulsing circle
	ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
	ctx.stroke();
}



// create particles
function Particle(x, y) {
	this.x = x;
	this.y = y;
	// track the past coordinates of each particle to crate a trail effect, increase the coordiate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	while (this.coordinateCount) {
		this.coordinates.push([this.x, this.y]);
		this.coordinateCount--;
	}
	// set a random angle in all possible directions, in radians
	this.angle = random(0, Math.PI * 2);
	this.speed = random(1, 10);
	// friction & gravity
	this.friction = 0.95;
	this.gravity = 1;
	// set hue
	this.hue = random(hue - 50, hue + 50);
	this.brightness = random(50, 80);
	this.alpha = 1;
	// set how fast the particle fade out
	this.decay = random(0.015, 0.03);
}

// update particle
Particle.prototype.update = function(index) {
	// remove last position in coordinate array & add current position
	this.coordinates.pop();
	this.coordinates.unshift([this.x, this.y]);
	// slow down the particle
	this.spped *= this.friction;
	this.x += Math.cos(this.angle) * this.speed;
	this.y += Math.sin(this.angle) * this.speed + this.gravity;
	// fade out the particle
	this.alpha -= this.decay;
	// remove the particel once the alpha is low enough based on the passed in index
	if (this.alpha <= this.decay) {
		particles.splice(index, 1);
	}
}

// draw particle
Particle.prototype.draw = function() {
	ctx.beginPath();
	// move to last tracked coordinates in the set, then draw line to the current x and y
	ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = "hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
	ctx.stroke();
}

function createParticles(x, y) {
	var particleCnt = 30;
	while (particleCnt) {
		particles.push(new Particle(x, y));
		particleCnt--;
	}
}

// main demo loop
// this function will run endlessly with requestAnimationFrame
function loop() {
	// below part should be reviewed later to understand the inner mechanism there
	// this function will run endlessly with requestAnimationFrame
	requestAnimFrame( loop );
	
	// increase the hue to get different colored fireworks over time
	//hue += 0.5;
  
  	// create random color
  	hue = random(0, 360 );
	
	// normally, clearRect() would be used to clear the canvas
	// we want to create a trailing effect though
	// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
	ctx.globalCompositeOperation = 'destination-out';
	// decrease the alpha property to create more prominent trails
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fillRect( 0, 0, cw, ch );
	// change the composite operation back to our main mode
	// lighter creates bright highlight points as the fireworks and particles overlap each other
	ctx.globalCompositeOperation = 'lighter';

	// loop over each firework / particles / words, draw it, update it
	for (var i = fireworks.length - 1; i >= 0; i--) {
		fireworks[i].draw();
		fireworks[i].update(i);
	}
	
	for (var i = 0; i < particles.length; i++) {
		particles[i].draw();
		particles[i].update(i);
	}

	for (var i = 0; i < words.length; i++) {
		words[i].draw();
	}

	// launch fireworks automatically to random coordinates, when the mouse isn't down
	if (timerTick >= timerTotal) {
		// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
		if (!mousedown) {
			fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
			timerTick = 0;
		}
	} else {
		timerTick++;
	}
	
	// limit the rate at which fireworks get launched when mouse is down
	if( limiterTick >= limiterTotal ) {
		if(mousedown) {
			// start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
			fireworks.push(new Firework(cw / 2, ch, mx, my));
			limiterTick = 0;
			// add the clicking point
			words.push(new Word(mx, my))
		}
	} else {
		limiterTick++;
	}
}

window.onload = loop;

// mouse event bindings
// update the mouse coordinates on mousemove
canvas.addEventListener("mousemove", function(event) {
	mx = event.pageX - canvas.offsetLeft;
	my = event.pageY - canvas.offsetTop;
	console.log(mx);
	console.log(my);
});

canvas.addEventListener("mousedown", function(event) {
	event.preventDefault();
	mousedown = true;
});

canvas.addEventListener("mouseup", function(event) {
	event.preventDefault();
	mousedown = false;
});


// canvas.addEventListener( 'mousemove', function( e ) {
// 	mx = e.pageX - canvas.offsetLeft;
// 	my = e.pageY - canvas.offsetTop;
// });

// // toggle mousedown state and prevent canvas from being selected
// canvas.addEventListener( 'mousedown', function( e ) {
// 	e.preventDefault();
// 	mousedown = true;
// });

// canvas.addEventListener( 'mouseup', function( e ) {
// 	e.preventDefault();
// 	mousedown = false;
// });

// set words
// var h1 = document.querySelector("h1")
// window.setTimeout(function(){
// 		h1.innerHTML = '2';
// 	}, 1000)
// window.setTimeout(function(){
// 		h1.innerHTML = '1';
// 	}, 2000)

// window.setTimeout(function(){
// 		// h1.innerHTML = "祝本命年！<br> 身体健康！<br>好运多多!";
// 		h1.innerHTML = "同志们，<br> 狗年大吉啊！！！"
// 	}, 3000)

// window.setTimeout(
// 	function(){
// 		$("h1").fadeOut("slow");
// 	}, 6000);










