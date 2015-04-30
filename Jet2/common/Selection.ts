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

        // Select board components.
        public selectBoardComponents(placedParts: Array<Model.PlacedPart>) {
            this._placedParts = [];
            for (var i = 0; i < placedParts.length; i++) {
                this._placedParts.push(placedParts[i]);
            }
        }

        // Add board component to selection.
        public addBoardComponent(boardComponent: Array<Jet.Model.PlacedPart>) {
            throw Jet.Constants.Strings.UNIMPLEMENTED_METHOD;
        }

        // Get selected board components by placed part.
        //public getBoardComponentByPlacedPart(placedPart: Model.PlacedPart): BoardComponent {
        //    for (var i = 0; i < this._placedParts.length; i++) {
        //        if (this._placedParts[i].placedPart == placedPart) {
        //            return this._placedParts[i];
        //        }
        //    }
        //}

        /** BOARD */
        public setBoard(board: any) {
            this._board = board;
        }

        public getBoard() {
            return this._board;
        }
    }
} 