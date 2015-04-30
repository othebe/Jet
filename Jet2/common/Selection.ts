module Jet.Selection {
    // This class handles currently selected UI data in Jet.
    export class Manager {
        private _placedParts: Array<Model.PlacedPart>;
        private _board: any;

        constructor() {
            this._placedParts = [];
            this._board = null;
        }

        /** BOARD COMPONENTS */

        // Get selected placed parts.
        public getPlacedParts(): Array<Model.PlacedPart> {
            return this._placedParts;
        }

        // Get selected component instances.
        public getComponentInstances(): Array<Model.ComponentInstance> {
            var components = [];
            for (var i = 0; i < this._placedParts.length; i++) {
                var placedPart = this._placedParts[i];
                var component = placedPart.get_component_instance();
                if (components.indexOf(component) < 0) {
                    components.push(component);
                }
            }

            return components;
        }

        // Select placed part.
        public selectPlacedPart(placedParts: Array<Model.PlacedPart>) {
            this._placedParts = [];
            for (var i = 0; i < placedParts.length; i++) {
                this._placedParts.push(placedParts[i]);
            }
        }

        // Add placed part to selection.
        public addPlacedPart(placedParts: Array<Model.PlacedPart>) {
            for (var i = 0; i < placedParts.length; i++) {
                var placedPart = placedParts[i];
                if (this._placedParts.indexOf(placedPart) < 0) {
                    this._placedParts.push(placedParts[i]);
                }
            }
        }

        // Remove placed part from selection.
        public removePlacedPart(placedParts: Array<Model.PlacedPart>) {
            var remaining = [];
            for (var i = 0; i < this._placedParts.length; i++) {
                var placedPart = this._placedParts[i];
                if (placedParts.indexOf(placedPart) < 0) {
                    remaining.push(placedPart);
                }
            }

            this._placedParts = remaining;
        }


        /** BOARD */
        public setBoard(board: any) {
            this._board = board;
        }

        public getBoard() {
            return this._board;
        }
    }
} 