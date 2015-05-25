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
        // Touch to offset translation.
        private _touchToOffsetTranslation: Point;
        // Mouse event.
        private _event: MouseEvent;

        constructor(
            private _onMouseUp: (TouchHandler) => void,
            private _onMouseDown: (TouchHandler) => void,
            private _onMouseMove: (TouchHandler) => void)
        { }

        // Handle mouse up.
        public handleMouseUp(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._currentClientCoords = this._getEventClientCoords();

            if (this._onMouseUp != null) {
                this._onMouseUp(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
            }

            this._prevClientCoords = this._getEventClientCoords();
            this._touchClientCoords = null;
            this._event = null;
        }

        // Handle mouse down.
        public handleMouseDown(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._touchClientCoords = this._getEventClientCoords();
            this._currentClientCoords = this._getEventClientCoords();

            if (this._onMouseDown != null) {
                this._onMouseDown(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
            }

            this._prevClientCoords = this._getEventClientCoords();
            this._event = null;
        }

        // Handle mouse move.
        public handleMouseMove(e: MouseEvent, stopPropagation: boolean = false) {
            this._event = e;
            this._currentClientCoords = this._getEventClientCoords();

            // Set client to offset displacement.
            var offsetCoords = this._getEventOffsetCoords();
            this._clientToOffsetTranslation = new Point(offsetCoords.x - this._currentClientCoords.x, offsetCoords.y - this._currentClientCoords.y);
            
            if (this._onMouseMove != null) {
                this._onMouseMove(this);
            }

            if (stopPropagation) {
                e.stopPropagation();
            }

            e.preventDefault();

            this._prevClientCoords = this._getEventClientCoords();
            this._event = null;
        }

        // Determines if the event is touch based.
        public isTouch(): boolean {
            var touchEvents = ['touchstart', 'touchend', 'touchmove'];

            return (touchEvents.indexOf(this._event.type) >= 0);
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

        // Get rotation about a point between current and last coords. The angle
        // is calculated as the rotation between two vectors centered about the
        // origin.
        public getRotationAboutPoint(origin: Point): number {
            // Since we are using tangents to calculate angles, we will have
            // situtation where the angle may incorrectly reach 180 due to zero
            // or infinite slopes. This value ensures we ignore those faulty
            // values. Someone with better math knowledge should take a better
            // stab at this.
            var threshold = 90;

            // Convert current and previous coordinates to offset coordinates.
            var p1 = new Point(
                this._prevClientCoords.x + this._clientToOffsetTranslation.x,
                this._prevClientCoords.y + this._clientToOffsetTranslation.y);
            var p2 = new Point(
                this._currentClientCoords.x + this._clientToOffsetTranslation.x,
                this._currentClientCoords.y + this._clientToOffsetTranslation.y);
            
            // Calculate vectors based on the origin.
            var v1 = new Point(origin.x - p1.x, origin.y - p1.y);
            var v2 = new Point(origin.x - p2.x, origin.y - p2.y);

            // Calculate angles from horizontal.
            var angle1 = Math.atan(v1.y / v1.x);
            var angle2 = Math.atan(v2.y / v2.x);

            // Eagle flips the rotation direction.
            var degrees = (angle2 - angle1) * 180 / Math.PI * -1;
            if (Math.abs(degrees) > threshold) {
                degrees = 0;
            }

            return degrees;
        }

        // Extract client coords from event.
        private _getEventClientCoords(): Point {
            var point = new Point(null, null);

            // Touch events.
            if (this.isTouch()) {
                var touchEvent = <any> this._event;
                var changedTouches = touchEvent.originalEvent.changedTouches;
                point.setXY(changedTouches[0].clientX, changedTouches[0].clientY);
            }

            // Mouse events.
            else {
                point.setXY(this._event.clientX, this._event.clientY);
            }

            return point;
        }

        // Extract offset coords from event.
        private _getEventOffsetCoords(): Point {
            var point = new Point(null, null);

            // Touch events.
            if (this.isTouch()) {
                var touchEvent = <any> this._event;

                var targetLeft = touchEvent.target.getBoundingClientRect().left;
                var targetTop = touchEvent.target.getBoundingClientRect().top;

                var changedTouches = touchEvent.originalEvent.changedTouches;
                point.setXY(changedTouches[0].clientX - targetLeft, changedTouches[0].clientY - targetTop);
            }

            // Mouse events.
            else {
                point.setXY(this._event.offsetX, this._event.offsetY);
            }

            return point;
        }
    }



    // Modifiers for the TouchHandler event.
    export enum TouchHandlerEventModifier {
        CTRL,
        SHIFT
    }



    // Touch directive scope.
    export interface ITouchInterface extends ng.IScope {
        $event: Event;
    }



    // Touch-start directive.
    export class TouchStart {
        public link: (scope: ITouchInterface, instanceElement: JQuery, attrs: any) => void;

        constructor(private _appContext: AppContext, private _$parse: ng.IParseService) {
            var main = this;

            this.link = function (scope: ITouchInterface, instanceElement: JQuery, attrs: any) {
                var touchHandler = main._$parse(attrs.touchStart);

                instanceElement.on('touchstart', function (e) {
                    // Set the event target to the instance element.
                    e.target = instanceElement[0];

                    scope.$event = e;

                    scope.$applyAsync(function () {
                        touchHandler(scope);
                    });
                });
            };
        }

        public static Factory() {
            var directive = (AppContext: AppContext, $parse: ng.IParseService) => {
                return new TouchStart(AppContext, $parse);
            }

            return directive;
        }
    }



    // Touch-end directive.
    export class TouchEnd {
        public link: (scope: ITouchInterface, instanceElement: JQuery, attrs: any) => void;

        constructor(private _appContext: AppContext, private _$parse: ng.IParseService) {
            var main = this;

            this.link = function (scope: ITouchInterface, instanceElement: JQuery, attrs: any) {
                var touchHandler = main._$parse(attrs.touchEnd);

                instanceElement.on('touchend', function (e) {
                    // Set the event target to the instance element.
                    e.target = instanceElement[0];

                    scope.$event = e;

                    scope.$applyAsync(function () {
                        touchHandler(scope);
                    });
                });
            };
        }

        public static Factory() {
            var directive = (AppContext: AppContext, $parse: ng.IParseService) => {
                return new TouchEnd(AppContext, $parse);
            }

            return directive;
        }
    }



    // Touch-move directive.
    export class TouchMove {

        public link: (scope: ITouchInterface, instanceElement: JQuery, attrs: any) => void;

        constructor(private _appContext: AppContext, private _$parse: ng.IParseService) {
            var main = this;

            this.link = function (scope: ITouchInterface, instanceElement: JQuery, attrs: any) {
                var touchHandler = main._$parse(attrs.touchMove);

                instanceElement.on('touchmove', function (e) {
                    // Set the event target to the instance element.
                    e.target = instanceElement[0];

                    scope.$event = e;

                    scope.$applyAsync(function () {
                        touchHandler(scope);
                    });
                });
            };
        }

        public static Factory() {
            var directive = (AppContext: AppContext, $parse: ng.IParseService) => {
                return new TouchMove(AppContext, $parse);
            }

            return directive;
        }
    }
} 