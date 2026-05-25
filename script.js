// Game variables
const gameBoard = document.getElementById('gameBoard');
const playerPaddle = document.getElementById('playerPaddle');
const computerPaddle = document.getElementById('computerPaddle');
const ball = document.getElementById('ball');
const playerScoreDisplay = document.getElementById('playerScore');
const computerScoreDisplay = document.getElementById('computerScore');
const gameStatus = document.getElementById('gameStatus');

// Game constants
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 4;
const MAX_BALL_SPEED = 7;

// Game state
let playerScore = 0;
let computerScore = 0;
let gameRunning = true;

// Paddle positions
let playerPaddleY = (BOARD_HEIGHT - PADDLE_HEIGHT) / 2;
let computerPaddleY = (BOARD_HEIGHT - PADDLE_HEIGHT) / 2;

// Ball properties
let ballX = BOARD_WIDTH / 2;
let ballY = BOARD_HEIGHT / 2;
let ballSpeedX = INITIAL_BALL_SPEED;
let ballSpeedY = INITIAL_BALL_SPEED;

// Input handling
const keys = {};
let mouseY = BOARD_HEIGHT / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

gameBoard.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position
function updatePlayerPaddle() {
    // Mouse control
    if (mouseY > 0 && mouseY < BOARD_HEIGHT) {
        playerPaddleY = Math.max(0, Math.min(BOARD_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2));
    }
    
    // Arrow keys control
    if (keys['ArrowUp'] && playerPaddleY > 0) {
        playerPaddleY -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] && playerPaddleY < BOARD_HEIGHT - PADDLE_HEIGHT) {
        playerPaddleY += PADDLE_SPEED;
    }
    
    playerPaddle.style.top = playerPaddleY + 'px';
}

// Update computer paddle (AI)
function updateComputerPaddle() {
    const computerCenter = computerPaddleY + PADDLE_HEIGHT / 2;
    const paddleSpeed = 4.5;
    
    // Simple AI: track the ball
    if (computerCenter < ballY - 35) {
        if (computerPaddleY < BOARD_HEIGHT - PADDLE_HEIGHT) {
            computerPaddleY += paddleSpeed;
        }
    } else if (computerCenter > ballY + 35) {
        if (computerPaddleY > 0) {
            computerPaddleY -= paddleSpeed;
        }
    }
    
    computerPaddle.style.top = computerPaddleY + 'px';
}

// Update ball position
function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
}

// Check collision with top and bottom walls
function checkWallCollision() {
    if (ballY <= 0) {
        ballY = 0;
        ballSpeedY = -ballSpeedY;
    } else if (ballY >= BOARD_HEIGHT - BALL_SIZE) {
        ballY = BOARD_HEIGHT - BALL_SIZE;
        ballSpeedY = -ballSpeedY;
    }
}

// Check collision with paddles
function checkPaddleCollision() {
    // Player paddle collision (left side)
    if (ballX <= PADDLE_WIDTH + 20 &&
        ballY >= playerPaddleY &&
        ballY <= playerPaddleY + PADDLE_HEIGHT) {
        
        if (ballSpeedX < 0) { // Only if ball is moving towards paddle
            ballX = PADDLE_WIDTH + 20; // Prevent ball from getting stuck
            ballSpeedX = -ballSpeedX;
            
            // Add spin based on where ball hits paddle
            const collisionPoint = (ballY - playerPaddleY) / PADDLE_HEIGHT;
            ballSpeedY += (collisionPoint - 0.5) * 3;
            
            // Increase ball speed slightly (up to max)
            const currentSpeed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
            if (currentSpeed < MAX_BALL_SPEED) {
                ballSpeedX *= 1.05;
                ballSpeedY *= 1.05;
            }
        }
    }
    
    // Computer paddle collision (right side)
    if (ballX >= BOARD_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE &&
        ballY >= computerPaddleY &&
        ballY <= computerPaddleY + PADDLE_HEIGHT) {
        
        if (ballSpeedX > 0) { // Only if ball is moving towards paddle
            ballX = BOARD_WIDTH - PADDLE_WIDTH - 20 - BALL_SIZE;
            ballSpeedX = -ballSpeedX;
            
            // Add spin based on where ball hits paddle
            const collisionPoint = (ballY - computerPaddleY) / PADDLE_HEIGHT;
            ballSpeedY += (collisionPoint - 0.5) * 3;
            
            // Increase ball speed slightly (up to max)
            const currentSpeed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
            if (currentSpeed < MAX_BALL_SPEED) {
                ballSpeedX *= 1.05;
                ballSpeedY *= 1.05;
            }
        }
    }
}

// Check if goal is scored
function checkGoal() {
    if (ballX < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    } else if (ballX > BOARD_WIDTH) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ballX = BOARD_WIDTH / 2;
    ballY = BOARD_HEIGHT / 2;
    
    // Random direction
    const angle = (Math.random() - 0.5) * 0.5;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
    ballSpeedY = angle * 3;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    checkWallCollision();
    checkPaddleCollision();
    checkGoal();
    
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
function initGame() {
    resetBall();
    gameRunning = true;
    gameStatus.textContent = 'Game Running...';
    gameLoop();
}

// Start the game when page loads
window.addEventListener('load', initGame);

// Pause/Resume on spacebar
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        gameRunning = !gameRunning;
        gameStatus.textContent = gameRunning ? 'Game Running...' : 'Game Paused (Press Space to Resume)';
        if (gameRunning) gameLoop();
    }
});