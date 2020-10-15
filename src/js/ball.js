const length = v => {
    return Math.sqrt(v.vx * v.vx + v.vy * v.vy);
};

let id = 0;
export class Ball {
    constructor() {
        this.id = id;
        id++;
    }

    init({ w, h, x, y, vx = 0, vy = 0, url, type = '' }) {
        return new Promise(resolve => {
            const image = new Image();
            image.onload = () => {
                this.w = w;
                this.h = h;
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.image = image;
                this.type = type;
                resolve(this);
            };
            image.src = url;
        });
    }

    run() {
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= 0.99;
        this.vy *= 0.99;

        this.vx = Math.abs(this.vx) <= 0.1 ? 0 : this.vx;
        this.vy = Math.abs(this.vy) <= 0.1 ? 0 : this.vy;
    }
}