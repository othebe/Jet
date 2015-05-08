﻿module Jet.Ui {
    // The TouchHandler object is responsible for all mouse related logic.
    export class TouchHandler {
        // Coordinates of original action.
        private _originalCoords: Point;
        // Coordinates of current location.
        private _currentCoords: Point;
        // Coordinates of last location.
        private _lastCoords: Point;
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
            this._event = null;
        }

        // Handle mouse down.
        public handleMouseDown(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
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
            this._event = null;
        }

        // Handle mouse move.
        public handleMouseMove(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._currentCoords = new Point(e.clientX, e.clientY);

            if (this._onMouseMove != null) {
                this._onMouseMove(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }
            this._lastCoords = new Point(e.clientX, e.clientY);
            this._event = null;
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