class Grid {

    constructor() {
        this.width = theMap.width;
        this.height = theMap.height;
        let layer = theMap.layers[0];
        this.grid = [];
        let officeIsSet = false;
        this.office = {"x":-1,"y":-1};
        this.houses = [];
        this.generate();
    }

    generate() {
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
        this.grid[x][y] = new Cell(types.OFFICE);
        let queue = [this.office];
        let test = 1;
        while(queue.length > 0) {
            test++;
            let element = queue[0];
            queue = queue.slice(1);
            
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
                    this.grid[nx][ny] = (random(4) | 0) == 0 ? new Cell(types.HOUSE) : new Cell(types.ROAD);
                    queue.push({"x":nx,"y":ny});
                }
            }
            if(test > 32*32+2) {
                console.log(queue, this.grid)
                throw "Too many tiles checked";
            }
        }
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                if(this.grid[x][y] == 0) {
                    this.grid[x][y] = new Cell(types.HOUSE);
                }
            }
        }
    }

    position(width, height) {
        let centerx = width/2;
        let centery = height/2;
        this.x = centerx - this.width*cellwidth/2
        this.y = centery - this.height*cellwidth/2
    }

    forEach(f) {
        for(let x = 0; x < this.grid.length; x++) {
            for(let y = 0; y < this.grid[0].length; y++) {
                f(this.grid[x][y]);
            }
        }
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
                    this.grid[tile.x][tile.y].draw(cellwidth*tile.x, cellwidth*tile.y, cellwidth, cellwidth);
                pop();
            });
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

class Cell {

    constructor(type) { //Type can be 0: House, 1: Postal office, 2: Street
        this.type = type;
    }

    draw(x,y,width,height) {
        switch(this.type) {
            case 0:
                fill(0)
                break;
            case 1:
                fill(200)
                break;
            case 2:
                fill(200,200,0)
                break;
        }
        rect(x, y, width, height);
    }

    toString() {
        return "Cell{type:" + this.type + "}"
    }

}