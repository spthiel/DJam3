const maxProgress = 10;

class Car {

    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.progress = 0;
        this.size = size;
        this.path = [];
        this.selected = false;
        this.occupies = false;
    }

    isHere(x, y) {
        return x > this.x + this.dx - 0.3 && x < this.x + this.dx + 1.3 && y > this.y + this.dy - 0.3 && y < this.y + this.dy + 1.3;
    }

    update() {
        if(this.path.length == 0) {
            let cell = grid.get(this.x, this.y);
            if(cell.mailbox > 0) {
                grid.occupie(this.x, this.y);
                this.occupies = true;
            }
            return;
        }
        if(this.occupies) {
            grid.free(this.x, this.y);
        }
        let cell = grid.get(this.path[0].x, this.path[0].y);
        if(cell.mailbox > 0) {
            cell.mailbox--;
        }
        if(!this.last) {
            this.last = this.path[this.path.length-1];
        }
        this.progress++;
        this.dx = (this.last.dir.dx) * this.progress/maxProgress;
        this.dy = (this.last.dir.dy) * this.progress/maxProgress;
        if(this.progress > maxProgress) {
            this.path.pop();
            this.x = this.last.x;
            this.y = this.last.y;
            this.dx = 0;
            this.dy = 0;
            this.last = null;
            this.progress = 0;
        }
    }

    drawPath() {
        if(this.path.length == 0) {
            return;
        }
        push(); 
            stroke(0,0,255);
            strokeWeight(cellwidth/10);
            noFill();
            let last = {"x":this.x + this.dx,"y":this.y + this.dy};
            for(let i = this.path.length-1; i >= 0; i--) {
                let current = this.path[i];
                requestUpdate(last.x, last.y);
                line(last.x*cellwidth + cellwidth/2, last.y*cellwidth + cellwidth/2, current.x*cellwidth + cellwidth/2, current.y*cellwidth + cellwidth/2);
                last = current;
            }
            strokeWeight(5);
            requestUpdate(last.x, last.y);
            point(last.x * cellwidth + cellwidth/2, last.y * cellwidth + cellwidth/2);
        pop();
    }

    draw() {
        requestUpdate(this.x, this.y);
        shadowPoint(this.selected ? 255 : 0,0, this.selected ? 0 : 255, (this.x + this.dx)*cellwidth + cellwidth/2, (this.y + this.dy)*cellwidth + cellwidth/2, cellwidth/3*2);
    }

    findInArrays(x, y, done, queue) {
        let out = done.find(e => e.x == x && e.y == y);
        if(out) {
            return out;
        }
        if(queue) {
            return queue.find(e => e.x == x && e.y == y);
        } else {
            return null;
        }
    }

    findPath(x, y) {
        let queue = [];
        let done = [];
        if(this.last) {
            queue.push({"x":this.last.x,"y":this.last.y});
        } else {
            queue.push({"x":this.x,"y":this.y});
        }
        let first = true;
        while(queue.length != 0) {
            let element = queue.shift();
            if(element.x == x && element.y == y) {
                this.path = this.traceBack(element,done);
                return true;
            }
            if(element.x < 0 || element.x >= grid.width || element.y < 0 || element.y >= grid.height) {
                // Out of bounds
                continue;
            }
            if(!first && grid.typeOf(element.x, element.y) == types.HOUSE) {
                // Can only drive on roads
                continue;
            }
            for(let i = 0; i < dirs.length; i++) {
                let nx = element.x + dirs[i].dx;
                let ny = element.y + dirs[i].dy;
                if(nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) {
                    continue;
                }
                if(!this.findInArrays(nx, ny, done, queue)) {
                    if(first && grid.typeOf(nx,ny) == types.HOUSE) {
                        if(grid.typeOf(element.x, element.y) != types.ROAD) {
                            continue;
                        }
                    }
                    queue.push({"x":nx,"y":ny, "dir":dirs[i]});
                }
            }
            first = false;
            done.push(element);
        }
        return false;
    }

    traceBack(final, done) {
        let path = [];
        let element = final;
        while(element.dir) {
            path.push(element);
            let nx = element.x - element.dir.dx;
            let ny = element.y - element.dir.dy;
            element = this.findInArrays(nx, ny, done);
        }
        if(this.last != null) {
            path.push(this.last);
        }
        return path;
    }

}