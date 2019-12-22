
const types = {"ROAD": 0, "HOUSE": 1, "OFFICE":2, "DEBUG": 3};
var gamestates;
const dirs = [{"dx":1,"dy":0},{"dx":0,"dy":1},{"dx":-1,"dy":0},{"dx":0,"dy":-1}];

var grid;
var level = 1;
var cars = [];
var cellwidth;
var selectedCar = null;
var updateTiles = [];

function setup() {
    gamestates = {
        "GAME": new StateGame()
    };
    gamestate = gamestates.GAME;
    createCanvas(windowWidth, windowHeight);
    grid = new Grid();
    cellwidth = Math.min(windowWidth/grid.width | 0, windowHeight/grid.height | 0)
    grid.position(windowWidth, windowHeight);
    maxMailbox = Math.max(grid.width, grid.height)*40;
    background(0)
    tick();
}

var updateAll = true;
var gamestate = new Gamestate();

function draw() {
    push()
        gamestate.draw();
    pop()
}

function requestUpdate(x, y) {
    updateTiles.push({"x":x | 0,"y": y | 0});
}

function tick() {
    update();
    requestAnimationFrame(tick);
}

function update() {
    gamestate.update();
}


function shadowPoint(r, g, b, x, y, size) {
    push();
        for(let i = size; i > 0; i--) {
            let a = 100-(100/size)*i;
            a /= 100
            stroke("rgba(" + r + ", " + g + ", " + b + ", " + a + ")");
            strokeWeight(i);
            point(x, y);
        }
    pop();
}

document.addEventListener("click",onClick);
document.addEventListener("contextmenu", onRightClick, false);

function onClick(e) {
    gamestate.onClick(e);
}

function onRightClick(e) {
    gamestate.onRightClick(e);
    e.preventDefault();
    return false;
} 

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cellwidth = Math.min(windowWidth/grid.width | 0, windowHeight/grid.height | 0)
    grid.position(windowWidth, windowHeight);
    background(0)
    updateAll = true;
    maxMailbox = Math.max(grid.width, grid.height)*40;
}