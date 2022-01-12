// Game Data
let game = {
    players: {
        'player1': {
            tank: {
                color: 'red',
                direction: 0,
                pos: {x: 0, y: 0},
            },
            keyBindings: {
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down',
            },
            keys: {
                left: false,
                up: false,
                right: false,
                down: false,
            },
            score: 0,
        }
    }
};


// Render
function mkTank(viewBox, tank) {
    const bodyDims = {
        h: 40,
        w: 30,
    };

    const barrelDims = {
        h: 10,
        w: 4,
    };


    let body = mkRect(tank.color, bodyDims);
    body.style.transform = mkTranslateStr({x: 0, y: barrelDims.h});

    let tankBarrel = mkRect(tank.color, barrelDims);
    tankBarrel.style.transform = mkTranslateStr({
        x: (bodyDims.w - barrelDims.w) / 2,
        y: -bodyDims.h
    });

    let tankContainer = document.createElement('div');
    let containerPos = adjustCoordinates(viewBox, {
        x: tank.pos.x - (bodyDims.w / 2),
        y: tank.pos.y - ((bodyDims.h + barrelDims.h) / 2),
    });
    tankContainer.style.position = 'absolute';
    tankContainer.appendChild(body);
    tankContainer.appendChild(tankBarrel);
    tankContainer.style.width = bodyDims.w + 'px';
    tankContainer.style.height = bodyDims.h + barrelDims.h + 'px';
    tankContainer.style.transform = mkTranslateStr(containerPos)  + ' ' + mkRotateStr(tank.direction);
    return tankContainer;
}

function adjustCoordinates(viewBox, pos) {
    return {
        x: pos.x + (viewBox.w / 2),
        y: pos.y + (viewBox.h / 2),
    };
}

function mkRect(color, dims) {
    let rect = document.createElement('div');
    rect.style.position = 'relative';
    rect.style.backgroundColor = color;
    rect.style.width = dims.w + 'px';
    rect.style.height = dims.h + 'px';
    return rect;
}

function mkRotateStr(angle) {
    return 'rotate(' + angle + 'deg)';
}

function mkTranslateStr(pos) {
    return 'translate(' + pos.x + 'px,' + pos.y + 'px)';
}

function render(game) {
    let app = document.getElementById("app");
    app.innerHTML = '';
    let viewBox = {
        w: app.offsetWidth,
        h: app.offsetHeight,
    };

    update(game, viewBox);

    Object.values(game.players).forEach((player) => {
        app.appendChild(mkTank(viewBox, player.tank));
    });
}


// Update

function update(game, viewBox) {
    Object.entries(game.players).forEach(([player,info]) => {
        let keys = info.keys;
        let dir = info.tank.direction;
        let x = info.tank.pos.x;
        let y = info.tank.pos.y;

        let rotateSpeed = 5;
        let velocity = 3;
        let radians = (dir - 90) * (Math.PI / 180);

        let adjustDir = 0;
        let adjustX = 0;
        let adjustY = 0;

        if (keys.up === true && keys.down === false) {
            adjustX = velocity * Math.cos(radians);
            adjustY = velocity * Math.sin(radians);
        }

        if (keys.up === false && keys.down === true) {
            adjustX = (- velocity) * Math.cos(radians);
            adjustY = (- velocity) * Math.sin(radians);
        }

        if (keys.left === true && keys.right === false) {
            adjustDir = - rotateSpeed;
        }

        if (keys.left === false && keys.right === true) {
            adjustDir = rotateSpeed;
        }

        game.players[player].tank.direction = dir + adjustDir;
        game.players[player].tank.pos.x = x + adjustX;
        game.players[player].tank.pos.y = y + adjustY;

    });
}

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
