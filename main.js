const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 20;
const SWORD_RANGE = 60; // 검의 길이 (늘림)
const ATTACK_DURATION = 10; // 공격 애니메이션 지속 프레임
const ATTACK_COOLDOWN = 1500; // 공격 쿨타임 (밀리초)

let score = 0;
let isAttacking = false; // 공격 상태
let attackFrame = 0; // 현재 공격 애니메이션 프레임
let attackAngle = 0; // 검의 휘두르기 각도
let canAttack = true; // 공격 가능 여부
let cooldownTimeLeft = 0; // 남은 쿨타임 (밀리초)

// 공 객체
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    dx: 3, // 초기 x 방향 속도
    dy: 3, // 초기 y 방향 속도
    initialBounceCount: 2, // 초기 바운스 횟수
    bounceCount: 2, // 벽에서 튕길 수 있는 남은 횟수
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'orange';
        ctx.fill();
        ctx.closePath();

        // 남은 횟수 표시
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`Bounces: ${this.bounceCount}`, 20, canvas.height - 20);
    },
    update() {
        // 이동
        this.x += this.dx;
        this.y += this.dy;

        // 벽 충돌 처리
        if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
            this.dx *= -1;
            this.handleBounce();
        }
        if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
            this.dy *= -1;
            this.handleBounce();
        }

        // 적과 충돌 체크
        enemies.forEach((enemy, index) => {
            const distX = enemy.x + enemy.width / 2 - this.x;
            const distY = enemy.y + enemy.height / 2 - this.y;
            const distance = Math.sqrt(distX ** 2 + distY ** 2);

            if (distance < this.radius + ENEMY_SIZE / 2) {
                enemies.splice(index, 1); // 적 제거
                score += 10; // 점수 증가
            }
        });

        this.draw();
    },
    handleBounce() {
        // 남은 튕김 횟수 감소
        this.bounceCount -= 1;

        if (this.bounceCount < 0) {
            // 게임 오버 처리
            alert(`Game Over! Your Score: ${score}`);
            document.location.reload();
        }
    },
    reflect(angle) {
        // 공격에 의해 공의 방향 변경
        this.dx = Math.cos(angle) * Math.sqrt(this.dx ** 2 + this.dy ** 2);
        this.dy = Math.sin(angle) * Math.sqrt(this.dx ** 2 + this.dy ** 2);
        this.bounceCount = this.initialBounceCount; // 바운스 횟수 초기화
    }
};

// 플레이어
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.x += this.dx;
        this.y += this.dy;

        // 화면 밖으로 나가지 않도록 제한
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    }
};

// 적 리스트
const enemies = [];

// 키 입력 상태 추적 객체
const keys = {};

