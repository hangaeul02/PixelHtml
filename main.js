const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1920;
canvas.height = 1080;

const uiContainer = document.getElementById('uiContainer');
const menuButtons = document.getElementById('menuButtons');
const instructions = document.getElementById('instructions');
const settings = document.getElementById('settings');
const startButton = document.getElementById('startButton');
const instructionsButton = document.getElementById('instructionsButton');
const settingsButton = document.getElementById('settingsButton');
const backFromInstructions = document.getElementById('backFromInstructions');
const backFromSettings = document.getElementById('backFromSettings');

const rankingsContainer = document.getElementById('rankings');
const rankingList = document.getElementById('rankingList');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const mainMenuButton = document.getElementById('mainMenuButton');

startButton.addEventListener('click', () => {
    document.getElementById('blackOverlay').style.display = 'block'; 
    uiContainer.style.display = 'none'; 
    canvas.style.display = 'block'; 
    startGame(); 
});



instructionsButton.addEventListener('click', () => {
    menuButtons.style.display = 'none';
    instructions.style.display = 'block';
});

settingsButton.addEventListener('click', () => {
    menuButtons.style.display = 'none';
    settings.style.display = 'block';
});

backFromInstructions.addEventListener('click', () => {
    instructions.style.display = 'none';
    menuButtons.style.display = 'block';
});

backFromSettings.addEventListener('click', () => {
    settings.style.display = 'none';
    menuButtons.style.display = 'block';
});

restartButton.addEventListener('click', () => {
    rankingsContainer.style.display = 'none'; 
    canvas.style.display = 'block'; 
    resetGame(); 
    startGame(); 
});

mainMenuButton.addEventListener('click', () => {
    rankingsContainer.style.display = 'none'; 
    uiContainer.style.display = 'flex'; 
    canvas.style.display = 'none'; 
    document.getElementById('blackOverlay').style.display = 'none'; 
    resetGame(); 
});



// 키 입력 처리
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // 공격 키 (스페이스바)
    if (e.key === ' ' && !isAttacking && canAttack) {
        const closestTarget = getClosestTarget();
        if (closestTarget) {
            isAttacking = true;
            attackFrame = 0;

            // 공격 방향 설정
            if (closestTarget.type === 'enemy' || closestTarget.type === 'ball') {
                const target = closestTarget.target;
                attackAngle = Math.atan2(
                    target.y + (target.height || target.radius) / 2 - (player.y + player.height / 2),
                    target.x + (target.width || target.radius) / 2 - (player.x + player.width / 2)
                );
            }

            canAttack = false; 
            cooldownTimeLeft = ATTACK_COOLDOWN; 

            const cooldownInterval = setInterval(() => {
                cooldownTimeLeft -= 100; 
                if (cooldownTimeLeft <= 0) {
                    clearInterval(cooldownInterval);
                    canAttack = true; 
                }
            }, 100);
        }
    }

});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'z' && !isDashing && dashCooldownRemaining <= 0) {
        startDash(); 
        e.preventDefault(); 
    }
});




document.getElementById('restartButton').addEventListener('click', () => {
    const rankingsContainer = document.getElementById('rankings');
    rankingsContainer.style.display = 'none'; 
    menuButtons.style.display = 'block'; 

    resetGame(); 
});

let isDashing = false; 
const DASH_SPEED = 6; 
const DASH_DURATION = 500; 
const DASH_COOLDOWN = 5000; 
let dashCooldownRemaining = 0; 

const PLAYER_SPEED = 3;
const ENEMY_SPEED = 2;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 20;
const SWORD_RANGE = 60;
const ATTACK_DURATION = 10; 
const ATTACK_COOLDOWN = 1500; 
const enemies = [];
const keys = {}; 

const enemyImageLeft = new Image();
enemyImageLeft.src = '몹L.png'; 

const enemyImageRight = new Image();
enemyImageRight.src = '몹R.png'; 
const ENEMY_BASE_SIZE = 100; 

const playerImageLeft = new Image();
playerImageLeft.src = '플레이어L.png';

const playerImageRight = new Image();
playerImageRight.src = '플레이어R.png';

const slidingImageLeft = new Image();
slidingImageLeft.src = '슬라이딩L.png';

const slidingImageRight = new Image();
slidingImageRight.src = '슬라이딩R.png';

let currentPlayerImage = playerImageRight; 

