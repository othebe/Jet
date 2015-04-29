module Jet.Selection {
    // A selectable board component.
    export class BoardComponent {
        // TODO (othebe): The eagleDisplayMapper should just be retrieved from the catalog placed part data.
        constructor(public placedPart: Jet.Model.PlacedPart, public eagleDisplayMapper: Jet.EagleDisplayMapper) {
        }
    }

    // This class handles currently selected UI data in Jet.
    export class Manager {
        private _boardComponents: Array<BoardComponent>;
        private _board: any;

        constructor() {
            this._boardComponents = [];
            this._board = null;
        }


        /** BOARD COMPONENTS */

        // Get selected board components.
        public getBoardComponents() {
            return this._boardComponents;
        }

        // Select board components.
        public selectBoardComponents(boardComponents: Array<BoardComponent>) {
            this._boardComponents = [];
            for (var i = 0; i < boardComponents.length; i++) {
                this._boardComponents.push(boardComponents[i]);
            }
        }

        // Add board component to selection.
        public addBoardComponent(boardComponent: Array<Jet.Model.PlacedPart>) {
            throw Jet.Constants.Strings.UNIMPLEMENTED_METHOD;
        }

        // Get selected board components by placed part.
        public getBoardComponentByPlacedPart(placedPart: Model.PlacedPart): BoardComponent {
            for (var i = 0; i < this._boardComponents.length; i++) {
                if (this._boardComponents[i].placedPart == placedPart) {
                    return this._boardComponents[i];
                }
            }
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