// 키 입력 처리
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // 공격 키 (스페이스바)
    if (e.key === ' ' && !isAttacking && canAttack) {
        const closestEnemy = getClosestEnemy();
        if (closestEnemy) {
            isAttacking = true;
            attackFrame = 0;
            attackAngle = Math.atan2(
                closestEnemy.y + closestEnemy.height / 2 - (player.y + player.height / 2),
                closestEnemy.x + closestEnemy.width / 2 - (player.x + player.width / 2)
            ); // 가까운 적을 향한 각도 계산
            canAttack = false; // 쿨타임 적용
            cooldownTimeLeft = ATTACK_COOLDOWN; // 쿨타임 초기화

            // 공 반사 처리
            const ballDistX = ball.x - (player.x + player.width / 2);
            const ballDistY = ball.y - (player.y + player.height / 2);
            const ballDistance = Math.sqrt(ballDistX ** 2 + ballDistY ** 2);
            if (ballDistance < SWORD_RANGE + ball.radius) {
                ball.reflect(attackAngle); // 공격 방향으로 공 반사
            }

            // 쿨타임 카운트다운
            const cooldownInterval = setInterval(() => {
                cooldownTimeLeft -= 100; // 100ms씩 감소
                if (cooldownTimeLeft <= 0) {
                    clearInterval(cooldownInterval);
                    canAttack = true; // 공격 가능
                }
            }, 100);
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 가장 가까운 적 찾기
function getClosestEnemy() {
    let closestEnemy = null;
    let minDistance = Infinity;

    enemies.forEach((enemy) => {
        const distX = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
        const distY = player.y + player.height / 2 - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            closestEnemy = enemy;
        }
    });

    return closestEnemy;
}

// 검 공격 로직
function drawSword() {
    if (!isAttacking) return;

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    // 공격 애니메이션 단계에 따라 검의 끝점 이동
    const angle = attackAngle + (Math.PI / 4) * Math.sin((Math.PI / ATTACK_DURATION) * attackFrame);
    const swordX = centerX + Math.cos(angle) * SWORD_RANGE;
    const swordY = centerY + Math.sin(angle) * SWORD_RANGE;

    // 검의 모습 그리기
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(swordX, swordY);
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 공격 범위 내 적 제거
    enemies.forEach((enemy, index) => {
        const distX = enemy.x + enemy.width / 2 - swordX;
        const distY = enemy.y + enemy.height / 2 - swordY;
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        if (distance < ENEMY_SIZE) {
            enemies.splice(index, 1); // 적 제거
            score += 10; // 점수 증가
        }
    });

    // 공격 애니메이션 진행
    attackFrame++;
    if (attackFrame > ATTACK_DURATION) {
        isAttacking = false; // 공격 종료
    }
}

// 플레이어 이동 처리
function handlePlayerMovement() {
    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowUp']) player.dy = -PLAYER_SPEED;
    if (keys['ArrowDown']) player.dy = PLAYER_SPEED;
    if (keys['ArrowLeft']) player.dx = -PLAYER_SPEED;
    if (keys['ArrowRight']) player.dx = PLAYER_SPEED;
}

// 적 생성
function spawnEnemy() {
    let x, y;
    let minDistance = 150; // 플레이어와 최소 거리 (150 픽셀)

    do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;

        // 플레이어와의 거리 계산
        const distX = x - (player.x + player.width / 2);
        const distY = y - (player.y + player.height / 2);
        const distance = Math.sqrt(distX ** 2 + distY ** 2);

        // 거리가 충분히 떨어져 있으면 탈출
        if (distance >= minDistance) break;

    } while (true);

    const isRanged = score >= 500 && Math.random() < 0.3; // 점수가 500 이상이고 30% 확률로 원거리 몹 생성

    enemies.push({
        x,
        y,
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        isRanged: isRanged, // 원거리 몹 여부
        dx: 0,
        dy: 0,
        bullets: [], // 원거리 몹의 발사체
        draw() {
            ctx.fillStyle = this.isRanged ? 'purple' : 'red'; // 원거리 몹은 보라색, 일반 몹은 빨간색
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.dx = Math.cos(angle) * ENEMY_SPEED;
            this.dy = Math.sin(angle) * ENEMY_SPEED;

            if (!this.isRanged) {
                // 근접 몹 움직임
                this.x += this.dx;
                this.y += this.dy;
            } else {
                // 원거리 몹 발사체 생성
                if (Math.random() < 0.02) { // 발사체 생성 확률
                    this.bullets.push({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        dx: Math.cos(angle) * 5, // 발사체 속도
                        dy: Math.sin(angle) * 5,
                        draw() {
                            ctx.fillStyle = 'yellow';
                            ctx.beginPath();
                            ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
                            ctx.fill();
                        },
                        update() {
                            this.x += this.dx;
                            this.y += this.dy;

                            // 발사체가 플레이어와 충돌하면 게임 종료
                            if (
                                this.x > player.x &&
                                this.x < player.x + player.width &&
                                this.y > player.y &&
                                this.y < player.y + player.height
                            ) {
                                alert(`Game Over! Your Score: ${score}`);
                                document.location.reload();
                            }

                            this.draw();
                        }
                    });
                }

                // 원거리 몹의 발사체 업데이트
                this.bullets.forEach((bullet, index) => {
                    bullet.update();

                    // 발사체가 화면 밖으로 나가면 제거
                    if (
                        bullet.x < 0 ||
                        bullet.x > canvas.width ||
                        bullet.y < 0 ||
                        bullet.y > canvas.height
                    ) {
                        this.bullets.splice(index, 1);
                    }
                });
            }

            this.draw();
        }
    });
}



// 적 이동 및 그리기
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.update();

        // 플레이어와 충돌 감지
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            alert(`Game Over! Your Score: ${score}`);
            document.location.reload();
        }

        enemy.draw();
    });
}

// 점수 표시
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// 쿨타임 표시
function drawCooldown() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    if (canAttack) {
        ctx.fillText('Cooldown: READY', canvas.width - 150, canvas.height - 20);
    } else {
        ctx.fillText(`Cooldown: ${(cooldownTimeLeft / 1000).toFixed(1)}s`, canvas.width - 150, canvas.height - 20);
    }
}

// 배경을 그리는 함수
function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

setInterval(() => {
    score += 1; // 점수 1 증가
}, 1000);

// 게임 루프
function gameLoop() {
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
    drawCooldown();

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
