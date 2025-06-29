const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constantes do jogo
const GRAVITY = 0.5;
const JUMP_STRENGTH = -10;
const PLAYER_SPEED = 2;

// Sprite do personagem
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const NUM_FRAMES = 5;
const FRAME_COLUMNS = 2;

let currentFrame = 0;
let frameCounter = 0;
const FRAME_DELAY = 10;

// Imagem do personagem
const playerImage = new Image();
playerImage.src = 'img/personagem.png'; // ajuste o caminho conforme seu projeto

// Objeto do jogador
const player = {
    x: 50,
    y: canvas.height - FRAME_HEIGHT,
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    velocityY: 0,
    isGrounded: false,
    facingLeft: false // direção inicial (olhando para a direita)
};

// Controle de teclas
const keys = {
    right: false,
    left: false,
    up: false
};

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

// Função para desenhar o jogador
function drawPlayer() {
    // Atualiza o quadro da animação se estiver andando
    if (keys.left || keys.right) {
        frameCounter++;
        if (frameCounter >= FRAME_DELAY) {
            currentFrame = (currentFrame + 1) % NUM_FRAMES;
            frameCounter = 0;
        }
    } else {
        currentFrame = 0; // parada = primeiro quadro
    }

    // Calcula posição do frame na imagem
    const sx = (currentFrame % FRAME_COLUMNS) * FRAME_WIDTH;
    const sy = Math.floor(currentFrame / FRAME_COLUMNS) * FRAME_HEIGHT;

    if (player.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            playerImage,
            sx, sy,
            FRAME_WIDTH, FRAME_HEIGHT,
            -player.x - player.width, player.y,
            player.width, player.height
        );
        ctx.restore();
    } else {
        ctx.drawImage(
            playerImage,
            sx, sy,
            FRAME_WIDTH, FRAME_HEIGHT,
            player.x, player.y,
            player.width, player.height
        );
    }
}

// Loop principal do jogo
function gameLoop() {
    // Aplicar gravidade
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Colisão com o chão
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.velocityY = 0;
        player.isGrounded = true;
    } else {
        player.isGrounded = false;
    }

    // Movimento lateral + direção
    if (keys.right) {
        player.x += PLAYER_SPEED;
        player.facingLeft = false;
    }
    if (keys.left) {
        player.x -= PLAYER_SPEED;
        player.facingLeft = true;
    }

    // Pulo
    if (keys.up && player.isGrounded) {
        player.velocityY = JUMP_STRENGTH;
        player.isGrounded = false;
    }

    // Limpar tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar personagem
    drawPlayer();

    // Próximo frame
    requestAnimationFrame(gameLoop);
}

// Iniciar jogo após carregar sprite
playerImage.onload = () => {
    gameLoop();
};