const ballImage = new Image();
ballImage.src = '공 이미지.png';

let score = 0;
let isAttacking = false; 
let attackFrame = 0; 
let attackAngle = 0; 
let canAttack = true; 
let cooldownTimeLeft = 0; 
let gameRunning = false; 
let scoreInterval; 
let gameLoopId; 

function resizeCanvas() {
    const aspectRatio = 16 / 9;
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (width / height > aspectRatio) {
        width = height * aspectRatio;
    } else {
        height = width / aspectRatio;
    }

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = width;
    canvas.height = height;
    ball.adjustRadius();
    player.resize();

    drawBackground(); 
}




function adjustScale() {
    const scaleX = canvas.width / 1920;
    const scaleY = canvas.height / 1080;

    player.width = PLAYER_SIZE * scaleX;
    player.height = PLAYER_SIZE * scaleY;
    ball.radius = Math.min(scaleX, scaleY) * 15;
    enemies.forEach(enemy => {
        enemy.width = ENEMY_SIZE * scaleX;
        enemy.height = ENEMY_SIZE * scaleY;
    });
}

function adjustUI() {
    const uiContainer = document.getElementById('uiContainer');

    if (gameRunning) {
        uiContainer.style.display = 'none'; 
    } else {
        uiContainer.style.display = 'flex'; 
        uiContainer.style.width = `${canvas.width * 0.4}px`; 
        uiContainer.style.padding = `${canvas.width * 0.02}px`; 
    }
}

function getHighScore() {
    return parseInt(localStorage.getItem('highScore') || '0', 10);
}

function saveHighScore(score) {
    const highScore = getHighScore();
    if (score > highScore) {
        localStorage.setItem('highScore', score);
    }
}

function adjustGameOverUI() {
    const scaleFactor = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);

    // 게임 오버 창 스타일 동적 조정
    rankingsContainer.style.width = `${Math.max(400, scaleFactor * 800)}px`; 
    rankingsContainer.style.padding = `${scaleFactor * 20}px`; 
    rankingsContainer.style.borderRadius = `${scaleFactor * 10}px`; 

    // 제목과 점수 텍스트 크기 동적 조정
    const gameOverTitle = rankingsContainer.querySelector('h2');
    const finalScoreText = rankingsContainer.querySelector('h3:first-of-type');
    const highScoreText = rankingsContainer.querySelector('h3:nth-of-type(2)');

    gameOverTitle.style.fontSize = `${Math.max(20, scaleFactor * 36)}px`; 
    finalScoreText.style.fontSize = `${Math.max(18, scaleFactor * 28)}px`; 
    highScoreText.style.fontSize = `${Math.max(16, scaleFactor * 24)}px`; 

    const rankingList = rankingsContainer.querySelector('#rankingList');
    rankingList.style.fontSize = `${Math.max(14, scaleFactor * 20)}px`; 
}
const MIN_SPEED = 0.7;


// 공 객체
const ball = {
    x: canvas.width * 0.5,
    y: canvas.height * 0.5,
    radius: Math.min(canvas.width, canvas.height) * 0.03, 
    dx: 0, 
    dy: 0, 
    initialBounceCount: 2, 
    bounceCount: 2, 
    speed: Math.min(canvas.width, canvas.height) * 0.002, 
    image: new Image(),

    init() {
        this.image.src = '공 이미지.png';
    },

    draw() {
        if (this.image.complete) {
            ctx.drawImage(
                this.image,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }
    },

    update() {
        this.x += this.dx;
        this.y += this.dy;
    
        if (this.x - this.radius < 0) {
            this.x = this.radius; 
            this.dx = Math.abs(this.dx); 
            this.handleBounce();
        } else if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius; 
            this.dx = -Math.abs(this.dx);
            this.handleBounce();
        }

        if (this.y - this.radius < 0) {
            this.y = this.radius; 
            this.dy = Math.abs(this.dy); 
            this.handleBounce();
        } else if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius; 
            this.dy = -Math.abs(this.dy);
            this.handleBounce();
        }

        this.draw(); 
    },

    handleBounce() {
        this.bounceCount = Math.max(this.bounceCount - 1, 0); 
    
        this.speed = Math.max(this.speed * 0.6, MIN_SPEED);
        this.updateVelocity();
    
        if (this.bounceCount < 0) {
            gameOver();
        }
    },

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        this.updateVelocity();
    },

    increaseSpeed(factor) {
        this.speed *= factor;
        this.updateVelocity();
    },

    updateVelocity() {
        const angle = Math.atan2(this.dy, this.dx); 
        this.dx = Math.cos(angle) * this.speed; // x 방향 속도 재설정
        this.dy = Math.sin(angle) * this.speed; // y 방향 속도 재설정
    },

    adjustRadius() {
        this.radius = Math.min(canvas.width, canvas.height) * 0.07; 
    },

    setRandomDirection() {
        const angle = Math.random() * Math.PI * 2; // 랜덤한 각도 (0~2π)
        this.dx = Math.cos(angle) * this.speed; // x 방향 속도
        this.dy = Math.sin(angle) * this.speed; // y 방향 속도
    }
};

