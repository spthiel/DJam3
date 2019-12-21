class Grid {

    constructor() {
        this.width = 16;
        this.height = 9;
        this.grid = [];
        this.office = {"x":-1,"y":-1};
        this.freeHouses = [];
        this.occupiedHouses = [];
        this.attemps = 0;
        this.chance = 3;
        this.requests = level;
        this.finishedRequests = 0;
        this.failedRequests = 0;
        this.startedRequests = 0;
        this.totalRequests = level*20;
        this.requestCooldown = 0;
        this.generate();
    }

    regenerate() {
        this.freeHouses = [];
        this.occupiedHouses = [];
        cars = [];
        this.generate();
        updateAll = true;
        this.requests = level;
        this.finishedRequests = 0;
        this.failedRequests = 0;
        this.startedRequests = 0;
        this.totalRequests = level*20;
        this.requestCooldown = 0;
        updateTiles = [];
    }

    generate() {
        while(true) {
            for(let x = 0; x < this.width; x++) {
                this.grid[x] = [];
                for(let y = 0; y < this.height; y++) {
                    this.grid[x][y] = 0;
                }
            }

            let x = random(this.width-10)+5 | 0;
            let y = random(this.height-10)+5 | 0;
            this.office.x = x;
            this.office.y = y;
            this.grid[x][y] = new Cell(x, y, types.OFFICE);
            let queue = [this.office];
            let test = 1;
            while(queue.length > 0) {
                test++;
                let element = queue.shift();
                
                if(element.x < 0 || element.x >= this.width || element.y < 0 || element.y >= this.height) {
                    // Out of bounds
                    continue;
                }
                for(let i = 0; i < dirs.length; i++) {
                    let nx = element.x + dirs[i].dx;
                    let ny = element.y + dirs[i].dy;
                    if(nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
                        continue;
                    }
                    if(this.grid[nx][ny] == 0) {
                        if((random(this.chance) | 0) == 0) {
                            this.grid[nx][ny] = new Cell(nx, ny, types.HOUSE);
                            this.freeHouses.push(this.grid[nx][ny])
                        } else {
                            this.grid[nx][ny] = new Cell(nx, ny, types.ROAD);
                            queue.push({"x":nx,"y":ny});
                        }
                    }
                }
                if(test > this.width*this.height+2) {
                    throw "Too many tiles checked";
                }
            }
            if(this.freeHouses.length < level*10) {
                this.freeHouses = [];
                this.attemps++;
                if((this.attemps+1)%5 == 0) {
                    this.width += 16;
                    this.height += 9;
                    windowResized();
                }
                if((this.attemps+1)%40 == 0 && this.chance < 10) {
                    this.chance++;
                }
                if(this.attemps > 200) {
                    throw "Couldn't generate enough houses :( Chance: " + this.chance + " Size: " + this.width + "x" + this.height;
                }
                continue;
            }
            this.attemps = 0;
            for(let x = 0; x < this.width; x++) {
                for(let y = 0; y < this.height; y++) {
                    if(this.grid[x][y] == 0) {
                        this.grid[x][y] = new Cell(x, y, types.HOUSE);
                    }
                }
            }
            break;
        }
    }

    position(width, height) {
        let centerx = width/2;
        let centery = height/2;
        this.x = centerx - this.width*cellwidth/2
        this.y = centery - this.height*cellwidth/2
    }

    occupie(x,y) {
        if(this.grid[x][y].mailbox >= 0) {
            this.grid[x][y].mailbox = -1;
            this.finishedRequests++;
            this.requests++;
        }
    }

    free(x,y) {
        let cell = this.occupiedHouses.find(cell => cell.x == x && cell.y == y);
        if(cell) {
            this.occupiedHouses = this.occupiedHouses.filter(house => house !== cell);
            this.freeHouses.push(cell);
        }
    }

    forEach(f) {
        for(let x = 0; x < this.grid.length; x++) {
            for(let y = 0; y < this.grid[0].length; y++) {
                f(this.grid[x][y]);
            }
        }
    }

    update() {
        if(this.requests > 0) {
            if(this.requestCooldown > 0 && this.startedRequests < level) {
                this.requestCooldown--;
            } else {
                this.request()
                this.requests--;
            }
        }
        if(this.finishedRequests + this.failedRequests >= this.totalRequests) {
            if(this.finishedRequests*100/this.failedRequests >= 90) {
                gamestate = new StateNext();
            } else {
                gamestate = new StateRetry();
            }
        }
        this.forEach(cell => cell.update());
    }

    request() {
        if(this.startedRequests >= this.totalRequests) {
            return;
        }
        this.requestCooldown = 100;
        this.startedRequests++;
        let cell = random(this.freeHouses);
        cell.setMailbox();
        this.freeHouses.re
        requestUpdate(cell.x, cell.y);
        this.freeHouses = this.freeHouses.filter(house => house !== cell);
        this.occupiedHouses.push(cell);
    }

    get(x, y) {
        return this.grid[x][y];
    }

    draw() {
        if(updateAll) {
            for(let dx = 0; dx < this.width; dx++) {
                for(let dy = 0; dy < this.height; dy++) {
                    push();
                        stroke(20);
                        this.grid[dx][dy].draw(cellwidth*dx, cellwidth*dy, cellwidth, cellwidth);
                    pop();
                }
            }
        } else {
            updateTiles.forEach(tile => {
                push();
                    stroke(20);
                    try {
                    this.grid[tile.x][tile.y].draw(cellwidth*tile.x, cellwidth*tile.y, cellwidth, cellwidth);
                    } catch {
                        console.log(tile.x, tile.y)
                        throw "Meh"
                    }
                pop();
            });
            updateTiles = [];
        }
        push();
            noFill();
            stroke(255);
            strokeWeight(1);
            rect(0, 0, this.width*cellwidth, this.height*cellwidth);
        pop();
    }

    typeOf(x, y) {
        return this.grid[x][y].type;
    }
}

var maxMailbox

class Cell {

    //Type can be 0: House, 1: Postal office, 2: Street (3: DEBUG)
    constructor(x, y, type) {
        this.type = type;
        this.mailbox = -1;
        this.x = x;
        this.y = y;
    }

    draw(x,y,width,height) {
        switch(this.type) {
            case 0:
                fill(0);
                break;
            case 1:
                fill(200);
                break;
            case 2:
                fill(200,200,0);
                break;
            case 3:
                fill(0, 200, 0);
                break;
        }
        rect(x, y, width, height);
        if(this.mailbox >= 0) {
            let radius = Math.min(width,height)/3*2;
            fill(200)
            stroke(0)
            strokeWeight(1)
            arc(x+width/2, y+height/2, radius, radius, 0, TWO_PI, PIE)
            fill(0)
            noStroke()
            arc(x+width/2, y+height/2, radius, radius, TWO_PI*(this.mailbox/maxMailbox)-HALF_PI, TWO_PI-HALF_PI);
        }
    }

    setMailbox() {
        this.mailbox = 0;
    }

    update() {
        if(this.mailbox >= 0) {
            this.mailbox++;
            requestUpdate(this.x, this.y);
            if(this.mailbox > maxMailbox) {
                this.mailbox = -1;
                grid.request();
                grid.failedRequests++;
            }
        }
    }

    toString() {
        return "Cell{type:" + this.type + "}"
    }

}