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
let currentPage = 0;
const instructionsTitle = document.getElementById('instructionsTitle');
const instructionsText = document.getElementById('instructionsText');
const instructionsImage = document.getElementById('instructionsImage');
const pageIndicator = document.getElementById('pageIndicator');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');

const instructionsPages = [
    {
        title: "게임 개요",
        text: "BounceQuest는 빠른 판단력과 반사 신경을 요구하는 아케이드 액션 게임입니다. 공의 바운스 횟수를 유지하며 적을 물리치고 최고의 점수를 획득하세요!",
        image: "game_icon.png"
    },
    {
        title: "게임 목표",
        text: "공의 바운스 횟수가 0이 되지 않도록 유지하며 적을 처치해 최대한 높은 점수를 기록하세요.",
        image: "goal.png"
    },
    {
        title: "조작법",
        text: "이동: 화살표 키 (←, ↑, →, ↓)<br>공격: 스페이스 바<br>대쉬: Z 키 (빠르게 이동 및 위험 회피)",
        image: "키.png"
    },
    {
        title: "게임 규칙",
        text: "공이 화면 가장자리에 닿으면 바운스 횟수가 감소합니다. 바운스 횟수가 0이 되면 게임 오버입니다. 적은 플레이어를 추적하며 접촉하면 게임이 종료됩니다.",
        image: "rules.png"
    },
    {
        title: "점수 시스템",
        text: "적을 처치하면 10점을 획득합니다. Top 10 점수에 도전해보세요!",
        image: "score.png"
    },
    {
        title: "게임 팁",
        text: "1. 공을 효율적으로 튕기며 바운스 횟수를 관리하세요.<br>2. 적을 빠르게 처치해 점수를 올리세요.<br>3. 무적 대쉬를 사용해 위기 상황을 회피하세요.",
        image: "tips.png"
    },
    {
        title: "게임 종료",
        text: "공의 바운스 횟수가 0이 되거나 적과 충돌하면 게임 오버입니다. 자신의 점수를 기록하고 랭킹에 도전하세요!",
        image: "gameover.png"
    }
];

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
    document.getElementById('gameOverContainer').style.display = 'none'; // 게임 오버 창 숨김
    canvas.style.display = 'block'; // 캔버스 다시 보이기
    resetGame();
    startGame();
});


mainMenuButton.addEventListener('click', () => {
    document.getElementById('gameOverContainer').style.display = 'none'; // 게임 오버 창 숨김
    uiContainer.style.display = 'flex'; // 메인 메뉴 보이기
    canvas.style.display = 'none'; // 게임 캔버스 숨김
    document.getElementById('blackOverlay').style.display = 'none'; // 배경 오버레이 숨김

    resetGame(); // 게임 상태 초기화
});




window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    if (e.key === ' ' && !isAttacking && canAttack) {
        const closestTarget = getClosestTarget();
        if (closestTarget) {
            isAttacking = true;
            attackFrame = 0;

            if (closestTarget.type === 'enemy' || closestTarget.type === 'ball') {
                const target = closestTarget.target;
                attackAngle = Math.atan2(
                    target.y + (target.height || target.radius) / 2 - (player.y + player.height / 2),
                    target.x + (target.width || target.radius) / 2 - (player.x + player.width / 2)
                );
            }

            currentPlayerImage = player.direction === 'left' ? attackImageLeft : attackImageRight;

            setTimeout(() => {
                isAttacking = false; 
                currentPlayerImage = player.direction === 'left' ? playerImageLeft : playerImageRight;
            }, ATTACK_DURATION * 150); 

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
    document.getElementById('gameOverContainer').style.display = 'none';
    resetGame();
    startGame();
});

let isDashing = false; 
const DASH_SPEED = 10; 
const DASH_DURATION = 500; 
const DASH_COOLDOWN = 5000; 
let dashCooldownRemaining = 0; 

const PLAYER_SPEED = 5;
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

const swordImage = new Image();
swordImage.src = '검.png'; 

const attackImageRight = new Image();3
attackImageRight.src = '공격R.png'; 