ball.init();

function isBallCollidingWithEnemy(ball, enemy) {
    const nearestX = Math.max(enemy.x, Math.min(ball.x, enemy.x + enemy.width));
    const nearestY = Math.max(enemy.y, Math.min(ball.y, enemy.y + enemy.height));
    const deltaX = ball.x - nearestX;
    const deltaY = ball.y - nearestY;

    return (deltaX * deltaX + deltaY * deltaY) < (ball.radius * ball.radius);
}





// 플레이어
const player = {
    x: canvas.width * 0.2, // 초기 위치
    y: canvas.height * 0.2, // 초기 위치
    width: 0, // 너비
    height: 0, // 높이
    direction: 'right', // 초기 방향 (left or right)
    
    draw() {
        const image = this.direction === 'left' ? playerImageLeft : playerImageRight;
        ctx.drawImage(currentPlayerImage, this.x, this.y, this.width, this.height); // 방향에 따라 이미지 선택
    },

    update() {
        this.x += this.dx;
        this.y += this.dy;

        // 방향 설정
        if (this.dx < 0) {
            this.direction = 'left';
        } else if (this.dx > 0) {
            this.direction = 'right';
        }

        // 화면 경계 제한
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    },

    resize() {
        // 플레이어 크기를 캔버스 크기에 비례하여 설정
        this.width = canvas.width * 0.03; // 캔버스 너비의 5%
        this.height = canvas.height * 0.09; // 캔버스 높이의 10%
        this.x = Math.min(this.x, canvas.width - this.width); // 화면 경계 보정
        this.y = Math.min(this.y, canvas.height - this.height); // 화면 경계 보정
    }
};


// 가장 가까운 적 찾기
function getClosestTarget() {
    let closestTarget = null;
    let minDistance = Infinity;

    // 적들에 대한 거리 계산
    enemies.forEach((enemy) => {
        const distX = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
        const distY = player.y + player.height / 2 - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            closestTarget = { type: 'enemy', target: enemy };
        }
    });

    // 공에 대한 거리 계산
    const ballDistX = player.x + player.width / 2 - ball.x;
    const ballDistY = player.y + player.height / 2 - ball.y;
    const ballDistance = Math.sqrt(ballDistX ** 2 + ballDistY ** 2);

    if (ballDistance < minDistance) {
        closestTarget = { type: 'ball', target: ball };
    }

    return closestTarget;
}


function drawSword() {
    if (!isAttacking) return;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const angle = attackAngle + (Math.PI / 4) * Math.sin((Math.PI / ATTACK_DURATION) * attackFrame);
    const swordX = playerCenterX + Math.cos(angle) * SWORD_RANGE;
    const swordY = playerCenterY + Math.sin(angle) * SWORD_RANGE;

    // 검 그리기
    ctx.beginPath();
    ctx.moveTo(playerCenterX, playerCenterY);
    ctx.lineTo(swordX, swordY);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 공과 검의 충돌 감지
    const distanceToBall = Math.sqrt(
        (ball.x - swordX) ** 2 +
        (ball.y - swordY) ** 2
    );

    if (distanceToBall < ball.radius + 5) {
        const newAngle = Math.atan2(ball.y - playerCenterY, ball.x - playerCenterX);
        ball.dx = Math.cos(newAngle) * ball.speed;
        ball.dy = Math.sin(newAngle) * ball.speed;

        ball.increaseSpeed(1.1); 
        ball.bounceCount = ball.initialBounceCount; 
    }

    // 몹과 검의 충돌 감지
    enemies.forEach((enemy, index) => {
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;

        const distanceToEnemy = Math.sqrt(
            (enemyCenterX - swordX) ** 2 +
            (enemyCenterY - swordY) ** 2
        );

        if (distanceToEnemy < enemy.width / 2) {
            enemies.splice(index, 1); 
            score += 10; 
        }
    });

    attackFrame++;
    if (attackFrame > ATTACK_DURATION) {
        isAttacking = false; 
    }
}


