let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
canvas.setAttribute("id", "game");
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

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
    platforms.push(Enviroment(0, 0, 1, canvas.height, 0, 0, images.blob));
    platforms.push(Enviroment(canvas.width, 0, 1, canvas.height, 0, 0, images.blob));

    // platforms
    platforms.push(Enviroment(800, canvas.height - 198, 46, 32, 0, 0, images.pRight));
    platforms.push(Enviroment(800, canvas.height - 168, 46, 96, 0, 0, images.upRight));
    platforms.push(Enviroment(400, canvas.height - 198, 46, 32, 0, 0, images.pLeft))
    platforms.push(Enviroment(400, canvas.height - 168, 46, 96, 0, 0, images.upLeft))
    platforms.push(Enviroment(446, canvas.height - 198, 354, 32, 0, 0, images.pCenter, 'repeat'));
    enviroments.push(Enviroment(444, canvas.height - 168, 356, 200, 0, 0, images.upCenter, 'repeat'));

    // ground
    platforms.push(Enviroment(0, canvas.height - 97, 500, 34, 0, 0, images.pCenter, 'repeat')); // g tile left
    platforms.push(Enviroment(800, canvas.height - 97, canvas.width, 34, 0, 0, images.pCenter, 'repeat')); // g tile right
    platforms.push(Enviroment(500, canvas.height - 97, 46, 32, 0, 0, images.pRight));
    enviroments.push(Enviroment(500, canvas.height - 80, 500, 96, 0, 0, images.upRight));
    platforms.push(Enviroment(760, canvas.height - 97, 46, 32, 0, 0, images.pLeft));
    enviroments.push(Enviroment(760, canvas.height - 80, 500, 96, 0, 0, images.upLeft));
    enviroments.push(Enviroment(0, canvas.height - 80, 500, 80, 0, 0, images.upCenter, 'repeat'));
    enviroments.push(Enviroment(800, canvas.height - 80, canvas.width, 80, 0, 0, images.upCenter, 'repeat'));

    // backgrounds
    enviroments.push(Enviroment(0, canvas.height - 140, 240, 59, 0, 0, images.bg01));
    enviroments.push(Enviroment(240, canvas.height - 140, 240, 59, 0, 0, images.bg01));

    enviroments.push(Enviroment(780, canvas.height - 140, 240, 59, 0, 0, images.bg01));
    enviroments.push(Enviroment(820, canvas.height - 260, 70, 167, 0, 0, images.church));
    enviroments.push(Enviroment(300, canvas.height - 210, 128, 116, 0, 0, images.tree));
    enviroments.push(Enviroment(950, canvas.height - 210, 128, 116, 0, 0, images.tree));
    enviroments.push(Enviroment(100, canvas.height - 130, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(620, canvas.height - 232, 128, 116, 0, 0, images.grave02));
    enviroments.push(Enviroment(250, canvas.height - 180, 128, 116, 0, 0, images.grave03));
    enviroments.push(Enviroment(920, canvas.height - 130, 128, 116, 0, 0, images.grave01));
    enviroments.push(Enviroment(100, 100, 128, 96, 0, 0, images.moon, false, true));

    // hazards
    hazards.push(Enviroment(256, canvas.height - 48, 128, 48, 0, 0, images.water, false, true, 4));
    hazards.push(Enviroment(600, canvas.height - 48, 128, 48, 0, 0, images.water, false, true, 4));
    hazards.push(Enviroment(700, canvas.height - 48, 128, 48, 0, 0, images.water, false, true, 4));
    hazards.push(Enviroment(450, canvas.height - 224, 64, 32, 0, 0, images.fire, false, true, 1));


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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    enviroments.forEach(element => {
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

const Enviroment = function(x, y, width, height, offsetX, offsetY, img, tile, animate, hazard)
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
    enviroment.pattern = tile ? ctx.createPattern(img, tile) : false;
    enviroment.animate = false || animate;
    enviroment.hazard = false || hazard;
    enviroment.draw = function()
    {
        if (this.tile && this.animate) {

        } else if (this.tile) {
            ctx.fillStyle = this.pattern;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.animate) {
            ctx.drawImage(this.img,
                this.offsetX + enviromentLoop[enviromentLoopCurrentIndex] * this.width,
                this.offsetY,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height);
        } else {
            ctx.drawImage(this.img, this.offsetX, this.offsetY, this.width, this.height, this.x, this.y, this.width, this.height);
        }
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
        ctx.drawImage(this.img,
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
body.appendChild(canvas);

window.onresize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight; 
}
window.onscroll = () => {
    canvas.setAttribute("style", "top: " + window.pageYOffset + "px");
}