module Jet.Ui {
    // The KeyHandler object is responsible for all key related logic.
    export class KeyHandler {

        // Mouse event.
        private _event: KeyboardEvent;

        constructor(
            private _onKeyUp: (KeyHandler) => void,
            private _onKeyDown: (KeyHandler) => void,
            private _onKeyPress: (KeyHandler) => void
            ) { }

        // Handle key up.
        public handleKeyUp(e: KeyboardEvent, stopPropagation: boolean = false) {
            this._event = e;

            if (this._onKeyUp != null) {
                this._onKeyUp(this);
                this._event.preventDefault();
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }
        }

        // Handle key dowb.
        public handleKeyDown(e: KeyboardEvent, stopPropagation: boolean = false) {
            this._event = e;

            if (this._onKeyDown != null) {
                this._onKeyDown(this);
                this._event.preventDefault();
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }
        }

        // Handle key press.
        public handleKeyPress(e: KeyboardEvent, stopPropagation: boolean = false) {
            this._event = e;

            if (this._onKeyPress != null) {
                this._onKeyPress(this);
                this._event.preventDefault();
            }

            if (stopPropagation) {
                e.stopPropagation();
                e.cancelBubble = true;
            }
        }

        // Get key.
        public getKey(): string {
            if (this._event != null) {
                return this._event.key;
            }
        }

        // Get key code.
        public getKeyCode(): number {
            if (this._event != null) {
                return this._event.keyCode || this._event.which;
            }
        }
    }
} 