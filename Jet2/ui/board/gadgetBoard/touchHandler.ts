module Jet.Ui.Board {
    // The TouchHandler object is responsible for all mouse related logic on the gadget board.
    export class TouchHandler {
        // Coordinates of original action.
        private _originalCoords: Point;
        // Coordinates of current location.
        private _currentCoords: Point;
        // Coordinates of last location.
        private _lastCoords: Point;

        constructor(
            private _onMouseUp: (TouchHandler) => void,
            private _onMouseDown: (TouchHandler) => void,
            private _onMouseMove: (TouchHandler) => void
        ) { }

        // Handle mouse up.
        public handleMouseUp(e: MouseEvent, stopPropagation: boolean = false) {
            this._currentCoords = new Point(e.clientX, e.clientY);

            if (this._onMouseUp != null) {
                this._onMouseUp(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }

            this._lastCoords = new Point(e.clientX, e.clientY);
            this._originalCoords = null;
        }

        // Handle mouse down.
        public handleMouseDown(e: MouseEvent, stopPropagation: boolean = false) {
            this._originalCoords = new Point(e.clientX, e.clientY);
            this._currentCoords = new Point(e.clientX, e.clientY);

            if (this._onMouseDown != null) {
                this._onMouseDown(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }

            this._lastCoords = new Point(e.clientX, e.clientY);
        }

        // Handle mouse move.
        public handleMouseMove(e: MouseEvent, stopPropagation: boolean = false) {
            this._currentCoords = new Point(e.clientX, e.clientY);

            if (this._onMouseMove != null) {
                this._onMouseMove(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }
            this._lastCoords = new Point(e.clientX, e.clientY);
        }

        // Get translation between current and last coords.
        public getTranslation(): Point {
            if (this._originalCoords == null) {
                return null;
            } else {
                return new Point(
                    this._currentCoords.x - this._lastCoords.x,
                    this._currentCoords.y - this._lastCoords.y);
            }
        }

        // Get rotation about a point between current and last coords.
        public getRotationAboutPoint(origin: Point): number {
            // TODO (othebe): Need to do.
            return null;
        }
    }
} 