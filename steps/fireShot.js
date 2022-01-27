const fireRate = 0.5;
const rotateSpeed = 5;
const velocity = 3;
const shotVelocity = 6;
// Game Data
let game = {
    players: {
        'player1': {
            tank: {
                color: 'red',
                direction: 0,
                bodyDims: {
                    h: 40,
                    w: 30,
                },
                barrelDims: {
                    h: 10,
                    w: 4,
                },
                pos: {
                    x: 0,
                    y: 0,
                },
            },
            keyBindings: {
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down',
                32: 'fire',
            },
            keys: {
                left: false,
                up: false,
                right: false,
                down: false,
                fire: false,
            },
            score: 0,
            shots: [],
            lastFired: 0,
        }
    },
    target: {
        color: 'blue',
        dims: {
            h: 50,
            w: 50,
        },
        pos : {
            x: 200,
            y: 0,
        },
    },
};

// Render
function mkTank(viewBox, tank) {
    const body = mkRect(tank.color, tank.bodyDims);
    body.style.transform = mkTranslateStr({x: 0, y: tank.barrelDims.h});

    const tankBarrel = mkRect(tank.color, tank.barrelDims);
    tankBarrel.style.transform = mkTranslateStr({
        x: (tank.bodyDims.w - tank.barrelDims.w) / 2,
        y: -tank.bodyDims.h
    });

    const tankContainer = document.createElement('div');
    const fullBoxDims = {
        w: tank.bodyDims.w,
        h: tank.bodyDims.h + tank.barrelDims.h,
    };
    const containerPos = adjustCoordinates(viewBox, fullBoxDims, {
        x: tank.pos.x,
        y: tank.pos.y,
    });
    tankContainer.style.position = 'absolute';
    tankContainer.appendChild(body);
    tankContainer.appendChild(tankBarrel);
    tankContainer.style.width = fullBoxDims.w + 'px';
    tankContainer.style.height = fullBoxDims.h + 'px';
    tankContainer.style.transform = mkTranslateStr(containerPos)  + ' ' + mkRotateStr(tank.direction);
    return tankContainer;
}

function mkTarget(viewBox, target) {
    const tPos = adjustCoordinates(viewBox, target.dims, target.pos);
    const t = mkRect(target.color, target.dims);
    t.style.position = 'absolute';
    t.style.transform = mkTranslateStr(tPos);
    return t;
}

function mkRound(viewBox, color, round) {
    const roundDims = {w: 4, h: 4};
    const roundPos = adjustCoordinates(viewBox, roundDims, round.pos);
    const block = mkRect(color, roundDims);
    block.style.position = 'absolute';
    block.style.transform = mkTranslateStr(roundPos) + ' ' + mkRotateStr(round.direction);
    return block;
}

function adjustCoordinates(viewBox, dims, pos) {
    return {
        x: pos.x + (viewBox.w / 2) - (dims.w / 2),
        y: (viewBox.h / 2) - pos.y - (dims.h / 2),
    };
}

function mkRect(color, dims) {
    const rect = document.createElement('div');
    rect.style.position = 'relative';
    rect.style.backgroundColor = color;
    rect.style.width = dims.w + 'px';
    rect.style.height = dims.h + 'px';
    return rect;
}

function mkScores(viewBox, players) {
    const scoreBoard = document.createElement('div');
    scoreBoard.style.position = 'absolute';
    Object.entries(game.players).forEach(([player,info]) => {
        const playerScore = document.createElement('p');
        playerScore.innerHTML = player + ': ' + info.score;
        scoreBoard.appendChild(playerScore);
    });
    return scoreBoard;
}

function mkRotateStr(angle) {
    const adjusted = (-1 * angle) + 90;
    return 'rotate(' + adjusted + 'deg)';
}

function mkTranslateStr(pos) {
    return 'translate3d(' + Math.round(pos.x) + 'px,' + Math.round(pos.y) + 'px, 0)';
}

