var fn = function (edm) {
    var bd = new Jet.Point(300, 150);
    var e = new Jet.Point(0, 0);

    var d =     edm.convertEagleToDisplayPoint(e, 45, bd);
    var de =    edm.convertDisplayToEaglePoint(d, 45, bd);

    console.log(e);
    console.log(de);
};


module Jet {
    // The eagle <==> display mapper is responsible for converting between
    // Eagle and Jet display coordinates.
    export class EagleDisplayMapper {
        constructor(
            private _imgHeight: number,     // Image height.
            private _imgWidth: number,      // Image width.
            private _eagleOriginX: number,  // Eagle origin-x.
            private _eagleOriginY: number,  // Eagle origin-y.
            private _displayOriginX: EagleDisplayMapper.DisplayOrigin,
            private _displayOriginY: EagleDisplayMapper.DisplayOrigin)
        {
            fn(this);
        }

        private _test() {
            var boardDimensions = new Point(300, 150);
            var e = new Point(0, 0);
            var d = this.convertEagleToDisplayPoint(e, 45, boardDimensions);
            var de = this.convertDisplayToEaglePoint(de, 45, boardDimensions);

            console.log(d);
            console.log(de);
        }

        // Convert display to Eagle coordinates.
        public convertDisplayToEaglePoint(point: Point, degrees: number, boardDimensions: Point): Point {
            var tx = point.x;
            var ty = boardDimensions.y - point.y;

            // Normalize coordinates to bottom-left of image.
            // Consider the case where the display coordinates are at the center of the image.
            if (this._displayOriginX == EagleDisplayMapper.DisplayOrigin.CENTER && this._displayOriginY == EagleDisplayMapper.DisplayOrigin.CENTER) {
                tx -= (this._imgWidth / 2);
                ty += (this._imgHeight / 2);
            } else {
                // Our current implementation only uses center/center.
                throw Jet.Constants.Strings.UNIMPLEMENTED_METHOD;
            }

            // Based on: EagleCoord + EagleTranslation = DisplayCoord
            tx -= this._eagleOriginX;
            ty += this._eagleOriginY;

            // Apply rotation.
            var radians = fabric.util.degreesToRadians(degrees);
            var transformed = fabric.util.rotatePoint(
                new fabric.Point(tx, ty),
                new fabric.Point(point.x, point.y),
                radians);
            transformed.x = parseFloat(transformed.x.toFixed(Constants.PRECISION));
            transformed.y = parseFloat(transformed.y.toFixed(Constants.PRECISION));

            return new Point(transformed.x, transformed.y);
        }

        // Convert display to Eagle coordinates.
        public convertEagleToDisplayPoint(point: Point, degrees: number, boardDimensions: Point): Point {
            var tx = point.x;
            var ty = boardDimensions.y - point.y;

            // Consider the case where the display coordinates are at the center of the image.
            if (this._displayOriginX == EagleDisplayMapper.DisplayOrigin.CENTER && this._displayOriginY == EagleDisplayMapper.DisplayOrigin.CENTER) {
                tx += (this._imgWidth / 2);
                ty += (this._imgHeight / 2);
            }
            else {
                // Our current implementation only uses center/center.
                throw Jet.Constants.Strings.UNIMPLEMENTED_METHOD;
            }

            // Based on: EagleCoord + EagleTranslation = DisplayCoord
            tx += this._eagleOriginX;
            ty += this._eagleOriginY;

            // Apply rotation.
            var radians = fabric.util.degreesToRadians(degrees);
            var transformed = fabric.util.rotatePoint(
                new fabric.Point(tx, ty),
                new fabric.Point(point.x, point.y),
                radians);
            transformed.x = parseFloat(transformed.x.toFixed(Constants.PRECISION));
            transformed.y = parseFloat(transformed.y.toFixed(Constants.PRECISION));

            return new Point(transformed.x, transformed.y);
        }

        // Get image height.
        public getHeight(): number {
            return this._imgHeight;
        }

        // Get image width.
        public getWidth(): number {
            return this._imgWidth;
        }

        // Get display origin X.
        public getDisplayOriginX(): EagleDisplayMapper.DisplayOrigin {
            return this._displayOriginX;
        }

        // Get display origin Y.
        public getDisplayOriginY(): EagleDisplayMapper.DisplayOrigin {
            return this._displayOriginY;
        }
    }

    export module EagleDisplayMapper {
        export enum DisplayOrigin {
            CENTER,
            LEFT,
            TOP,
            RIGHT
        }
    }
} 