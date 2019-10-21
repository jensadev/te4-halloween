const HEIGHT = 600;
const WIDTH = 800;

let bgCanvas = document.createElement('canvas');
let bgCtx = bgCanvas.getContext('2d');
bgCanvas.setAttribute("id", "bg");
bgCanvas.width  = WIDTH;
bgCanvas.height = HEIGHT;
let fgCanvas = document.createElement('canvas');
let fgCtx = fgCanvas.getContext('2d');
fgCanvas.setAttribute("id", "fg");
fgCanvas.width  = WIDTH;
fgCanvas.height = HEIGHT;

let images = {};
let gameRun = null;
let start = null;
let posDelta = 1;
let hasMoved = false;
let player;
let gravity = 0.2;
let move = { right: false, left: false, jump: false };
let platforms = [];
let hazards = [];
let enviroments = [];
let enviromentFrameCount = 0;
let enviromentFrameLimit = 6;
let enviromentLoop = [0, 1, 2, 3, 4, 5, 6, 7];
let enviromentLoopCurrentIndex = 0;
let health = 100;

const FACING_LEFT = 2;
const FACING_RIGHT = 1;
const FACING_IDLE = 0;
const FACING_UP = 3;

const sources = {
    blob: 'img/pumpkin-blob.png',
    pCenter: 'img/Platforms/Platform_Center.png',
    pLeft: 'img/Platforms/Platform_Left.png',
    pRight: 'img/Platforms/Platform_Right.png',
    upCenter: 'img/Platforms/Under_Platform_Center.png',
    upLeft: 'img/Platforms/Under_Platform_Left.png',
    upRight: 'img/Platforms/Under_Platform_Right.png',
    bg01: 'img/Props/Background01.png',
    bg02: 'img/Props/Background02.png',
    church: 'img/Props/Church.png',
    mist: 'img/Props/Mist.png',
    tree: 'img/Props/Tree.png',
    ladder: 'img/Props/Ladder.png',
    grave01: 'img/Props/Grave01.png',
    grave02: 'img/Props/Grave02.png',
    grave03: 'img/Props/Grave03.png',
    water: 'img/water.png',
    fire: 'img/fire.png',
    moon: 'img/moon.png'

};

