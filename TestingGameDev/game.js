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

// --- NOVO: Variáveis de física que serão ajustadas dinamicamente ---
let GRAVITY;
let JUMP_STRENGTH;
let PLAYER_SPEED;

// Função para ajustar o canvas e as variáveis de jogo à resolução da tela
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect(); // Usa getBoundingClientRect para mais precisão

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx.scale(dpr, dpr);

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    // --- LÓGICA DE RESPONSIVIDADE MELHORADA ---
    // Redimensiona personagem proporcionalmente à altura da tela, para consistência
    player.height = window.innerHeight * 0.20; // Personagem tem 10% da altura da tela
    player.width = player.height; // Mantém o aspect ratio 1:1

    // Ajusta as variáveis de física para serem proporcionais ao tamanho da tela
    // Isso garante que a "sensação" do jogo (pulo, velocidade) seja a mesma em qualquer resolução.
    PLAYER_SPEED = window.innerWidth * 0.002;    // Velocidade é 0.2% da largura da tela por frame
    GRAVITY = window.innerHeight * 0.0005;        // Gravidade proporcional à altura
    JUMP_STRENGTH = -(window.innerHeight * 0.025); // Força do pulo proporcional à altura
    
    // Reposiciona o jogador no chão após redimensionar
    player.y = window.innerHeight - player.height;

    // Garante que o jogador não fique fora da tela
    if (player.x + player.width > window.innerWidth) {
        player.x = window.innerWidth - player.width;
    }
}


// --- LÓGICA DE ANIMAÇÃO (sem alterações) ---
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;
const NUM_FRAMES = 5;
const FRAME_COLUMNS = 2;
let currentFrame = 0;
let frameCounter = 0;
const FRAME_DELAY = 10;

const playerImage = new Image();
playerImage.src = 'img/personagem.png';

// --- CONTROLES (sem alterações na lógica, apenas nos IDs dos botões) ---
const keys = {
    right: false,
    left: false,
    up: false
};

const btnLeft = document.getElementById('left-btn');
const btnRight = document.getElementById('right-btn');
const btnUp = document.getElementById('up-btn');

// Usando 'pointer' para abranger mouse e toque
btnLeft?.addEventListener('pointerdown', () => keys.left = true);
btnLeft?.addEventListener('pointerup', () => keys.left = false);
btnLeft?.addEventListener('pointerleave', () => keys.left = false); // Evita botão "preso"

btnRight?.addEventListener('pointerdown', () => keys.right = true);
btnRight?.addEventListener('pointerup', () => keys.right = false);
btnRight?.addEventListener('pointerleave', () => keys.right = false);

btnUp?.addEventListener('pointerdown', () => { if(player.isGrounded) keys.up = true; });
btnUp?.addEventListener('pointerup', () => keys.up = false);


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') keys.up = false;
});


function draw() {
    // Limpa a tela. As coordenadas são relativas ao canvas sem escala de DPR
    // porque `scale` foi chamado no `ctx`
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Animação do personagem
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

    // Arredondar posições ajuda a manter a nitidez da pixel art
    const drawX = Math.round(player.x);
    const drawY = Math.round(player.y);
    const drawW = Math.round(player.width);
    const drawH = Math.round(player.height);

    // Vira o personagem
    if (player.facingLeft) {
        ctx.save();
        ctx.scale(-1, 1);
        // Ao inverter o contexto, precisamos desenhar em uma coordenada negativa
        ctx.drawImage(playerImage, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, -drawX - drawW, drawY, drawW, drawH);
        ctx.restore();
    } else {
        ctx.drawImage(playerImage, sx, sy, FRAME_WIDTH, FRAME_HEIGHT, drawX, drawY, drawW, drawH);
    }
}

function update() {
    // --- LÓGICA DE FÍSICA ---
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Verificação de colisão com o chão
    const groundLevel = window.innerHeight - player.height;
    if (player.y > groundLevel) {
        player.y = groundLevel;
        player.velocityY = 0;
        player.isGrounded = true;
    } else {
        player.isGrounded = false;
    }

    // --- LÓGICA DE MOVIMENTO ---
    if (keys.right) {
        player.x += PLAYER_SPEED;
        player.facingLeft = false;
    }
    if (keys.left) {
        player.x -= PLAYER_SPEED;
        player.facingLeft = true;
    }

    // Lógica de pulo
    if (keys.up && player.isGrounded) {
        player.velocityY = JUMP_STRENGTH;
        player.isGrounded = false;
        keys.up = false; // Consome o pulo para evitar pulos múltiplos com um toque
    }
    
    // Limites da tela
    if(player.x < 0) player.x = 0;
    if(player.x + player.width > window.innerWidth) player.x = window.innerWidth - player.width;
}

// --- LOOP PRINCIPAL DO JOGO ---
function gameLoop() {
    update(); // 1. Atualiza o estado do jogo
    draw();   // 2. Desenha o estado atual na tela
    requestAnimationFrame(gameLoop); // Pede ao navegador para chamar gameLoop na próxima vez
}

// --- INICIALIZAÇÃO ---
playerImage.onload = () => {
    resizeCanvas(); // Chama uma vez para configurar o tamanho inicial
    gameLoop();
};

window.addEventListener('resize', resizeCanvas); // Re-calcula tudo quando a janela muda de tamanho