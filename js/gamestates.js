class Gamestate {

    draw() {};
    update() {};
    onClick(e) {};
    onRightClick(e) {};

}

class StateGame extends Gamestate {
    
    draw() {
        noStroke();
        translate(grid.x, grid.y);
        grid.draw(updateAll);
        updateAll = false;
        cars.forEach(car => car.drawPath());
        cars.forEach(car => car.draw());
        this.updateTexts();
    }
    
    spawnCars() {
        for(let i = 0; i < level; i++) {
            let car = new Car(grid.office.x, grid.office.y)
            if(i == 0) {
                car.selected = true;
                selectedCar = car;
            }
            cars.push(car);
        }
    }

    updateTexts() {
        this.updateText(0, "toComplete", grid.totalRequests-grid.finishedRequests-grid.failedRequests);
        this.updateText(1, "completed", grid.finishedRequests);
        this.updateText(2, "failed", grid.failedRequests);
    }

    setTextsVisible() {
        let e = document.getElementById("floatingText");
        if(e) {
            e.className = "";
        }
    }

    updateText(idx, id, value) {
        let e = spans[idx];
        if(!e) {
            e = document.getElementById(id);
            if(e) {
                spans[idx] = e;
            }
        }
        if(e) {
            e.innerText = value;
        }
    }

    update() {
        if(cars.length == 0) {
            this.spawnCars();
        }
        cars.forEach(car => car.update());
        grid.update();
    }

    onClick(e) {
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

    onRightClick(e) {
        selectedCar.selected = false;
        selectedCar = null;
    }
}

class StateNext extends Gamestate {

    constructor() {
        super();
        this.nextlevel = new Button(windowWidth/2, windowHeight/2 - windowHeight/8 - 10, windowWidth/2, windowHeight/8, 10, "Next level");
        if(level >= 10) {
            this.next10level = new Button(windowWidth/2, windowHeight/2, windowWidth/2, windowHeight/8, 10, "Jump 10 level");
        } else {
            this.next10level = new Button(windowWidth/2, windowHeight/2, windowWidth/2, windowHeight/8, 10, "Locked until level 10", 150)
        }
        if(level >= 100) {
            this.next100level = new Button(windowWidth/2, windowHeight/2 + windowHeight/8 + 10, windowWidth/2, windowHeight/8, 10, "Jump 100 level");
        } else {
            this.next100level = new Button(windowWidth/2, windowHeight/2 + windowHeight/8 + 10, windowWidth/2, windowHeight/8, 10, "Locked until level 100", 150)
        }
    }

    draw() {
        background(0);
        this.setTextsInvisible();
        this.nextlevel.draw();
        this.next10level.draw();
        this.next100level.draw();
    }

    setTextsInvisible() {
        let e = document.getElementById("floatingText");
        if(e) {
            e.className = "hide";
        }
    }

    onClick(e) {
        let next = false;
        if(this.nextlevel.onClick(e.x, e.y)) {
            level++;
            next = true;
        }
        if(this.next10level.onClick(e.x, e.y) && level >= 10) {
            level += 10;
            next = true;
        }
        if(this.next100level.onClick(e.x, e.y) && level >= 100) {
            level += 100;
            next = true;
        }
        if(next) {
            grid.regenerate();
            gamestate = gamestates.GAME;
            background(0);
        }

    }

}

class StateRetry extends Gamestate {

    constructor() {
        super();
        this.retry = new Button(windowWidth/2, windowHeight/2, windowWidth/2, windowHeight/5, 10, "You failed too many requests");
    }

    draw() {
        background(0);
        this.setTextsInvisible();
        this.retry.draw();
    }
    
    setTextsInvisible() {
        let e = document.getElementById("floatingText");
        if(e) {
            e.className = "hide";
        }
    }

    onClick(e) {
        if(this.retry.onClick(e.x, e.y)) {
            grid.regenerate();
            gamestate = gamestates.GAME;
            background(0);
        }
    }

}

class Button {

    constructor(x, y, width, height, borderradius, text, bgcolor, fontcolor) { // Align center center
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.borderradius = borderradius;
        this.text = text;
        this.bgcolor = bgcolor || 255;
        this.fontcolor = fontcolor || 0;
    }

    draw() {
        fill(this.bgcolor)
        stroke(0)
        strokeWeight(3);
        rect(this.x - this.width/2, this.y - this.height/2, this.width, this.height, this.borderradius);
        textAlign(CENTER, CENTER);
        noStroke();
        fill(this.fontcolor);
        textSize(this.height/6 | 0);
        text(this.text, this.x - this.width/2, this.y - this.height/2, this.width, this.height, this.borderradius);
    }

    onClick(x, y) {
        return x > this.x-this.width/2 && x < this.x + this.width/2 && y > this.y-this.height/2 && y < this.y + this.height/2;
    }

}