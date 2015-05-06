module Jet {
    // The eagle <==> display mapper is responsible for converting between
    // Eagle and Jet display coordinates.
    export class EagleDisplayMapper {
        constructor(
            private _imgHeight: number,     // Image height.
            private _imgWidth: number,      // Image width.
            private _eagleOriginX: number,  // Eagle origin-x.
            private _eagleOriginY: number)  // Eagle origin-y.
        { }

        // Convert display to Eagle coordinates.
        public convertDisplayToEaglePoint(point: Point, degrees: number, boardDimensions: Point): Point {
            var tx = point.x;
            var ty = point.y;

            // Based on: EagleCoord + EagleTranslation = DisplayCoord
            tx -= this._eagleOriginX;
            ty += this._eagleOriginY;

            // Apply rotation.
            var radians = fabric.util.degreesToRadians(degrees);
            var transformed = fabric.util.rotatePoint(
                new fabric.Point(tx, ty),
                new fabric.Point(point.x, point.y),
                radians);

            return transformed;
        }

        // Convert display to Eagle coordinates.
        public convertEagleToDisplayPoint(point: Point, degrees: number, boardDimensions: Point): Point {
            var tx = point.x;
            var ty = point.y;

            // Based on: EagleCoord + EagleTranslation = DisplayCoord
            tx += this._eagleOriginX;
            ty -= this._eagleOriginY;

            // Apply rotation.
            var radians = fabric.util.degreesToRadians(degrees);
            var transformed = fabric.util.rotatePoint(
                new fabric.Point(tx, ty),
                new fabric.Point(point.x, point.y),
                radians);

            return transformed;
        }

        // Get image height.
        public getHeight(): number {
            return this._imgHeight;
        }

        // Get image width.
        public getWidth(): number {
            return this._imgWidth;
        }

        // Convert pixels to mm.
        // Adapted from Fabric.js.
        static pxToMm(px: number): number {
            /**
             * Pixel per Inch as a default value set to 96. Can be changed for more realistic conversion.
             */
            var DPI = 96;
            return px * 25.4 / DPI;
        }

        // Convert mm to pixels.
        static mmToPx(mm: number): number {
            /**
             * Pixel per Inch as a default value set to 96. Can be changed for more realistic conversion.
             */
            var DPI = 96;
            return mm * DPI / 25.4;
        }
    }
} 