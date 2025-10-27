const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const keys = {};
const gravity = 0.2;
const maxFall = 6;
let jumpCooldown = 0;
const playerImage = new Image();
playerImage.src = 'player.png';
const barrelImage = new Image();
barrelImage.src = 'barrel.png';
const bgMusic = new Audio('soundtrack.mp3')
bgMusic.loop = true;
bgMusic.volume = 0.7;

const player = {
	x: 50,
	y: HEIGHT - 50, 
	w: 24,
	h: 24,
	vx: 0,
	vy: 0,
	speed: 2,
	jumpPower: 5,
	onGround: false,
	color: '#d9d1e6',
};
const platforms = [];
let barrelTimer = 0;
const barrelInterval = 180;
const goal = {
	x: 580,
	y: 10,
	w: 40,
	h: 40,
	color: 'pink'
};
const goalImage = new Image();
goalImage.src = 'goal.png';
let gameOver = false;
function addPlatform(x, y, w, h, color = '#29293d') {
	platforms.push({ x, y, w, h, color });
}

addPlatform(0, HEIGHT - 20, 620, 20);
addPlatform(0, HEIGHT - 80, 130, 10);
addPlatform(200, HEIGHT - 130, 200,10);
addPlatform(470, HEIGHT - 130, 200,10);
addPlatform(560, HEIGHT - 180, 80,10);
addPlatform(50, HEIGHT - 160, 80, 10);
addPlatform(120, HEIGHT - 240, 10, 80);
addPlatform(120, HEIGHT - 240, 400, 10);
addPlatform(00, HEIGHT - 300, 140, 10);
addPlatform(245, HEIGHT - 300, 140, 10);
addPlatform(500, HEIGHT - 300, 140, 10);
addPlatform(100, HEIGHT - 350, 100, 10);
addPlatform(160, HEIGHT - 400, 100, 10);
addPlatform(50, HEIGHT - 430, 650, 10);

const barrels = [];
function handleWin() {
	gameOver = true;
	ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	ctx.fillStyle = 'yellow';
	ctx.font = '32px Courier New';
	ctx.textAlign = 'center';
	ctx.fillText('You bested the beast!', WIDTH / 2, HEIGHT / 2);
}


function spawnBarrel(){
	const barrel = {
		x: 580,
		y: HEIGHT - 450,
		w: 16,
		h: 16,
		vx: 3,
		vy:0,
		color: 'white'
	};
	barrels.push(barrel);
}
spawnBarrel();

function updateBarrels(){
	barrels.forEach(barrel => {
		barrel.vy += gravity;
		if (barrel.vy > maxFall) barrel.vy = maxFall;
		barrel.x += barrel.vx;
		barrel.y += barrel.vy;
		platforms.forEach(p => {
			if (
				barrel.x + barrel.w > p.x &&
				barrel.x < p.x + p.w &&
				barrel.y + barrel.h > p.y &&
				barrel.y + barrel.h - barrel.vy <= p.y
			){
				barrel.y = p.y - barrel.h;
				barrel.vy = 0;
			}
		});
		if (barrel.x <= 0 || barrel.x + barrel.w >= WIDTH) {
			barrel.vx *= -1;
		}
		if (barrel.y > HEIGHT) {
			barrels.splice(barrels.indexOf(barrel), 1);
		}
	});
}

function handlePlayerHit(){
	console.log("Deathswiped!");
	player.x = 50;
	player.y = HEIGHT - 50;
	player.vx = 0;
	player.vy = 0;
}



window.addEventListener('keydown', (e) => {
	keys[e.key] = true;
	e.preventDefault();
});

window.addEventListener('keyup', (e) => {
	keys[e.key] = false;
	e.preventDefault();
});
window.addEventListener('keydown', () => {
	if (bgMusic.paused) {
		bgMusic.play().catch(e => console.log("Play"));
	}
});

function updatePlayer(){
	if (keys['ArrowLeft'] || keys['a']) player.vx = -player.speed;
	else if (keys['ArrowRight'] || keys['d']) player.vx = player.speed;
	else player.vx = 0;
	player.x += player.vx;
	player.vy += gravity;
	if ((keys['ArrowUp'] || keys['w'] || keys[' ']) && player.onGround && jumpCooldown <= 0){
		player.vy = -player.jumpPower;
		player.onGround = false;
		jumpCooldown = 10;
	}
	if (jumpCooldown > 0) jumpCooldown--;
	if (player.vy > maxFall) player.vy = maxFall;
	player.y += player.vy;
	player.onGround = false;
	platforms.forEach(p => {
		if (
		player.x + player.w > p.x &&
		player.x < p.x + p.w &&
		player.y + player.h > p.y &&
		player.y + player.h - player.vy <= p.y
		){
			player.y = p.y - player.h;
			player.vy = 0;
			player.onGround = true;
		}
	});
}

function gameLoop(){
	if (gameOver) return;
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	updatePlayer();
	platforms.forEach(p => {
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x, p.y, p.w, p.h);
});

	ctx.fillStyle = player.color;
	ctx.drawImage (playerImage, player.x, player.y, player.w, player.h);
	requestAnimationFrame(gameLoop);
	
	updateBarrels();
	barrels.forEach(barrel => {
		ctx.fillStyle = barrel.color;
		ctx.drawImage (barrelImage, barrel.x, barrel.y, barrel.w, barrel.h);
	});
	ctx.fillStyle = goal.color;
	ctx.drawImage(goalImage, goal.x, goal.y, goal.w, goal.h);
	barrels.forEach(barrel => {
		if (
		player.x < barrel.x + barrel.w &&
		player.x + player.w > barrel.x &&
		player.y < barrel.y + barrel.h &&
		player.y + player.h > barrel.y
		){
			handlePlayerHit();
		}
	});
	barrelTimer++;
	if (barrelTimer >= barrelInterval) {
		spawnBarrel();
		barrelTimer = 0;
	};
	if (
	player.x < goal.x + goal.w &&
	player.x + player.w > goal.x &&
	player.y < goal.y + goal.h &&
	player.y + player.h > goal.y
	){
		handleWin();
	}
}
gameLoop();