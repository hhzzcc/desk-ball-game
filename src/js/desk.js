import { Ball } from './ball.js';
import { collisionChecking } from './collision.js';


const BALL_WIDTH = 26;
const BALL_HEIGHT = 26;
export class Desk {
    constructor() {}

    async init({ scene, cover }) {
        this.balls = [];
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
            this.coverCtx.moveTo(this.balls[0].cx, this.balls[0].cy);
            this.coverCtx.lineTo(x, y);
            this.coverCtx.lineWidth = 2;
            this.coverCtx.strokeStyle = 'white';
            this.coverCtx.stroke();
        });

        cover.addEventListener('click', e => {
            const x = e.clientX;
            const y = e.clientY;
            const F = 12;
            const whiteBall = this.balls[0];

            const vecX = x - whiteBall.cx;
            const vecY = y - whiteBall.cy;
            const l = Math.sqrt(vecX ** 2 + vecY ** 2);
            whiteBall.vx = vecX / l * F;
            whiteBall.vy = vecY / l * F;
            this.cover.style.zIndex = -1;
            this.coverCtx.clearRect(0, 0, this.scene.width, this.scene.height);
            this.run();
        });
    }

    async initBall() {
        const ball = new Ball();
        const promises = [ball.init({ w: BALL_WIDTH, h: BALL_HEIGHT, x: 142, y: 200, vx: 0, vy: 0, url: '../imgs/white-ball.png', type: 'white' })];
        for (let col = 0; col < 4; col++) {
            for (let i = 0; i < col + 1; i++) {
                const ball = new Ball();
                const promise = ball.init({ w: BALL_WIDTH, h: BALL_HEIGHT, x: 400 + col * BALL_WIDTH, y: 200 + i * BALL_HEIGHT - col * BALL_HEIGHT / 2, vx: 0, vy: 0, url: '../imgs/yellow-ball.png' });
                promises.push(promise);
            }
        }
        this.balls = await Promise.all(promises);
        this.run();
    }

    async run() {
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
        // 全部速度为0停止动画
        if (v === 0) {
            if (this.balls[0].type !== 'white') {
                const ball = new Ball();
                await ball.init({ w: BALL_WIDTH, h: BALL_HEIGHT, x: 142, y: 200, vx: 0, vy: 0, url: '../imgs/white-ball.png', type: 'white' });
                this.draw(ball);
                this.balls.unshift(ball);
            }
            this.cover.style.zIndex = 9;
            return;
        };
        requestAnimationFrame(() => this.run());
    }

    // 进球
    isGoal(ball) {
        const y = ball.y + ball.vy;
        const x = ball.x + ball.vx;
        return (
            (y <= 35 && x <= 40) ||
            (y >= this.scene.height - 55 && x <= 40) ||
            (y <= 35 && x <= this.scene.width / 2 && x >= this.scene.width / 2 - 15) ||
            (y >= this.scene.height - 55 && x <= this.scene.width / 2 && x >= this.scene.width / 2 - 15) ||
            (y <= 35 && x >= this.scene.width - 55) ||
            (y >= this.scene.height - 55 && x >= this.scene.width - 55)
        );
    }

    collision(ball, index) {
        if (this.isGoal(ball)) {
            for (let i = 0; i < this.balls.length; i++) {
                if (this.balls[i].id === ball.id) {
                    this.balls.splice(i, 1);
                    return;
                }
            }
        }
        if ((ball.y + ball.vy) <= 30 || (ball.y + ball.vy) >= this.scene.height - 45) {
            ball.vy = -ball.vy;
        }

        if ((ball.x + ball.vx) <= 30 || (ball.x + ball.vx) >= this.scene.width - 45) {
            ball.vx = -ball.vx;
        }
        for (let i = 0; i < this.balls.length; i++) {
            if (index === i) {
                continue;
            }
            const nextBall = this.balls[i];
            const rc = Math.sqrt((ball.cx - nextBall.cx) ** 2 + (ball.cy - nextBall.cy) ** 2);
            if (rc < ball.w) {
                collisionChecking(ball, nextBall, rc);
            }
        }
    }

    clear() {
        this.sceneCtx.clearRect(0, 0, this.scene.width, this.scene.height);
    }

    draw({ image, x, y, w, h }) {
        this.sceneCtx.drawImage(image, x, y, w, h);
    }
}