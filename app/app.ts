import * as rules from "./rules";


export class PixelAccessor  {
    height: number;
    row: number = 0;
    col: number = 0;

    r: number;
    g: number;
    b: number;

    blocked: boolean = false;

    public in: Uint8ClampedArray;
    constructor(i: Uint8ClampedArray, public out: Uint8ClampedArray, public width: number) {
        this.in = i;
        this.height = this.in.length / 4 / width;
    }

    up(): PixelAccessor {
        if (this.blocked) { return this; }
        let prevRow = this.row;
        this.row = Math.max(Math.min(this.height, this.row - 1), 0);

        this.checkBlocked(prevRow, this.row);
        return this.get();
    }

    down(): PixelAccessor {
        if (this.blocked) { return this; }
        let prevRow = this.row;
        this.row = Math.max(Math.min(this.height, this.row + 1), 0);

        this.checkBlocked(prevRow, this.row);
        return this.get();
    }

    left(): PixelAccessor {
        if (this.blocked) { return this; }
        let prevCol = this.col;
        this.col = Math.max(Math.min(this.width, this.col - 1), 0);

        this.checkBlocked(this.row, prevCol);
        return this.get();
    }

    right(): PixelAccessor {
        if (this.blocked) { return this; }
        let prevCol = this.col;
        this.col = Math.max(Math.min(this.width, this.col + 1), 0);

        this.checkBlocked(this.row, prevCol);
        return this.get();
    }

    get(): PixelAccessor {
        this.r = this.in[((this.row * this.width) + this.col) * 4];
        this.g = this.in[((this.row * this.width) + this.col) * 4 + 1];
        this.b = this.in[((this.row * this.width) + this.col) * 4 + 2];

        return this;
    }

    put(): PixelAccessor {
        this.out[(this.row * this.width + this.col) * 4] = this.r;
        this.out[(this.row * this.width + this.col) * 4 + 1] = this.g;
        this.out[(this.row * this.width + this.col) * 4 + 2] = this.b;

        return this;
    }

    warp(i: number): PixelAccessor {
        this.col = i % this.width;
        this.row = Math.floor(i / this.width);
        this.blocked = false;
        return this;
    }

    private checkBlocked(prevRow: number, prevCol: number) {
        this.blocked = (prevRow == this.row && prevCol == this.col);
    }
}

export interface Rule {
    isApplicable(pixels: PixelAccessor): boolean;
    apply(pixels: PixelAccessor);
}


class App {
    in: Uint8ClampedArray;
    out: Uint8ClampedArray;
    ctx: CanvasRenderingContext2D;
    rules: Rule[] = [];

    width: number;
    height: number;

    constructor(id: string) {
        let canvas = document.getElementById(id) as HTMLCanvasElement;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.in = new Uint8ClampedArray(canvas.width * canvas.height * 4);
        this.out = new Uint8ClampedArray(canvas.width * canvas.height * 4);

        // clear alpha  channel
        for (var i = 0; i < this.in.length / 4; i++) {
            this.out[i * 4 - 1] = 255;
            this.in[i * 4 - 1] = 255;
        }
    }

    addRule(rule: Rule) {
        this.rules.push(rule);
    }

    applyRules() {
        let accessor = new PixelAccessor(this.in, this.out, this.width);
        for (let i = 0; i < this.in.length / 4; i++) {
            for (var rule of this.rules) {
                accessor.warp(i).get();
                if (rule.isApplicable(accessor)) {
                    rule.apply(accessor);
                    break;
                }
            }
        }

        this.ctx.putImageData(new ImageData(this.out, this.width, this.height), 0, 0);
        this.swapBuffers();
    }

    swapBuffers() {
        let tmp = this.in;
        this.in = this.out;
        this.out = this.in;
    }

    loop() {
        this.applyRules();
        requestAnimationFrame(() => this.loop());
    }
}

window.onload = () => {
    let app = new App("canvas");

    app.addRule(new rules.GreenUp());
    app.addRule(new rules.RedRightOfGreen());
    app.addRule(new rules.Burn());
    app.addRule(new rules.Randomizer());
    // app.addRule(new rules.BurnDown());
    app.addRule(new rules.RandomNoiser());
    app.addRule(new rules.SpreadBlack());
    app.addRule(new rules.BreakBlocks());
    app.addRule(new rules.SpreadWhite());
    app.loop();
};
