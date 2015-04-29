/// <reference path="../abstractBoard.ts" />

module Jet.Ui.Board {
    export interface IGadgetBoardScope extends IAbstractBoardScope {
        boardTouchHandler: BoardTouchHandler;
        padding: number;
    }

    export class GadgetBoard extends AbstractBoard {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoard.html';

        constructor(AppContext: AppContext) {
            super(AppContext);
        }

        /** @override */
        protected onScopeLoaded_() {
            var scope = <IGadgetBoardScope> this.scope_;

            // Register padding.
            scope.padding = fabric.util.parseUnit(Constants.Board.PCB_MARGIN);

            // Register board touch handler.
            scope.boardTouchHandler = new BoardTouchHandler(
                null,
                null,
                this._onMouseMove.bind(this));
        }

        // Handle mouse move.
        private _onMouseMove(boardTouchHandler: BoardTouchHandler) {
            // Translate all selected board components.
            var selectedComponents = this.scope_.selection.getBoardComponents();
            if (selectedComponents.length > 0) {
                var translation = boardTouchHandler.getTranslation();
                if (translation == null) {
                    return;
                } else {
                    for (var i = 0; i < selectedComponents.length; i++) {
                        var placedPart = selectedComponents[i].placedPart;
                        placedPart.set_xpos(placedPart.get_xpos() + translation.x);
                        placedPart.set_ypos(placedPart.get_ypos() + translation.y);
                    }
                }
            }
        }

        /** @override */
        public templateUrl() {
            return this._templateUrl;
        }

        /** @override */
        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new GadgetBoard(AppContext);
            }

            return directive;
        }
    }
} 