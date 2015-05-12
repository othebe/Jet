module Jet.Ui {
    // The TouchHandler object is responsible for all mouse related logic.
    export class TouchHandler {
        // Coordinates of original touch.
        private _touchClientCoords: Point;
        // Coordinates of current location.
        private _currentClientCoords: Point;
        // Coordinates of last location.
        private _prevClientCoords: Point;
        // Client to offset translation.
        private _clientToOffsetTranslation: Point;
        // Mouse event.
        private _event: MouseEvent;

        constructor(
            private _onMouseUp: (TouchHandler) => void,
            private _onMouseDown: (TouchHandler) => void,
            private _onMouseMove: (TouchHandler) => void
        ) { }

        // Handle mouse up.
        public handleMouseUp(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._currentClientCoords = new Point(e.clientX, e.clientY);

            if (this._onMouseUp != null) {
                this._onMouseUp(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
            }

            this._prevClientCoords = new Point(e.clientX, e.clientY);
            this._touchClientCoords = null;
            this._event = null;
        }

        // Handle mouse down.
        public handleMouseDown(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._touchClientCoords = new Point(e.clientX, e.clientY);
            this._currentClientCoords = new Point(e.clientX, e.clientY);

            if (this._onMouseDown != null) {
                this._onMouseDown(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
            }

            this._prevClientCoords = new Point(e.clientX, e.clientY);
            this._event = null;
        }

        // Handle mouse move.
        public handleMouseMove(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._currentClientCoords = new Point(e.clientX, e.clientY);

            // Set client to offset displacement.
            this._clientToOffsetTranslation = new Point(e.offsetX - e.clientX, e.offsetY - e.clientY);

            if (this._onMouseMove != null) {
                this._onMouseMove(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
            }
            e.preventDefault();

            this._prevClientCoords = new Point(e.clientX, e.clientY);
            this._event = null;
        }

        // Get the mouse button.
        public getMouseButton(): number {
            return this._event.which;
        }

        // Get the key modifier. Currently only handles a single modifier.
        public getEventModifier(): TouchHandlerEventModifier {
            if (this._event.ctrlKey) {
                return TouchHandlerEventModifier.CTRL;
            }
            else if (this._event.shiftKey) {
                return TouchHandlerEventModifier.SHIFT;
            }
        }

        // Get original click coordinates.
        public getOriginalCoordinates(getOffset: boolean = true): Point {
            // Return offset coordinates.
            if (getOffset) {
                return new Point(
                    this._touchClientCoords.x + this._clientToOffsetTranslation.x,
                    this._touchClientCoords.y + this._clientToOffsetTranslation.y);
            }
            // Return client coordinates.
            else {
                return this._touchClientCoords;
            }
        }

        // Get current coordinates.
        public getCurrentCoordinates(getOffset: boolean = true): Point {
            // Return offset coordinates.
            if (getOffset) {
                return new Point(
                    this._currentClientCoords.x + this._clientToOffsetTranslation.x,
                    this._currentClientCoords.y + this._clientToOffsetTranslation.y);
            }
            // Return client coordinates.
            else {
                return this._currentClientCoords;
            }
        }

        // Get translation between current and last coords.
        public getTranslation(): Point {
            if (this._touchClientCoords == null) {
                return null;
            } else {
                return new Point(
                    this._currentClientCoords.x - this._prevClientCoords.x,
                    this._currentClientCoords.y - this._prevClientCoords.y);
            }
        }

        // Get rotation about a point between current and last coords.
        public getRotationAboutPoint(origin: Point): number {
            // TODO (othebe): Need to do.
            // Calculate angle between the vectors between origin-original and origin-current.
            return;
        }
    }

    // Modifiers for the TouchHandler event.
    export enum TouchHandlerEventModifier {
        CTRL,
        SHIFT
    }
} 