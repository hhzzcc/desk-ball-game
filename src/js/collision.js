
export const collisionChecking = (ball, nextBall, rc) => {
    const ax = ((ball.vx - nextBall.vx) * ((ball.x - nextBall.x) ** 2) + (ball.vy - nextBall.vy) * (ball.x - nextBall.x) * (ball.y - nextBall.y)) / (rc ** 2);
    const ay = ((ball.vy - nextBall.vy) * ((ball.y - nextBall.y) ** 2) + (ball.vx - nextBall.vx) * (ball.x - nextBall.x) * (ball.y - nextBall.y)) / (rc ** 2);
    ball.vx = ball.vx - ax;
    ball.vy = ball.vy - ay;
    nextBall.vx = nextBall.vx + ax;
    nextBall.vy = nextBall.vy + ay;

    const clength = (ball.w - rc) / 2;
    const cx = clength * (ball.x - nextBall.x) / rc;
    const cy = clength * (ball.y - nextBall.y) / rc;
    ball.x += cx;
    ball.y += cy;
    nextBall.x -= cx;
    nextBall.y -= cy;

    ball.x += cx;
    ball.y += cy;
    nextBall.x -= cx;
    nextBall.y -= cy;
};