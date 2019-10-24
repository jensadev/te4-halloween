const HEIGHT = 600;
const WIDTH = 800;

let bgCanvas = document.createElement('canvas');
let bgCtx = bgCanvas.getContext('2d');
bgCanvas.setAttribute("id", "bg");
bgCanvas.setAttribute("class", "game");
bgCanvas.width  = WIDTH;
bgCanvas.height = HEIGHT;
let fgCanvas = document.createElement('canvas');
let fgCtx = fgCanvas.getContext('2d');
fgCanvas.setAttribute("id", "fg");
fgCanvas.setAttribute("class", "game");
fgCanvas.width  = WIDTH;
fgCanvas.height = HEIGHT;
let playerCanvas = document.createElement('canvas');
let playerCtx = fgCanvas.getContext('2d');
playerCanvas.setAttribute("id", "player");
playerCanvas.setAttribute("class", "game");
playerCanvas.width  = WIDTH;
playerCanvas.height = HEIGHT;

let offCanvas = document.createElement('canvas');
let offCtx = offCanvas.getContext('2d');

let images = {};
let gameRun = null;
let start = null;
let posDelta = 1;
let hasMoved = false;
let player;
let gravity = 0.4;
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
    bg01: 'img/Props/BackGround01.png',
    bg02: 'img/Props/BackGround02.png',
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

function createPattern(img, width, height, repeat, offsetX, offsetY)
{
    offCanvas.width = width;
    offCanvas.height = height;
    let pattern = offCtx.createPattern(img, repeat);
    offCtx.fillStyle = pattern;
    offCtx.fillRect(offsetX, offsetY, width, height);
    return offCanvas.toDataURL('png')
}

