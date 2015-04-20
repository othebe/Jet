module Jet {
    // A simple, yet fundamental Point class.
    export class Point {
        constructor(public x: number, public y: number) { }

        public setXY(x: number, y: number) {
            this.x = x;
            this.y = y;
        }
    }
} 