function render(game) {
    const app = document.getElementById("app");
    const viewBox = {
        w: app.offsetWidth,
        h: app.offsetHeight,
    };
    app.innerHTML = '';

    update(game, viewBox);

    Object.values(game.players).forEach((player) => {
        app.appendChild(mkTank(viewBox, player.tank));
        player.shots.forEach(shot  => {
            app.appendChild(mkRound(viewBox, player.tank.color, shot));
        });
    });
    app.appendChild(mkTarget(viewBox, game.target));
    app.appendChild(mkScores(viewBox, game.players));
}


// Update

function update(game, viewBox) {
    Object.values(game.players).forEach(player => {
        moveTank(player.tank, player.keys);
        moveShots(viewBox, player, game.target);
        fireShot(player);
    });
}

function moveTank(tank, keys) {
    const radians = tank.direction * (Math.PI / 180);
    if (keys.up === true && keys.down === false) {
        tank.pos.x = tank.pos.x + (velocity * Math.cos(radians));
        tank.pos.y = tank.pos.y + (velocity * Math.sin(radians));
    }

    if (keys.up === false && keys.down === true) {
        tank.pos.x = tank.pos.x - (velocity * Math.cos(radians));
        tank.pos.y = tank.pos.y - (velocity * Math.sin(radians));
    }

    if (keys.left === true && keys.right === false) {
        tank.direction = tank.direction + rotateSpeed;
    }

    if (keys.left === false && keys.right === true) {
        tank.direction = tank.direction - rotateSpeed;
    }
}

function moveShots(viewBox, player, target) {
    const updatedShots = player.shots.map(shot => {
        let roundRads = shot.direction * (Math.PI / 180);
        let newRound = {
            direction: shot.direction,
            velocity: shot.velocity,
            pos: {
                x : shot.pos.x + (shot.velocity * Math.cos(roundRads)),
                y : shot.pos.y + (shot.velocity * Math.sin(roundRads)),
            },
        };

        if (isHit(target, shot)) {
            newRound.remove = true;
            player.score += 1;
            target.pos = mkRandomPos(viewBox, target.dims);
        }

        if (!isInBounds(viewBox, newRound)) {
            newRound.remove = true;
        }

        return newRound;
    });

    const filtered = updatedShots.filter(shot => {
        return !shot.remove;
    });
    player.shots = filtered;
}

function fireShot(player) {
}

function mkRandomPos(viewBox, dims) {
    const maxX = (viewBox.w / 2) - (dims.w / 2);
    const maxY = (viewBox.h / 2) - (dims.h / 2);
    const minX = -maxX;
    const minY = -maxY;
    let newDims =  {
        x: Math.floor(Math.random() * (maxX - minX)) + minX,
        y: Math.floor(Math.random() * (maxY - minY)) + minY,
    };
    return newDims;
}

function isHit(target, round) {
    const maxY = target.pos.y + (target.dims.h / 2);
    const minY = target.pos.y - (target.dims.h / 2);
    const maxX = target.pos.x + (target.dims.w / 2);
    const minX = target.pos.x - (target.dims.w / 2);
    const is =  (round.pos.y < maxY &&
                 round.pos.y > minY &&
                 round.pos.x < maxX &&
                 round.pos.x > minX);
    return is;
}

function isInBounds(viewBox, round) {
    const maxY = (viewBox.h / 2) - 10;
    const maxX = (viewBox.w / 2) - 10;
    const minY = -1 * maxY;
    const minX = -1 * maxX;
    return (round.pos.x < maxX && round.pos.x > minX && round.pos.y < maxY && round.pos.y > minY);
};

// Loop

function run() {
    requestAnimationFrame(run);
    render(game);
}

// Events

function setKey(player, key, isPressed) {
    game.players[player].keys[key] = isPressed;
}

document.addEventListener('keydown', (event) => {
    let pressed = event.keyCode;
    Object.entries(game.players).forEach(([player,info]) => {
        Object.entries(info.keyBindings).forEach(([code, key]) => {
            if (pressed == code) {
                setKey(player, key, true);
                return;
            }
        });
    });
});

document.addEventListener('keyup', (event) => {
    let pressed = event.keyCode;
    Object.entries(game.players).forEach(([player,info]) => {
        Object.entries(info.keyBindings).forEach(([code, key]) => {
            if (pressed == code) {
                setKey(player, key, false);
                return;
            }
        });
    });
});

run();