loadImages(sources, function() {
    // create patterns
    // offCanvas.width  = WIDTH;
    // offCanvas.height = 64;
    // // offCtx.drawImage(images.bg01, 0, 5, 240, 59);
    // // pattern = bgCtx.createPattern(offCanvas, 'repeat');
    // pattern = offCtx.createPattern(images.bg01, 'repeat-x');
    // offCtx.fillStyle = pattern;
    // offCtx.fillRect(0, 5, WIDTH, 59);


    // border
    platforms.push(Enviroment(bgCtx, 0, 0, 1, HEIGHT, 0, 0, images.blob));
    platforms.push(Enviroment(bgCtx, WIDTH, 0, 1, HEIGHT, 0, 0, images.blob));

    // platforms
    platforms.push(Enviroment(fgCtx, 340, 468, 46, 32, 0, 0, images.pLeft));
    enviroments.push(Enviroment(fgCtx, 341, 500, 46, 96, 0, 0, images.upLeft));
    platforms.push(Enviroment(fgCtx, 540, 468, 46, 32, 0, 0, images.pRight));
    enviroments.push(Enviroment(fgCtx, 540, 500, 46, 96, 0, 0, images.upRight));
    let pc = new Image();
    pc.src = createPattern(images.pCenter, 154, 32, "repeat-x", 0, 0);
    platforms.push(Enviroment(fgCtx, 386, 468, 154, 32, 0, 0, pc));
    enviroments.push(Enviroment(fgCtx, 386, 500, 154, 200, 0, 0, images.upCenter, false, 'repeat'));

    // ground
    platforms.push(Enviroment(fgCtx, 0, 544, 340, 34, 0, 0, images.pCenter, false, 'repeat')); // g tile left
    platforms.push(Enviroment(fgCtx, 340, 544, 46, 32, 0, 0, images.pRight));
    enviroments.push(Enviroment(fgCtx, 340, 576, 45, 96, 0, 0, images.upRight));
    enviroments.push(Enviroment(fgCtx, 0, 576, 340, 96, 0, 0, images.upCenter, false, 'repeat'));
    platforms.push(Enviroment(fgCtx, 540, 544, 340, 34, 0, 0, images.pCenter, false, 'repeat')); // g tile right
    platforms.push(Enviroment(fgCtx, 508, 544, 46, 32, 0, 0, images.pLeft));
    enviroments.push(Enviroment(fgCtx, 508, 576, 500, 96, 0, 0, images.upLeft));
    enviroments.push(Enviroment(fgCtx, 508, 576, 340, 96, 0, 0, images.upCenter, false, 'repeat'));

    // backgrounds
    //enviroments.push(Enviroment(0, 472, WIDTH, 59, 0, 0, images.bg01, false, 'repeat'));
    let bg = new Image();
    bg.src = createPattern(images.bg01, WIDTH, 59, "repeat-x", 0, 0);
    enviroments.push(Enviroment(bgCtx, 0, 500, WIDTH, 64, 0, 0, bg));
    enviroments.push(Enviroment(bgCtx, 550, 376, 70, 167, 0, 0, images.church));
    enviroments.push(Enviroment(bgCtx, 200, 426, 128, 116, 0, 0, images.tree));
    enviroments.push(Enviroment(bgCtx, 710, 426, 128, 116, 0, 0, images.tree));
    enviroments.push(Enviroment(bgCtx, 30, 516, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(bgCtx, 274, 516, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(bgCtx, 564, 516, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(bgCtx, 500, 434, 128, 116, 0, 0, images.grave02));
    enviroments.push(Enviroment(bgCtx, 120, 464, 128, 116, 0, 0, images.grave03));
    enviroments.push(Enviroment(bgCtx, 40, 120, 128, 96, 0, 0, images.moon, 0.4, false, true));
    platforms.push(Enviroment(fgCtx, 460, 474, 23, 124, 0, 0, images.ladder));

    // hazards
    hazards.push(Enviroment(fgCtx, 0, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(fgCtx, 128, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(fgCtx, 256, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(fgCtx, 384, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(fgCtx, 512, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(fgCtx, 640, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));
    hazards.push(Enviroment(fgCtx, 768, 552, 128, 48, 0, 0, images.water, 0.6, false, true, 4));

    hazards.push(Enviroment(fgCtx, 390, 440, 64, 32, 0, 0, images.fire, false, false, true, 1));

    player = Player(playerCtx, 540, 400, 32, 32, images.blob, 4, 0, 0, 2);

    enviroments.forEach(element => {
        element.draw();
    });

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
                // if(!shapeB.hazard)
                //     shapeA.y += oY;
            }
            else {
                colDir = "b";
                // if(!shapeB.hazard)
                //     shapeA.y -= oY;
            }
        } 
        // else {
        //     if (vX > 0) {
        //         colDir = "l";
        //         if(!shapeB.hazard)
        //             shapeA.x += oX;
        //     } else {
        //         colDir = "r";
        //         if(!shapeB.hazard)
        //             shapeA.x -= oX;
        //     }
        // }
    }
    return colDir;
}

function step(timestamp) {
    if (!start) start = timestamp;
    let progress = timestamp - start;

    player.velocityY += gravity;
    player.grounded = false;

    //fgCtx.clearRect(0, 0, WIDTH, HEIGHT);

    platforms.forEach(element => {
        let dir = colCheck(player, element);
        // if (dir === "l" || dir === "r") {
        //     player.jumping = false;
        // } else 
        if (dir === "b") {
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

const Enviroment = function(ctx, x, y, width, height, offsetX, offsetY, img, alpha, tile, animate, hazard)
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
    enviroment.pattern = tile ? offCtx.createPattern(img, tile) : false;
    enviroment.animate = false || animate;
    enviroment.hazard = false || hazard;
    enviroment.alpha = false || alpha;
    enviroment.ctx = ctx;
    enviroment.draw = function()
    {
        if (this.tile) {
            this.ctx.fillStyle = this.pattern;
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.animate) {
            if (this.alpha) {
                this.ctx.globalAlpha = this.alpha;
            this.ctx.drawImage(this.img,
                this.offsetX + enviromentLoop[enviromentLoopCurrentIndex] * this.width,
                this.offsetY,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height);
            }
        } else {
            this.ctx.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        this.ctx.globalAlpha = 1;
    }
    return enviroment;
}

const Player = function(ctx, x, y, width, height, img, speed, offsetX, offsetY, scale) {
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
    player.ctx = ctx;

    player.move = function (deltaX, deltaY, direction)
    {
        this.x += deltaX;
        this.y += deltaY;
        this.currentDirection = direction;
    }

    player.draw = function()
    {
        this.ctx.clearRect(this.x, this.y, this.width * this.scale, this.height * this.scale);
        this.ctx.drawImage(this.img,
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


let main = document.getElementsByTagName('main')[0];
main.appendChild(bgCanvas);
main.appendChild(fgCanvas);
main.appendChild(playerCanvas);