function loadImages(sources, callback) {
    let loadedImages = 0;
    let numImages = 0;
    for(let src in sources) {
        numImages++;
    }
    for(let src in sources) {
        images[src] = new Image();
        images[src].onload = function() {
            if(++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].src = sources[src];
    }
}

loadImages(sources, function() {
    // border
    platforms.push(Enviroment(0, 0, 1, HEIGHT, 0, 0, images.blob));
    platforms.push(Enviroment(WIDTH, 0, 1, HEIGHT, 0, 0, images.blob));

    // platforms
    // platforms.push(Enviroment(800, 402, 46, 32, 0, 0, images.pRight));
    // platforms.push(Enviroment(800, 468, 46, 96, 0, 0, images.upRight));
    // platforms.push(Enviroment(400, 402, 46, 32, 0, 0, images.pLeft))
    // platforms.push(Enviroment(400, 468, 46, 96, 0, 0, images.upLeft))
    // platforms.push(Enviroment(446, 402, 354, 32, 0, 0, images.pCenter, false, 'repeat'));
    // enviroments.push(Enviroment(444, 468, 356, 200, 0, 0, images.upCenter, false, 'repeat'));

    // ground
    platforms.push(Enviroment(0, 510, 340, 34, 0, 0, images.pCenter, false, 'repeat')); // g tile left
    // platforms.push(Enviroment(800, 503, WIDTH, 34, 0, 0, images.pCenter, false, 'repeat')); // g tile right
    platforms.push(Enviroment(340, 510, 46, 32, 0, 0, images.pRight));
    enviroments.push(Enviroment(340, 576, 45, 96, 0, 0, images.upRight));
    // platforms.push(Enviroment(760, 503, 46, 32, 0, 0, images.pLeft));
    // enviroments.push(Enviroment(760, 520, 500, 96, 0, 0, images.upLeft));
    enviroments.push(Enviroment(0, 576, 340, 96, 0, 0, images.upCenter, false, 'repeat'));
    // enviroments.push(Enviroment(800, 520, WIDTH, 80, 0, 0, images.upCenter, false, 'repeat'));

    // backgrounds
    enviroments.push(Enviroment(0, 472, WIDTH, 59, 0, 0, images.bg01, false, 'repeat'));
    enviroments.push(Enviroment(820, 340, 70, 167, 0, 0, images.church));
    enviroments.push(Enviroment(300, 390, 128, 116, 0, 0, images.tree));
    enviroments.push(Enviroment(950, 390, 128, 116, 0, 0, images.tree));
    enviroments.push(Enviroment(100, 470, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(620, 368, 128, 116, 0, 0, images.grave02));
    enviroments.push(Enviroment(250, 420, 128, 116, 0, 0, images.grave03));
    enviroments.push(Enviroment(920, 470, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(40, 120, 128, 96, 0, 0, images.moon, 0.4, false, true));

    // hazards
    hazards.push(Enviroment(0, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(128, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(256, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(384, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(512, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(640, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(768, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(450, 376, 64, 32, 0, 0, images.fire, false, false, true, 1));


    player = Player(100, 200, 32, 32, images.blob, 4, 0, 0, 2);

    window.requestAnimationFrame(step);
});

function colCheck(shapeA, shapeB) {
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;
 
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                if(!shapeB.hazard)
                    shapeA.y += oY;
            } else {
                colDir = "b";
                if(!shapeB.hazard)
                    shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                colDir = "l";
                if(!shapeB.hazard)
                    shapeA.x += oX;
            } else {
                colDir = "r";
                if(!shapeB.hazard)
                    shapeA.x -= oX;
            }
        }
    }
    return colDir;
}

function step(timestamp) {
    if (!start) start = timestamp;
    let progress = timestamp - start;

    player.velocityY += gravity;
    player.grounded = false;

    bgCtx.clearRect(0, 0, WIDTH, HEIGHT);

    enviroments.forEach(element => {
        element.draw();
    });

    platforms.forEach(element => {
        let dir = colCheck(player, element);
        if (dir === "l" || dir === "r") {
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velocityY *= -1;
        }
        element.draw();
    });

    hazards.forEach(element => {
        let dir = colCheck(player, element);
        if (dir) {
            health -= element.hazard;
            console.log(health)
        }
        element.draw();
    });

    if(player.grounded) { // test
         player.velocityY = 0;
    }

    // kontrollera spelarens förflyttning samt vänd på bakgrundens scroll
    if(move.right) {
        player.move(player.speed, 0, FACING_RIGHT);
        posDelta = 1;
    }
    if(move.left) {
        player.move(-player.speed, 0, FACING_LEFT);
        posDelta = -1;
    }
    // den här delen sköter spelarens animation genom att loopa igenom en array med movement-frames
    if (move.jump) {
        if(!player.jumping && player.grounded) {
            //player.currentDirection = FACING_UP;
            player.jumping = true;
            player.grounded = false;
            player.velocityY = -player.speed * 2;
        }
    } else if (move.left || move.right) {
        player.hasMoved = true;
    } else {
        player.hasMoved = false;
        player.currentDirection = FACING_IDLE;
    }

    player.frameCount++;
    if (player.frameCount >= player.frameLimit) {
        player.frameCount = 0;
        player.currentLoopIndex++;
        if (player.currentLoopIndex >= player.moveLoop.length) {
            player.currentLoopIndex = 0;
        }
    }

    enviromentFrameCount++;
    if (enviromentFrameCount >= enviromentFrameLimit) {
        enviromentFrameCount = 0;
        enviromentLoopCurrentIndex++;
        if (enviromentLoopCurrentIndex >= enviromentLoop.length) {
            enviromentLoopCurrentIndex = 0;
        }
    }
    //player.x += player.velocityX;
    player.y += player.velocityY; // hopp

    player.draw(); // rita spelaren

    gameRun = window.requestAnimationFrame(step);
}

const Enviroment = function(x, y, width, height, offsetX, offsetY, img, alpha, tile, animate, hazard)
{
    const enviroment = {};
    enviroment.x = x;
    enviroment.y = y
    enviroment.width = width;
    enviroment.height = height;
    enviroment.offsetX = 0 || offsetX;
    enviroment.offsetY = 0 || offsetY;
    enviroment.img = img;
    enviroment.tile = tile;
    enviroment.pattern = tile ? bgCtx.createPattern(img, tile) : false;
    enviroment.animate = false || animate;
    enviroment.hazard = false || hazard;
    enviroment.alpha = false || alpha;
    enviroment.draw = function()
    {
        if (this.tile) {
            bgCtx.fillStyle = this.pattern;
            bgCtx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.animate) {
            if (this.alpha) {
                bgCtx.globalAlpha = this.alpha;
            bgCtx.drawImage(this.img,
                this.offsetX + enviromentLoop[enviromentLoopCurrentIndex] * this.width,
                this.offsetY,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height);
            }
        } else {
            bgCtx.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        bgCtx.globalAlpha = 1;
    }
    return enviroment;
}

const Player = function(x, y, width, height, img, speed, offsetX, offsetY, scale) {
    const player = {};
    player.x = x;
    player.y = y;
    player.width = width;
    player.height = height;
    player.speed = speed;
    player.moveLoop = [0, 1, 2, 3];
    player.jumpLoop = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    player.frameLimit = 6;
    player.scale = 1 || scale;
    player.currentDirection = FACING_RIGHT;
    player.currentLoopIndex = 0;
    player.frameCount = 0;
    player.img = img;
    player.imgOffsetX = 0 || offsetX;
    player.imgOffsetY = 0 || offsetY;
    player.jumping = false;
    player.velocityY = 0;
    player.velocityX = 0;
    player.grounded = false;

    player.move = function (deltaX, deltaY, direction)
    {
        this.x += deltaX;
        this.y += deltaY;
        this.currentDirection = direction;
    }

    player.draw = function()
    {
        fgCtx.clearRect(this.x, this.y, this.width, this.height * 2);
        fgCtx.drawImage(this.img,
            this.imgOffsetX + this.moveLoop[this.currentLoopIndex] * this.width,
            this.imgOffsetY + this.currentDirection * this.height,
            this.width, this.height,
            this.x, this.y,
            this.width * this.scale , this.height * this.scale);
    }
    return player;    
}


// Keydown på movement
document.addEventListener("keydown", function(e) {
	switch(e.key) {
		case "d":
            move.right = true;
            break;
		case "a":
            move.left = true;
            break;
        case "D":
            move.right = true;
            break;
        case "A":
            move.left = true;
            break;
        case " ":
            move.jump = true;
            break;
        }
});

// keyup på movement
document.addEventListener("keyup", function(e) {
	switch(e.key) {
		case "d":
            move.right = false;
            break;
		case "a":
            move.left = false;
            break;
        case "D":
            move.right = false;
            break;
        case "A":
            move.left = false;
            break;
        case " ":
            move.jump = false;
            break;
        }
});


let body = document.getElementsByTagName('body')[0];
body.appendChild(bgCanvas);
body.appendChild(fgCanvas);