// 플레이어 이동 처리
function handlePlayerMovement() {
    if (!isDashing) {
        player.dx = 0;
        player.dy = 0;

        if (keys['ArrowUp']) player.dy = -PLAYER_SPEED;
        if (keys['ArrowDown']) player.dy = PLAYER_SPEED;
        if (keys['ArrowLeft']) {
            player.dx = -PLAYER_SPEED;
            currentPlayerImage = playerImageLeft; 
        }
        if (keys['ArrowRight']) {
            player.dx = PLAYER_SPEED;
            currentPlayerImage = playerImageRight;
        }

        player.x += player.dx;
        player.y += player.dy;

        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
        if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
    }
}

// 적 생성
function spawnEnemy() {
    const scaleX = canvas.width / 1920; 
    const scaleY = canvas.height / 1080;

    let x, y;
    let minDistance = 500 * Math.min(scaleX, scaleY); 

    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;

        const distX = x - (player.x + player.width / 2);
        const distY = y - (player.y + player.height / 2);
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance >= minDistance) break;

    } while (true);

    const isRanged = score >= 500 && Math.random() < 0.3;

    enemies.push({
        x,
        y,
        width: ENEMY_BASE_SIZE * scaleX,
        height: ENEMY_BASE_SIZE * scaleY, 
        dx: 0,
        dy: 0,
        isRanged: isRanged, 
        bullets: [], 
    
        draw() {
            const image = this.dx < 0 ? enemyImageLeft : enemyImageRight; 
            ctx.drawImage(image, this.x, this.y, this.width, this.height); 
        },
    
        update() {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.dx = Math.cos(angle) * ENEMY_SPEED * scaleX; 
            this.dy = Math.sin(angle) * ENEMY_SPEED * scaleY;
    
            if (!this.isRanged) {
                this.x += this.dx;
                this.y += this.dy;
            } else {
                if (Math.random() < 0.02) { 
                    this.bullets.push({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        dx: Math.cos(angle) * 5 * scaleX, 
                        dy: Math.sin(angle) * 5 * scaleY,
                        draw() {
                            ctx.fillStyle = 'yellow';
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, 5 * Math.min(scaleX, scaleY), 0, Math.PI * 2); 
                            ctx.fill();
                        },
                        update() {
                            this.x += this.dx;
                            this.y += this.dy;
    
                            if (
                                this.x > player.x &&
                                this.x < player.x + player.width &&
                                this.y > player.y &&
                                this.y < player.y + player.height
                            ) {
                                gameOver();
                            }
    
                            this.draw();
                        }
                    });
                }
    
                this.bullets = this.bullets.filter((bullet) => {
                    bullet.update();
                    return (
                        bullet.x >= 0 &&
                        bullet.x <= canvas.width &&
                        bullet.y >= 0 &&
                        bullet.y <= canvas.height
                    );
                });
            }
    
            this.draw();
        }
    });
    
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.update();

        if (!isDashing) { 
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const enemyCenterX = enemy.x + enemy.width / 2;
            const enemyCenterY = enemy.y + enemy.height / 2;

            const distance = Math.sqrt(
                (playerCenterX - enemyCenterX) ** 2 + 
                (playerCenterY - enemyCenterY) ** 2
            );

            if (distance < (player.width / 2 + enemy.width / 2)) {
                gameOver();
        }

        if (isBallCollidingWithEnemy(ball, enemy)) {
            enemies.splice(index, 1); 
            score += 10; 
        }

        enemy.draw();
    }});
}




function enforceAspectRatio() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const aspectRatio = 16 / 9;
    let adjustedWidth = windowWidth;
    let adjustedHeight = windowHeight;

    if (windowWidth / windowHeight > aspectRatio) {
        adjustedWidth = windowHeight * aspectRatio;
    } else {
        adjustedHeight = windowWidth / aspectRatio;
    }

    document.body.style.width = `${adjustedWidth}px`;
    document.body.style.height = `${adjustedHeight}px`;

    const canvas = document.getElementById('gameCanvas');
    canvas.width = adjustedWidth;
    canvas.height = adjustedHeight;

}