const attackImageLeft = new Image();
attackImageLeft.src = '공격L.png'; 

let score = 0;
let isAttacking = false; 
let attackFrame = 0; 
let attackAngle = 0; 
let canAttack = true; 
let cooldownTimeLeft = 0; 
let gameRunning = false; 
let scoreInterval; 
let gameLoopId; 

function showGameOver(score) {
    const gameOverContainer = document.getElementById('gameOverContainer');
    const finalScoreDisplay = document.getElementById('finalScore');
    const highScoreDisplay = document.getElementById('highScoreDisplay');

    finalScoreDisplay.textContent = score;

    const highScore = Math.max(score, getHighScore());
    highScoreDisplay.textContent = highScore;
    localStorage.setItem('highScore', highScore);

    gameOverContainer.style.display = 'block';
}


function resetGameOver() {
    const gameOverContainer = document.getElementById('gameOverContainer');
    gameOverContainer.style.display = 'none';
}


function updateInstructionsPage() {
    const page = instructionsPages[currentPage];
    instructionsTitle.textContent = page.title;
    instructionsText.innerHTML = page.text;
    instructionsImage.src = page.image;
    pageIndicator.textContent = `${currentPage + 1} / ${instructionsPages.length}`;

    prevPage.disabled = currentPage === 0;
    nextPage.disabled = currentPage === instructionsPages.length - 1;
}

prevPage.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        updateInstructionsPage();
    }
});

nextPage.addEventListener('click', () => {
    if (currentPage < instructionsPages.length - 1) {
        currentPage++;
        updateInstructionsPage();
    }
});

// 초기 페이지 로드
updateInstructionsPage();

function saveRanking(score) {
    let rankings = JSON.parse(localStorage.getItem('rankings')) || [];

    if (rankings.length < 10 || rankings[rankings.length - 1].score < score) {
        const nickname = prompt('축하합니다! 랭킹에 진입했습니다. 닉네임을 입력하세요:');

        if (nickname !== null && nickname.trim() !== '') {
            rankings.push({ score, nickname: nickname.trim() });
            rankings.sort((a, b) => b.score - a.score);
            rankings = rankings.slice(0, 10);
            localStorage.setItem('rankings', JSON.stringify(rankings));
        } else {
            alert('닉네임이 입력되지 않아 점수가 기록되지 않았습니다.');
        }
    }
}


