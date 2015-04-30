/// <reference path="../abstractBoard.ts" />

module Jet.Ui.Board {
    export interface IGadgetBoardScope extends IAbstractBoardScope {
        boardTouchHandler: TouchHandler;
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
            scope.boardTouchHandler = new TouchHandler(
                null,
                null,
                this._onMouseMove.bind(this));
        }

        // Handle mouse move.
        private _onMouseMove(touchHandler: TouchHandler) {
            // Translate all selected board components.
            var selectedComponents = this.scope_.selection.getPlacedParts();
            if (selectedComponents.length > 0) {
                var translation = touchHandler.getTranslation();
                if (translation == null) {
                    return;
                } else {
                    for (var i = 0; i < selectedComponents.length; i++) {
                        var placedPart = selectedComponents[i];
                        this.translateBoardComponentBy_(placedPart, translation);
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