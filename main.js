// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 20;

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 20;
const SWORD_RANGE = 50; // 검의 길이
const ATTACK_DURATION = 10; // 공격 애니메이션 지속 프레임

let score = 0;
let isAttacking = false; // 공격 상태
let attackFrame = 0; // 현재 공격 애니메이션 프레임
let attackAngle = 0; // 검의 휘두르기 각도


// 플레이어 메인 유닛
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

// 키 입력 상태 추적 객체
const keys = {};
// 키 입력 상태 추적 객체
const keys = {};

// 키가 눌렸을 때 true, 떼었을 때 false로 설정
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;

    // 공격 키 (스페이스바)
    if (e.key === ' ' && !isAttacking) {
        const closestEnemy = getClosestEnemy();
        if (closestEnemy) {
            isAttacking = true;
            attackFrame = 0;
            attackAngle = Math.atan2(
                closestEnemy.y + closestEnemy.height / 2 - (player.y + player.height / 2),
                closestEnemy.x + closestEnemy.width / 2 - (player.x + player.width / 2)
            ); // 가까운 적을 향한 각도 계산
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Main_unit의 위치 업데이트 함수
function updatePosition() {
    if (keys['ArrowUp'] && Main_unit.y > 0) {
        Main_unit.y -= speed;
    }
    if (keys['ArrowDown'] && Main_unit.y < canvas.height - Main_unit.height) {
        Main_unit.y += speed;
    }
    if (keys['ArrowLeft'] && Main_unit.x > 0) {
        Main_unit.x -= speed;
    }
    if (keys['ArrowRight'] && Main_unit.x < canvas.width - Main_unit.width) {
        Main_unit.x += speed;
    }
}
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// 플레이어 이동 처리
function handlePlayerMovement() {
    player.dx = 0;
    player.dy = 0;

    if (keys['ArrowUp']) player.dy = -PLAYER_SPEED;
    if (keys['ArrowDown']) player.dy = PLAYER_SPEED;
    if (keys['ArrowLeft']) player.dx = -PLAYER_SPEED;
    if (keys['ArrowRight']) player.dx = PLAYER_SPEED;
}

// 적 리스트
const enemies = [];

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
// 적 생성
function spawnEnemy() {
    const x = Math.random() < 0.5 ? 0 : canvas.width; // 좌측 또는 우측에서 시작
    const y = Math.random() * canvas.height;
    enemies.push({
        x,
        y,
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        dx: 0,
        dy: 0,
        draw() {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            // 플레이어를 향한 각도 계산
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.dx = Math.cos(angle) * ENEMY_SPEED;
            this.dy = Math.sin(angle) * ENEMY_SPEED;

            // 위치 업데이트
            this.x += this.dx;
            this.y += this.dy;
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

// 배경을 그리는 함수
function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 게임 루프
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    handlePlayerMovement();
    player.update();
    player.draw();
    drawSword();

    if (Math.random() < 0.02) {
        spawnEnemy();
    }

    updateEnemies();

    drawScore();

    requestAnimationFrame(gameLoop);
}

// 게임 시작
gameLoop();
