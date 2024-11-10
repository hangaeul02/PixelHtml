// 캔버스 설정
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

// 타이머와 메인 유닛 설정
let timer = 0;
const speed = 5; // 이동 속도 설정

// 배경 이미지 설정
const backgroundImage = new Image();
backgroundImage.src = './preview.jpg'; // 배경 이미지 경로 설정

const Main_unit = {
    x: 10,
    y: 200,
    width: 50,
    height: 50,
    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// 키 입력 상태 추적 객체
const keys = {};

// 키가 눌렸을 때 true, 떼었을 때 false로 설정
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
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

// 배경을 그리는 함수
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// 프레임 함수
function frame() {
    requestAnimationFrame(frame);
    timer++;

    // 이전 프레임의 유닛을 지우고 새로운 위치에 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    drawBackground();

    // 캐릭터 위치 업데이트
    updatePosition();

    // 메인 유닛 그리기
    Main_unit.draw();
}

// 애니메이션 시작
frame();