window.addEventListener('load', enforceAspectRatio);
window.addEventListener('resize', enforceAspectRatio);

function drawBounces() {
    const fontSize = canvas.height * 0.05; 
    const xPosition = canvas.width * 0.02; 
    const yPosition = canvas.height * 0.24; 

    const text = `바운스: ${ball.bounceCount}`;
    const textColor = ball.bounceCount <= 0 ? 'red' : 'white'; 

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = textColor; 

    ctx.fillText(text, xPosition, yPosition);
}


// 대쉬 시작 함수
function startDash() {
    console.log("대쉬 시작");
    isDashing = true;

    // 대쉬 방향 설정
    const dashDirectionX = keys['ArrowLeft'] ? -1 : keys['ArrowRight'] ? 1 : 0;
    const dashDirectionY = keys['ArrowUp'] ? -1 : keys['ArrowDown'] ? 1 : 0;

    player.dx = dashDirectionX * DASH_SPEED;
    player.dy = dashDirectionY * DASH_SPEED;

    // 슬라이딩 이미지와 크기 변경
    if (dashDirectionX < 0) {
        currentPlayerImage = slidingImageLeft; // 왼쪽으로 슬라이딩
    } else if (dashDirectionX > 0) {
        currentPlayerImage = slidingImageRight; // 오른쪽으로 슬라이딩
    }

    // 대쉬 중 플레이어 크기 변경
    const originalWidth = player.width;
    const originalHeight = player.height;
    player.width *= 1.2; // 가로 크기를 1.2배로
    player.height *= 0.8; // 세로 크기를 0.8배로

    setTimeout(() => {
        console.log("대쉬 종료");
        isDashing = false;
        player.dx = 0;
        player.dy = 0;

        // 대쉬가 끝난 후 이미지와 크기 복원
        currentPlayerImage = dashDirectionX < 0 ? playerImageLeft : playerImageRight;
        player.width = originalWidth;
        player.height = originalHeight;

        dashCooldownRemaining = DASH_COOLDOWN; // 쿨타임 설정
        startDashCooldown();
    }, DASH_DURATION);
}





// 대쉬 쿨타임 함수
function startDashCooldown() {
    const cooldownInterval = setInterval(() => {
        dashCooldownRemaining -= 100; // 100ms씩 감소
        if (dashCooldownRemaining <= 0) {
            clearInterval(cooldownInterval);
            dashCooldownRemaining = 0; // 쿨타임 종료
        }
    }, 100);
}

