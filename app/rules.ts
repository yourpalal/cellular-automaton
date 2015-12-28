import {Rule, PixelAccessor} from "./app";

export class GreenUp implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return (pixels.g - ((pixels.r - pixels.b) / 2)) > 40;
    }

    apply(pixels: PixelAccessor) {
        pixels.r -= 5;
        pixels.g -= 18;
        pixels.b -= 5;
        if (pixels.put().up().blocked) {
            return;
        }
        pixels.g += 10;

        if (pixels.put().up().blocked) {
            return;
        }
        pixels.g += 8;
        pixels.put();
    }
}

export class RedRightOfGreen implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return ((pixels.g - (pixels.r - pixels.b) / 2) > 40 && !pixels.right().blocked);
    }

    apply(pixels: PixelAccessor) {
        pixels.right();
        pixels.r += 20;
        pixels.put();
    }
}

export class Burn implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return (pixels.r > 20);
    }

    apply(pixels: PixelAccessor) {
        if (pixels.r < 100) {
            pixels.r += 20;
            pixels.put();
            return;
        }

        pixels.r += 20;
        pixels.g += 10;
        pixels.b += 10;
        pixels.put();

        if (pixels.up().up().blocked) {
            return;
        }

        pixels.r += 8;
        pixels.put();
    }
}

export class BurnDown implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return ((pixels.r + pixels.g + pixels.b) < 100)
            && !pixels.up().blocked
            &&  pixels.r > 20;
    }

    apply(pixels: PixelAccessor) {
        pixels.r -= 20;
        pixels.put();
    }
}


export class Randomizer implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return ((pixels.r == pixels.g
                || pixels.g == pixels.b)
                && ((Math.random() * 100) <= 5));
    }

    apply(pixels: PixelAccessor) {
        pixels.r = Math.random() * 100 + 150;
        pixels.g = Math.random() * 100 + 150;
        pixels.b = Math.random() * 100 + 150;
        pixels.put();
    }
}

export class RandomNoiser implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return Math.random() <= 0.01;
    }

    apply(pixels: PixelAccessor) {
        pixels.r += Math.random() * 100 - 50;
        pixels.g += Math.random() * 100 - 50;
        pixels.b += Math.random() * 100 - 50;
        pixels.put();
    }
}

export class SpreadBlack implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return (pixels.r + pixels.g + pixels.b) < 20 && Math.random() < 0.90;
    }

    apply(pixels: PixelAccessor) {
        pixels.r = 0;
        pixels.g = 0;
        pixels.b = 0;
        pixels.put();

        if (!pixels.up().blocked) {
            pixels.r -= 10;
            pixels.g -= 10;
            pixels.b -= 10;
            pixels.put();
            pixels.down();
        }

        if (!pixels.right().blocked) {
            pixels.r -= 10;
            pixels.g -= 10;
            pixels.b -= 10;
            pixels.put();
            pixels.down();
        }

        if (!pixels.blocked) {
            pixels.r -= 10;
            pixels.g -= 10;
            pixels.b -= 10;
            pixels.put();
        }
    }
}

export class SpreadWhite implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        return (pixels.r + pixels.g + pixels.b) > 300;
    }

    apply(pixels: PixelAccessor) {
        pixels.r = 100;
        pixels.g = 100;
        pixels.b = 100;
        pixels.put();

        if (!pixels.up().blocked) {
            pixels.r += 10;
            pixels.g += 10;
            pixels.b += 10;
            pixels.put();
            pixels.down();
        }

        if (!pixels.left().blocked) {
            pixels.r += 10;
            pixels.g += 10;
            pixels.b += 10;
            pixels.put();
            pixels.up();
        }

        if (!pixels.blocked) {
            pixels.r += 10;
            pixels.g += 10;
            pixels.b += 10;
            pixels.put();
        }
    }
}

export class BreakBlocks implements Rule {
    isApplicable(pixels: PixelAccessor): boolean {
        let {r, g, b} = pixels;

        return (!pixels.down().blocked
            && (pixels.r == r) && (pixels.g == g) && (pixels.b == b)
            && !pixels.down().blocked
            && (pixels.r == r) && (pixels.g == g) && (pixels.b == b)
            && !pixels.down().blocked
            && (pixels.r == r) && (pixels.g == g) && (pixels.b == b));
    }

    apply(pixels: PixelAccessor) {
        pixels.r += Math.random() * 100 - 50;
        pixels.put().down();

        pixels.g += Math.random() * 100 - 50;
        pixels.put().down();

        pixels.b += Math.random() * 100 - 50;
        pixels.put().down();
    }
}
