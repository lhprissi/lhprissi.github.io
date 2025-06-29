// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Objeto do jogador
const player = {
    x: 50,
    y: 0,
    width: 64,
    height: 64,
    velocityY: 0,
    isGrounded: false,
    facingLeft: false
};

// Função para ajustar o canvas à resolução da tela
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Redimensiona personagem proporcionalmente
    player.width = window.innerWidth * 0.08;
    player.height = player.width;
    player.y = window.innerHeight - player.height;

    if (player.x + player.width > window.innerWidth) {
        player.x = window.innerWidth - player.width;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const GRAVITY = 0.2;
const JUMP_STRENGTH = -10;
const PLAYER_SPEED = 2;

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const NUM_FRAMES = 5;
const FRAME_COLUMNS = 2;

let currentFrame = 0;
let frameCounter = 0;
const FRAME_DELAY = 10;

const playerImage = new Image();
playerImage.src = 'img/personagem.png';

const keys = {
    right: false,
    left: false,
    up: false
};

const btnLeft = document.getElementById('left-btn');
const btnRight = document.getElementById('right-btn');
const btnUp = document.getElementById('up-btn');

btnLeft?.addEventListener('pointerdown', () => keys.left = true);
btnLeft?.addEventListener('pointerup', () => keys.left = false);

btnRight?.addEventListener('pointerdown', () => keys.right = true);
btnRight?.addEventListener('pointerup', () => keys.right = false);

btnUp?.addEventListener('pointerdown', () => keys.up = true);
btnUp?.addEventListener('pointerup', () => keys.up = false);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

function drawPlayer() {
    if (keys.left || keys.right) {
        frameCounter++;
        if (frameCounter >= FRAME_DELAY) {
            currentFrame = (currentFrame + 1) % NUM_FRAMES;
            frameCounter = 0;
        }
    } else {
        currentFrame = 0;
    }

    const sx = (currentFrame % FRAME_COLUMNS) * FRAME_WIDTH;
    const sy = Math.floor(currentFrame / FRAME_COLUMNS) * FRAME_HEIGHT;

    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);
    const drawW = Math.round(player.width);
    const drawH = Math.round(player.height);

    if (player.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(playerImage, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, -drawX - drawW, drawY, drawW, drawH);
        ctx.restore();
    } else {
        ctx.drawImage(playerImage, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, drawX, drawY, drawW, drawH);
    }
}

function gameLoop() {
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    const groundLevel = window.innerHeight - player.height;
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.velocityY = 0;
        player.isGrounded = true;
    } else {
        player.isGrounded = false;
    }

    if (keys.right) {
        player.x += PLAYER_SPEED;
        player.facingLeft = false;
    }
    if (keys.left) {
        player.x -= PLAYER_SPEED;
        player.facingLeft = true;
    }

    if (keys.up && player.isGrounded) {
        player.velocityY = JUMP_STRENGTH;
        player.isGrounded = false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

playerImage.onload = () => {
    resizeCanvas();
    gameLoop();
};