function displayRankings() {
    const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
    const rankingList = document.getElementById('rankingList');
    rankingList.innerHTML = ''; // 기존 내용 초기화

    if (rankings.length === 0) {
        rankingList.innerHTML = '<li>등록된 랭킹이 없습니다.</li>';
        return;
    }

    rankings.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}등: ${entry.nickname || '익명'} - ${entry.score} 점`;
        rankingList.appendChild(li);
    });

    // 랭킹 팝업 표시
    const settingsPopup = document.getElementById('settings');
    settingsPopup.style.display = 'block';
}
document.getElementById('backFromSettings').addEventListener('click', () => {
    const settingsPopup = document.getElementById('settings');
    settingsPopup.style.display = 'none';
});
document.getElementById('settingsButton').addEventListener('click', () => {
    displayRankings();
});


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

    // 크기만 조정
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

    rankingsContainer.style.width = `${Math.max(400, scaleFactor * 800)}px`; 
    rankingsContainer.style.padding = `${scaleFactor * 20}px`; 
    rankingsContainer.style.borderRadius = `${scaleFactor * 10}px`; 

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
        if (this.bounceCount <= 0) {
            gameOver();
            return; 
        }
        this.bounceCount = Math.max(this.bounceCount - 1, 0); 
        this.speed = Math.max(this.speed * 0.6, MIN_SPEED);
        this.updateVelocity();
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
        this.dx = Math.cos(angle) * this.speed; 
        this.dy = Math.sin(angle) * this.speed;
    },

    adjustRadius() {
        this.radius = Math.min(canvas.width, canvas.height) * 0.07; 
    },

    setRandomDirection() {
        const angle = Math.random() * Math.PI * 2; 
        this.dx = Math.cos(angle) * this.speed; 
        this.dy = Math.sin(angle) * this.speed;
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
    x: canvas.width * 0.2, 
    y: canvas.height * 0.2, 
    width: 0, 
    height: 0,
    direction: 'right', 
    
    draw() {
        const image = this.direction === 'left' ? playerImageLeft : playerImageRight;
        if (isAttacking) {
            imageToDraw = player.direction === 'left' ? attackImageLeft : attackImageRight;
        }
        ctx.drawImage(currentPlayerImage, this.x, this.y, this.width, this.height); 
    },

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.dx < 0) {
            this.direction = 'left';
        } else if (this.dx > 0) {
            this.direction = 'right';
        }

        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    },

    resize() {
        this.width = canvas.width * 0.03; 
        this.height = canvas.height * 0.09; 
        this.x = Math.min(this.x, canvas.width - this.width); 
        this.y = Math.min(this.y, canvas.height - this.height); 
    }
};

function getClosestTarget() {
    let closestTarget = null;
    let minDistance = Infinity;

    enemies.forEach((enemy) => {
        const distX = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
        const distY = player.y + player.height / 2 - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            closestTarget = { type: 'enemy', target: enemy };
        }
    });

    const ballDistX = player.x + player.width / 2 - ball.x;
    const ballDistY = player.y + player.height / 2 - ball.y;
    const ballDistance = Math.sqrt(ballDistX ** 2 + ballDistY ** 2);

    if (ballDistance < minDistance) {
        closestTarget = { type: 'ball', target: ball };
    }

    return closestTarget; 
}

function drawPlayer() {
    if (isAttacking) {
        currentPlayerImage = player.direction === 'left' ? attackImageLeft : attackImageRight;
    } else {
        currentPlayerImage = player.direction === 'left' ? playerImageLeft : playerImageRight;
    }

    ctx.drawImage(currentPlayerImage, player.x, player.y, player.width, player.height);
}


function drawSword() {
    if (!isAttacking) return;

    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const swordWidth = canvas.width * 0.15;
    const swordHeight = canvas.height * 0.3;

    const swordX = playerCenterX + Math.cos(attackAngle) * SWORD_RANGE;
    const swordY = playerCenterY + Math.sin(attackAngle) * SWORD_RANGE;

    const swordAngle = attackAngle + Math.PI / 2;

    ctx.save();
    ctx.translate(playerCenterX, playerCenterY);
    ctx.rotate(swordAngle);
    ctx.drawImage(
        swordImage,
        -swordWidth / 2,
        -SWORD_RANGE - swordHeight / 2,
        swordWidth,
        swordHeight
    );
    ctx.restore();

    const swordTopLeftX = swordX - swordWidth / 2;
    const swordTopLeftY = swordY - swordHeight / 2;
    const swordBottomRightX = swordX + swordWidth / 2;
    const swordBottomRightY = swordY + swordHeight / 2;

    const ballColliding =
        ball.x + ball.radius > swordTopLeftX &&
        ball.x - ball.radius < swordBottomRightX &&
        ball.y + ball.radius > swordTopLeftY &&
        ball.y - ball.radius < swordBottomRightY;

    if (ballColliding) {
        const newAngle = Math.atan2(ball.y - playerCenterY, ball.x - playerCenterX);
        ball.dx = Math.cos(newAngle) * ball.speed * 1.1; 
        ball.dy = Math.sin(newAngle) * ball.speed * 1.1;
        ball.bounceCount = ball.initialBounceCount; 
        ball.increaseSpeed(1.1);
    }

    enemies.forEach((enemy, index) => {
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;

        const enemyColliding =
            enemyCenterX > swordTopLeftX &&
            enemyCenterX < swordBottomRightX &&
            enemyCenterY > swordTopLeftY &&
            enemyCenterY < swordBottomRightY;

        if (enemyColliding) {
            enemies.splice(index, 1);
            score += 10;
        }
    });

    attackFrame++;
    if (attackFrame > ATTACK_DURATION) {
        isAttacking = false; 
        currentPlayerImage = player.direction === 'left' ? playerImageLeft : playerImageRight;
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
                                !isDashing && 
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
    const dashDirectionX = keys['ArrowLeft'] ? -1 : keys['ArrowRight'] ? 1 : 0;
    const dashDirectionY = keys['ArrowUp'] ? -1 : keys['ArrowDown'] ? 1 : 0;

    player.dx = dashDirectionX * DASH_SPEED;
    player.dy = dashDirectionY * DASH_SPEED;

    if (dashDirectionX < 0) {
        currentPlayerImage = slidingImageLeft; 
    } else if (dashDirectionX > 0) {
        currentPlayerImage = slidingImageRight; 
    }

    const originalWidth = player.width;
    const originalHeight = player.height;
    player.width *= 1.2;
    player.height *= 0.8; 

    setTimeout(() => {
        console.log("대쉬 종료");
        isDashing = false;
        player.dx = 0;
        player.dy = 0;

        currentPlayerImage = dashDirectionX < 0 ? playerImageLeft : playerImageRight;
        player.width = originalWidth;
        player.height = originalHeight;

        dashCooldownRemaining = DASH_COOLDOWN; 
        startDashCooldown();
    }, DASH_DURATION);
}


// 대쉬 쿨타임 함수
function startDashCooldown() {
    const cooldownInterval = setInterval(() => {
        dashCooldownRemaining -= 100; 
        if (dashCooldownRemaining <= 0) {
            clearInterval(cooldownInterval);
            dashCooldownRemaining = 0; 
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


// 점수 표시
function drawScore() {
    const fontSize = canvas.height * 0.05; 
    const xPosition = canvas.width * 0.02; 
    const yPosition = canvas.height * 0.16; 

    const text = `점수: ${score}`; 

    ctx.font = `${fontSize}px Arial`; 
    ctx.fillStyle = 'white';
    ctx.fillText(text, xPosition, yPosition); 
}

function drawHighScore(highScore) {
    const fontSize = canvas.height * 0.05; 
    const xPosition = canvas.width * 0.02; 
    const yPosition = canvas.height * 0.08; 

    const text = `최고 점수: ${highScore}`; 

    ctx.font = `bold ${fontSize}px Arial`; 
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

    const boxColor = canAttack ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
    const textColor = 'white';

    // 박스 크기 계산
    ctx.font = `${fontSize}px 'Arial Black', Gadget, sans-serif`;
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize;
    const padding = 10; 
    const borderRadius = 10;

    // 박스 위치와 크기
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

function gameLoop() {
    if (!gameRunning) return; 
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    handlePlayerMovement();
    player.update();
    player.draw();

    ball.update();

    drawSword(); 

    if (Math.random() < 0.02) {
        spawnEnemy(); 
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
    cancelAnimationFrame(gameLoopId);
    clearInterval(scoreInterval);
    gameRunning = false;
    saveRanking(score);
    showGameOver(score);
    saveHighScore(score);

    const highScore = getHighScore();
    document.getElementById('highScoreDisplay').textContent = `최고 점수: ${highScore}`;
    document.getElementById('gameOverContainer').style.display = 'block';
}



function resetGame() {
    score = 0;

    player.resize();
    player.x = canvas.width / 2 - player.width / 2; 
    player.y = canvas.height / 2 - player.height / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.bounceCount = ball.initialBounceCount;

    const initialSpeed = Math.min(canvas.width, canvas.height) * 0.002; 
    ball.setSpeed(initialSpeed); 
    ball.setRandomDirection(); 
    ball.adjustRadius();

    enemies.length = 0;

    isAttacking = false;
    canAttack = true;
    cooldownTimeLeft = 0;
    dashCooldownRemaining = 0;

    clearInterval(scoreInterval);
}



function startGame() {
    resizeCanvas(); 
    resetGame(); 
    drawBackground(); 
    gameRunning = true; 
    gameLoop(); 
}