//대쉬 표시
function drawDashCooldown() {
    const fontSize = canvas.height * 0.04;
    const xPosition = canvas.width * 0.02;
    const yPosition = canvas.height * 0.85; 
    const text = dashCooldownRemaining > 0
        ? `쿨타임: ${(dashCooldownRemaining / 1000).toFixed(1)}s`
        : '[Z] 대쉬 가능';

    const boxColor = dashCooldownRemaining > 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)';
    const textColor = 'white';

    ctx.font = `${fontSize}px 'Arial Black', 'Arial Bold', Gadget, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const padding = 10;
    const borderRadius = 10; 

    // 둥근 네모 박스 경로 생성
    const boxX = xPosition - padding;
    const boxY = yPosition - textHeight - padding;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;

    ctx.beginPath();
    ctx.moveTo(boxX + borderRadius, boxY); // 시작점
    ctx.lineTo(boxX + boxWidth - borderRadius, boxY); // 위쪽 라인
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius); // 오른쪽 위 모서리
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius); // 오른쪽 라인
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - borderRadius, boxY + boxHeight); // 오른쪽 아래 모서리
    ctx.lineTo(boxX + borderRadius, boxY + boxHeight); // 아래쪽 라인
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius); // 왼쪽 아래 모서리
    ctx.lineTo(boxX, boxY + borderRadius); // 왼쪽 라인
    ctx.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY); // 왼쪽 위 모서리
    ctx.closePath();

    ctx.fillStyle = boxColor;
    ctx.fill();

    // 텍스트 그리기
    ctx.fillStyle = textColor;
    ctx.fillText(text, xPosition, yPosition);
}


// 점수 표시
function drawScore() {
    const fontSize = canvas.height * 0.05; // 폰트 크기
    const xPosition = canvas.width * 0.02; // X 위치
    const yPosition = canvas.height * 0.16; // Y 위치

    const text = `점수: ${score}`;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';

    ctx.fillStyle = 'white';
    ctx.fillText(text, xPosition, yPosition);
}


function drawHighScore(highScore) {
    const fontSize = canvas.height * 0.05; 
    const xPosition = canvas.width * 0.02; 
    const yPosition = canvas.height * 0.08; 

    const text = `최고 점수: ${highScore}`;

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.fontWeight = 'bold';

    ctx.fillStyle = 'white';
    ctx.fillText(text, xPosition, yPosition);
}


// 쿨타임 표시
function drawCooldown() {
    const fontSize = canvas.height * 0.04; 
    const xPosition = canvas.width * 0.02;
    const yPosition = canvas.height * 0.95; 
    const text = canAttack
        ? '[스페이스] 공격 가능'
        : `쿨타임: ${(cooldownTimeLeft / 1000).toFixed(1)}s`;

    // 텍스트 박스 색상 설정
    const boxColor = canAttack ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    const textColor = 'white';

    // 텍스트 크기 측정
    ctx.font = `${fontSize}px 'Arial Black', 'Arial Bold', Gadget, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const padding = 10; 
    const borderRadius = 10; 

    // 둥근 네모 박스 경로 생성
    const boxX = xPosition - padding;
    const boxY = yPosition - textHeight - padding;
    const boxWidth = textWidth + padding * 2;
    const boxHeight = textHeight + padding * 2;

    ctx.beginPath();
    ctx.moveTo(boxX + borderRadius, boxY); 
    ctx.lineTo(boxX + boxWidth - borderRadius, boxY); 
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius); 
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius); 
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - borderRadius, boxY + boxHeight); 
    ctx.lineTo(boxX + borderRadius, boxY + boxHeight); 
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius); 
    ctx.lineTo(boxX, boxY + borderRadius); 
    ctx.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY); 
    ctx.closePath();
    ctx.fillStyle = boxColor;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.fillText(text, xPosition, yPosition);
}






const backgroundImage = new Image();
backgroundImage.src = 'b02.jpg';

function drawBackground() {
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = 'black'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}


window.addEventListener('resize', () => {
    resizeCanvas();
    resizeUI();
    adjustGameOverUI();
    resetGame();
});

// 애니메이션 루프
function gameLoop() {
    if (!gameRunning) return; // 게임이 실행 중이 아닐 경우 루프 중단

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); // 배경 그리기

    handlePlayerMovement();
    player.update();
    player.draw();

    ball.update(); // 공 업데이트

    drawSword(); // 검 애니메이션

    if (Math.random() < 0.02) {
        spawnEnemy(); // 적 생성
    }
    updateEnemies();

    drawScore();
    drawHighScore(getHighScore());
    drawBounces();
    drawCooldown();
    drawDashCooldown();

    gameLoopId = requestAnimationFrame(gameLoop);
}


function gameOver() {
    cancelAnimationFrame(gameLoopId); // 게임 루프 중단
    clearInterval(scoreInterval); // 점수 증가 중단
    gameRunning = false; // 게임 상태 변경

    // 점수와 최고 점수 갱신
    saveHighScore(score);
    finalScoreDisplay.textContent = score; // 최종 점수 표시
    const highScore = getHighScore();
    document.getElementById('highScoreDisplay').textContent = `최고 점수: ${highScore}`;

    // 게임 오버 창 표시
    const rankingsContainer = document.getElementById('rankings');
    rankingsContainer.style.display = 'block'; // 랭킹 창 보이기
    adjustGameOverUI(); // 랭킹 창 크기 조정
}




//게임 초기화
function resetGame() {
    score = 0;
    player.resize(); 
    player.x = canvas.width / 2 - player.width / 2; 
    player.y = canvas.height / 2 - player.height / 2; 

    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.bounceCount = ball.initialBounceCount;

    ball.adjustRadius();
    ball.setRandomDirection(); 

    enemies.length = 0; 
    isAttacking = false;
    canAttack = true;
    cooldownTimeLeft = 0;
    clearInterval(scoreInterval);
}




function startGame() {
    resizeCanvas(); // 캔버스 크기 조정
    resetGame(); // 게임 상태 초기화
    drawBackground(); // 배경 그리기
    gameRunning = true; // 게임 실행 상태 업데이트
    gameLoop(); // 게임 루프 실행
}

