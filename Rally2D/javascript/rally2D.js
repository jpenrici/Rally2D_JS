/*
    Rally 2D
    Simple Javascript Game Test
*/

// Image
var sprite = {
    width: 2,
    height: 2,
    srcX: 0,
    srcY: 0,
    srcW: 2,
    srcH: 2,
    label: undefined,
    path: undefined
};

// Control
var loop = {
    animation: false,

    animate: function() {
        if (loop.animation) {
            render();
            window.requestAnimationFrame(loop.animate);
        }
    },

    start: function() {
        loop.animation = true;
        window.performance.now();
        window.requestAnimationFrame(loop.animate);
        console.log("Loop started ...");
    },

    stop: function() {
        loop.animation = false;
        console.log("Loop stoped ...");
    }
};

// Canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

// Events
window.addEventListener("keydown", handleKeyPress, false);

// Elements
var backgroundImage = new Image();
var gameOverImage = new Image();
var arrowImage = new Image();
var carImage = new Image();
var energyImage = new Image();
var obstacleImage = new Image();
var odometerImage = new Image();
var speedometerImage = new Image();

backgroundImage.src = "../images/background.png";
gameOverImage.src = "../images/gameOver.png";
arrowImage.src = "../images/arrow-sprite.png";
carImage.src = "../images/player-sprite.png";
energyImage.src = "../images/energy-sprite.png";
obstacleImage.src = "../images/obstacle-sprite.png";
odometerImage.src = "../images/odometer-sprite.png";
speedometerImage.src = "../images/speedometer-sprite.png";

var arrow = prepare("arrow", 1, 5, 64, 64, arrowImage.src);
var car = prepare("car", 1, 6, 128, 256, carImage.src);
var energy = prepare("energy", 1, 11, 48, 128, energyImage.src);
var obstacle = prepare("obstacle", 1, 6, 192, 192, obstacleImage.src);
var odometer = prepare("odometer", 51, 10, 34, 20, odometerImage.src);
var speedometer = prepare("speedometer", 7, 10, 128, 128, speedometerImage.src);

// Game
var timer = 0;
init();

function init() {

    car.width = car[0].width;
    car.height = car[0].height;
    car.x = canvas.width / 2;
    car.y = canvas.height - car.height;
    car.velocity = 0;
    car.step = 0;
    car.energy = 10;
    car.distance = 0;
    car.frame = 4;

    obstacle.width = obstacle[0].width;
    obstacle.height = obstacle[0].height;
    obstacle.x = car.x;
    obstacle.y = -obstacle.height / 2;
    obstacle.frame = 0;

    arrow.height = arrow[0].height;
    arrow.frame = 0;

    timer = 0;
    loop.start();
}

function handleKeyPress(event) {

    var keyCodes = {
        UP: 87,     // w
        DOWN: 83,   // s
        LEFT: 65,   // a
        RIGHT: 68,  // d
        ESC: 27,    // Exit
        SPACE: 32,  // Restart
    };

    if (event.keyCode == keyCodes.UP) {
        arrow.frame = 1;
        if (car.velocity < 60) {
            car.velocity++;
            car.y--;
        }
    }

    if (event.keyCode == keyCodes.DOWN) {
        car.frame = 5;
        arrow.frame = 2;
        if (car.velocity > 0) {
            car.velocity--;
            car.y++;
        }
    }

    if (event.keyCode == keyCodes.LEFT) {
        arrow.frame = 3;
        if (car.x > 0) {
            car.x -= car.step;
        }
    }

    if (event.keyCode == keyCodes.RIGHT) {
        arrow.frame = 4;
        if (car.x < (canvas.width - car.width)) {
            car.x += car.step;
        }
    }

    if (event.keyCode == keyCodes.ESC) {
        loop.stop();
    }

    if (event.keyCode == keyCodes.SPACE) {
        if (!loop.animation) {
            init();
        }
    }
}

function render() {

    // Background
    ctx.drawImage(backgroundImage, 0, 0);

    // Player
    draw(carImage, car[car.frame], car.x, car.y);
    car.step = car.velocity / 4;
    if (car.velocity <= 0) {
        car.frame = 4;
    }
    if (car.velocity > 0) {
        timer++;
        if (timer > 3) {
            timer = 0;
            car.frame++;
            if (car.frame > 3) {
                car.frame = 0;
            }
        }
    }

    // Obstacles
    var change = false;
    obstacle.y += car.step / 2;
    if (obstacle.y > (canvas.height + obstacle.height)) {
        change = true;
        car.distance++;
    }
    var center = {
        x: obstacle.x + obstacle.width / 2,
        y: obstacle.y + obstacle.height / 2
    };
    if (center.y > car.y && center.y < (car.y + car.height)) {
        if (center.x > car.x && center.x < (car.x + car.width)) {
            change = true;
            car.energy--;
            car.velocity -= 5;
            console.log("Collision ...");
        }
    }
    if (change) {
        obstacle.y = -(obstacle.height / 2);
        obstacle.x = Math.floor(Math.random() * (canvas.width - 2 * obstacle.width)) + obstacle.width;
        obstacle.frame = Math.floor(Math.random() * (obstacle.length - 1));
        change = false;
    }
    draw(obstacleImage, obstacle[obstacle.frame], obstacle.x, obstacle.y);

    // Hud
    if (car.energy >= 0 && car.energy < energy.length) {
        draw(energyImage, energy[car.energy], 10, 10);
    }
    if (car.velocity >= 0 && car.velocity < speedometer.length) {
        draw(speedometerImage, speedometer[car.velocity], 50, 10);
    }
    if (car.distance >= 0 && car.distance < odometer.length) {
        draw(odometerImage, odometer[car.distance], 98, 90);
    }
    draw(arrowImage, arrow[arrow.frame], 10, canvas.height - arrow.height);
    arrow.frame = 0;

    if (car.energy <= 0) {
        ctx.drawImage(gameOverImage, (canvas.width - gameOverImage.width) / 2,
            (canvas.height - gameOverImage.height) / 2);
        loop.stop();
    }
}

function draw(image, element, x, y) {

    ctx.drawImage(image, element.srcX, element.srcY, element.srcW, element.srcH,
        Math.floor(x), Math.floor(y), element.width, element.height);
}

function prepare(label, rows, columns, width, height, path) {

    elements = [];
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < columns; j++) {
            var obj = Object.assign({}, sprite);
            obj.label = label + "_" + (elements.length).toString();
            obj.width = obj.srcW = width;
            obj.height = obj.srcH = height;
            obj.srcY = i * obj.srcH;
            obj.srcX = j * obj.srcW;
            obj.path = path;
            elements.push(obj);
            // console.log(obj.label,"...");
        }
    }
    return elements;
}