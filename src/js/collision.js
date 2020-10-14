
export const collisionChecking = (ball, nextBall, rc) => {
    const ax = ((ball.vx - nextBall.vx) * ((ball.cx - nextBall.cx) ** 2) + (ball.vy - nextBall.vy) * (ball.cx - nextBall.cx) * (ball.cy - nextBall.cy)) / (rc ** 2);
    const ay = ((ball.vy - nextBall.vy) * ((ball.cy - nextBall.cy) ** 2) + (ball.vx - nextBall.vx) * (ball.cx - nextBall.cx) * (ball.cy - nextBall.cy)) / (rc ** 2);
    ball.vx = ball.vx - ax;
    ball.vy = ball.vy - ay;
    nextBall.vx = nextBall.vx + ax;
    nextBall.vy = nextBall.vy + ay;

    const clength = (ball.w - rc) / 2;
    const cx = clength * (ball.cx - nextBall.cx) / rc;
    const cy = clength * (ball.cy - nextBall.cy) / rc;
    ball.x += cx;
    ball.y += cy;
    nextBall.x -= cx;
    nextBall.y -= cy;

    ball.cx += cx;
    ball.cy += cy;
    nextBall.cx -= cx;
    nextBall.cy -= cy;
};