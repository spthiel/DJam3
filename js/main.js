
const types = {"ROAD": 0, "HOUSE": 1, "OFFICE":2};
const dirs = [{"dx":1,"dy":0},{"dx":0,"dy":1},{"dx":-1,"dy":0},{"dx":0,"dy":-1}];

var grid;
var level = 2;
var cars = [];
var cellwidth;
var selectedCar = null;
var updateTiles = [];

function setup() {
    createCanvas(windowWidth, windowHeight);
    grid = new Grid();
    cellwidth = Math.min(windowWidth/grid.width | 0, windowHeight/grid.height | 0)
    grid.position(windowWidth, windowHeight);
    background(0)
    tick();
}

var updateAll = true;

function draw() {
    noStroke();
    translate(grid.x, grid.y);
    grid.draw(updateAll);
    updateTiles = [];
    updateAll = false;
    cars.forEach(car => car.drawPath());
    cars.forEach(car => car.draw());
}

function requestUpdate(x, y) {
    updateTiles.push({"x":x | 0,"y": y | 0});
}

function tick() {
    update();
    requestAnimationFrame(tick);
}

function update() {
    if(cars.length == 0) {
        spawnCars();
    }
    cars.forEach(car => car.update());
}

function spawnCars() {
    for(let i = 0; i < level; i++) {
        cars.push(new Car(grid.office.x, grid.office.y, 15));
    }
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
    let x = (e.x - grid.x) / cellwidth;
    let y = (e.y - grid.y) / cellwidth;

    if(x < 0 || y < 0 || x > grid.width || y > grid.width) {
        return;
    }

    let car = cars.find(car => car.isHere(x, y));
    if(car) {
        if(selectedCar) {
            selectedCar.selected = false;
        }
        car.selected = true;
        selectedCar = car;
    } else if(selectedCar) {
        selectedCar.findPath(x | 0, y | 0);
    }
}

function onRightClick(e) {
    e.preventDefault();
    selectedCar.selected = false;
    selectedCar = null;
    return false;
} 

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    cellwidth = Math.min(windowWidth/grid.width | 0, windowHeight/grid.height | 0)
    grid.position(windowWidth, windowHeight);
    background(0)
    updateAll = true;
}