import { Ball } from './ball.js';
import { collisionChecking } from './collision.js';


const BALL_WIDTH = 28;
const BALL_HEIGHT = 28;
export class Desk {
    constructor() {}

    async init({ scene, cover }) {
        this.balls = [];
        this.currentBallsLength = 0;
        this.score = 0;
        this.scene = scene;
        this.sceneCtx = scene.getContext('2d');
        this.cover = cover;
        this.coverCtx = cover.getContext('2d');
        await this.initBall();

        cover.addEventListener('mousemove', e => {
            const x = e.clientX;
            const y = e.clientY;
            this.coverCtx.clearRect(0, 0, this.scene.width, this.scene.height);
            this.coverCtx.beginPath();
            this.coverCtx.moveTo(this.balls[0].x, this.balls[0].y);
            this.coverCtx.lineTo(x, y);
            this.coverCtx.lineWidth = 2;
            this.coverCtx.strokeStyle = 'white';
            this.coverCtx.stroke();

            this.coverCtx.beginPath();
            this.coverCtx.arc(x , y, BALL_HEIGHT / 2, 0, 2 * Math.PI);
            this.coverCtx.stroke();
        });

        cover.addEventListener('click', e => {
            const x = e.clientX;
            const y = e.clientY;
            const F = 15;
            const whiteBall = this.balls[0];

            const vecX = x - whiteBall.x;
            const vecY = y - whiteBall.y;
            const l = Math.sqrt(vecX ** 2 + vecY ** 2);
            whiteBall.vx = vecX / l * F;
            whiteBall.vy = vecY / l * F;
            this.cover.style.zIndex = -1;
            this.coverCtx.clearRect(0, 0, this.scene.width, this.scene.height);
            this.currentBallsLength = this.balls.length;
            this.run();
        });
    }

    async initBall() {
        const ball = new Ball();
        const promises = [ball.init({ w: BALL_WIDTH, h: BALL_HEIGHT, x: 255, y: this.scene.height / 2, vx: 0, vy: 0, url: '/src/imgs/white-ball.png', type: 'white' })];
        for (let col = 0; col < 4; col++) {
            for (let i = 0; i < col + 1; i++) {
                const ball = new Ball();
                const promise = ball.init({ w: BALL_WIDTH, h: BALL_HEIGHT, x: 700 + col * BALL_WIDTH, y: this.scene.height / 2 + i * BALL_HEIGHT - col * BALL_HEIGHT / 2, vx: 0, vy: 0, url: '/src/imgs/yellow-ball.png' });
                promises.push(promise);
            }
        }
        this.balls = await Promise.all(promises);
        this.run(true);
    }

    async run(isInit = false) {
        let v = 0;
        this.clear();
        for (let i = 0; i < this.balls.length; i++) {
            const ball = this.balls[i];
            const { vx, vy } = ball;
            v = v || vx || vy;
            ball.run();
            this.draw(ball);
            if (ball.vx || ball.vy) {
                this.collision(ball, i);
            }
        }
        if (isInit) return;
        // 全部速度为0停止动画
        if (v === 0) {
            if (this.balls[0].type !== 'white') {
                const ball = new Ball();
                await ball.init({ w: BALL_WIDTH, h: BALL_HEIGHT, x: 255, y: this.scene.height / 2, vx: 0, vy: 0, url: '/src/imgs/white-ball.png', type: 'white' });
                this.draw(ball);
                this.balls.unshift(ball);
            }
            console.log(this.currentBallsLength, this.balls.length);
            if (this.currentBallsLength > this.balls.length) {
                await this.toast('牛逼牛逼');
                this.currentBallsLength = this.balls.length;
            }
            else {
                await this.toast('不行啊兄弟');
            }
            this.cover.style.zIndex = 9;
            return;
        };
        requestAnimationFrame(() => this.run());
    }

    // 得分
    updateScore() {
        this.score ++;
        const $score = document.querySelector('.score');
        $score.textContent = this.score;
    }

    // 进球
    isGoal(ball) {
        const y = ball.y + ball.vy;
        const x = ball.x + ball.vx;
        const width = this.scene.width;
        const height = this.scene.height;
        const diagonalCaveWidth = 60;
        const centerCaveWidth = 50;
        return (
            (y <= diagonalCaveWidth && x <= diagonalCaveWidth) ||
            (y >= height - diagonalCaveWidth && x <= diagonalCaveWidth) ||
            (y <= centerCaveWidth && x <= width / 2 + centerCaveWidth / 2 && x >= width / 2 - centerCaveWidth / 2) ||
            (y >= height - centerCaveWidth && x <= width / 2 + centerCaveWidth / 2 && x >= width / 2 - centerCaveWidth / 2) ||
            (y <= diagonalCaveWidth && x >= width - diagonalCaveWidth) ||
            (y >= height - diagonalCaveWidth && x >= width - diagonalCaveWidth)
        );
    }

    // 左右边缘
    isLeftRightBorder(ball) {
        const y = ball.y + ball.vy;
        const x = ball.x + ball.vx;
        const width = this.scene.width;
        const height = this.scene.height;
        const diagonalCaveWidth = 50;
        return (
            (x <= diagonalCaveWidth && (y >= diagonalCaveWidth || y <= height - diagonalCaveWidth)) ||
            (x >= width - diagonalCaveWidth && (y >= diagonalCaveWidth || y <= height - diagonalCaveWidth))
        );
    }

    // 上下边缘
    isTopBottomBorder(ball) {
        const y = ball.y + ball.vy;
        const x = ball.x + ball.vx;
        const width = this.scene.width;
        const height = this.scene.height;
        const diagonalCaveWidth = 50;
        const centerCaveWidth = 50;
        return (
            (
                (x >= diagonalCaveWidth) &&
                (x <= width / 2 - centerCaveWidth / 2) &&
                (y <= diagonalCaveWidth || y >= height - diagonalCaveWidth)
            ) ||
            (
                (x >= width / 2 + centerCaveWidth / 2) &&
                (x <= width - diagonalCaveWidth) &&
                (y <= diagonalCaveWidth || y >= height - diagonalCaveWidth)
            )
        );
    }

    collision(ball, index) {
        if (this.isGoal(ball)) {
            for (let i = 0; i < this.balls.length; i++) {
                if (this.balls[i].id === ball.id) {
                    this.balls.splice(i, 1);
                    if (i !== 0) this.updateScore();
                    return;
                }
            }
        }

        if (this.isLeftRightBorder(ball)) {
            ball.vx = -ball.vx;
        }

        if (this.isTopBottomBorder(ball)) {
            ball.vy = -ball.vy;
        }

        for (let i = 0; i < this.balls.length; i++) {
            if (index === i) {
                continue;
            }
            const nextBall = this.balls[i];
            const rc = Math.sqrt((ball.x - nextBall.x) ** 2 + (ball.y - nextBall.y) ** 2);
            if (rc < ball.w) {
                collisionChecking(ball, nextBall, rc);
            }
        }
    }

    clear() {
        this.sceneCtx.clearRect(0, 0, this.scene.width, this.scene.height);
    }

    draw({ image, x, y, w, h }) {
        this.sceneCtx.drawImage(image, x - w / 2, y - h / 2, w, h);
    }

    toast(msg) {
        const $toast = document.querySelector('.toast');
        $toast.textContent = msg;
        $toast.style.opacity = 1;
        return new Promise(resolve => {
            setTimeout(() => {
                $toast.style.opacity = 0;
                resolve();
            }, 1000);
        });
        
    }
}