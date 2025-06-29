// game.js - Versão Atualizada

// --- CONFIGURAÇÃO INICIAL ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Pega a referência do contêiner dos controles para poder escondê-lo
const touchControls = document.getElementById('touch-controls');

// Desativa o anti-aliasing para manter a pixel art nítida
ctx.imageSmoothingEnabled = false;

// --- OBJETOS E ESTADO DO JOGO ---
const player = {
    x: 50,
    y: 0,
    width: 64,
    height: 64,
    velocityY: 0,
    isGrounded: false,
    facingLeft: false
};

// Variáveis de física que serão ajustadas dinamicamente ao tamanho da tela
let GRAVITY;
let JUMP_STRENGTH;
let PLAYER_SPEED;

// --- FUNÇÕES DE VISIBILIDADE DA UI ---
// Função para esconder os controles de toque
function hideTouchControls() {
    if (touchControls && !touchControls.classList.contains('hidden')) {
        touchControls.classList.add('hidden');
    }
}

// Função para mostrar os controles de toque
function showTouchControls() {
    if (touchControls && touchControls.classList.contains('hidden')) {
        touchControls.classList.remove('hidden');
    }
}


// --- LÓGICA DE RESPONSIVIDADE ---
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    // Redimensiona o personagem para ter 30% da altura da tela
    player.height = window.innerHeight * 0.3;
    player.width = player.height; // Mantém o personagem quadrado

    // Ajusta as variáveis de física para serem proporcionais à tela,
    // garantindo que a jogabilidade seja consistente em qualquer resolução.
    PLAYER_SPEED = window.innerWidth * 0.002;
    GRAVITY = window.innerHeight * 0.0005;
    JUMP_STRENGTH = -(window.innerHeight * 0.025);
    
    // Reposiciona o jogador no chão após redimensionar
    player.y = window.innerHeight - player.height;

    // Garante que o jogador não fique fora da tela
    if (player.x + player.width > window.innerWidth) {
        player.x = window.innerWidth - player.width;
    }
}

// --- ANIMAÇÃO DO SPRITE ---
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const NUM_FRAMES = 5;
const FRAME_COLUMNS = 2;
let currentFrame = 0;
let frameCounter = 0;
const FRAME_DELAY = 10;

const playerImage = new Image();
playerImage.src = 'img/personagem.png';

// --- CONTROLES E INPUTS ---
const keys = {
    right: false,
    left: false,
    up: false
};

const btnLeft = document.getElementById('left-btn');
const btnRight = document.getElementById('right-btn');
const btnUp = document.getElementById('up-btn');

// Listeners para os botões de toque
btnLeft?.addEventListener('pointerdown', () => { showTouchControls(); keys.left = true; });
btnLeft?.addEventListener('pointerup', () => { keys.left = false; });
btnLeft?.addEventListener('pointerleave', () => { keys.left = false; });

btnRight?.addEventListener('pointerdown', () => { showTouchControls(); keys.right = true; });
btnRight?.addEventListener('pointerup', () => { keys.right = false; });
btnRight?.addEventListener('pointerleave', () => { keys.right = false; });

btnUp?.addEventListener('pointerdown', () => {
    showTouchControls();
    if (player.isGrounded) {
        keys.up = true;
    }
});
btnUp?.addEventListener('pointerup', () => { keys.up = false; });

// Listeners para o teclado
document.addEventListener('keydown', (e) => {
    hideTouchControls(); // Esconde os controles ao usar o teclado
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = true;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.key === ' ') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w' || e.key === ' ') keys.up = false;
});


// --- FUNÇÕES PRINCIPAIS DO JOGO ---

/**
 * Atualiza o estado do jogo (física, movimento, input).
 * Não desenha nada na tela.
 */
function update() {
    // Aplica a gravidade
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Verifica colisão com o chão
    const groundLevel = window.innerHeight - player.height;
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.velocityY = 0;
        player.isGrounded = true;
    } else {
        player.isGrounded = false;
    }

    // Processa o movimento horizontal
    if (keys.right) {
        player.x += PLAYER_SPEED;
        player.facingLeft = false;
    }
    if (keys.left) {
        player.x -= PLAYER_SPEED;
        player.facingLeft = true;
    }

    // Processa o pulo
    if (keys.up && player.isGrounded) {
        player.velocityY = JUMP_STRENGTH;
        player.isGrounded = false;
        keys.up = false; // Evita pulos múltiplos com uma só pressionada
    }
    
    // Impede o jogador de sair pelos lados da tela
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > window.innerWidth) {
        player.x = window.innerWidth - player.width;
    }
}

/**
 * Desenha tudo na tela (personagem, cenário, etc.).
 * Não altera o estado do jogo.
 */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lógica da animação
    if (keys.left || keys.right) {
        frameCounter++;
        if (frameCounter >= FRAME_DELAY) {
            currentFrame = (currentFrame + 1) % NUM_FRAMES;
            frameCounter = 0;
        }
    } else {
        currentFrame = 0; // Personagem parado
    }

    const sx = (currentFrame % FRAME_COLUMNS) * FRAME_WIDTH;
    const sy = Math.floor(currentFrame / FRAME_COLUMNS) * FRAME_HEIGHT;
    
    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);
    const drawW = Math.round(player.width);
    const drawH = Math.round(player.height);

    // Vira a imagem se o jogador estiver virado para a esquerda
    if (player.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(playerImage, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, -drawX - drawW, drawY, drawW, drawH);
        ctx.restore();
    } else {
        ctx.drawImage(playerImage, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, drawX, drawY, drawW, drawH);
    }
}

/**
 * O loop principal que roda o jogo.
 */
function gameLoop() {
    update(); // 1. Calcula a nova posição e estado de tudo
    draw();   // 2. Desenha o resultado na tela
    requestAnimationFrame(gameLoop); // Pede ao navegador para chamar a função novamente
}

// --- INICIALIZAÇÃO DO JOGO ---
// Garante que a imagem foi carregada antes de iniciar o jogo
playerImage.onload = () => {
    resizeCanvas(); // Configura o tamanho inicial
    gameLoop();     // Inicia o loop do jogo
};

// Reconfigura o canvas se o tamanho da janela do navegador mudar
window.addEventListener('resize', resizeCanvas);
