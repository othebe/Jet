/// <reference path="../abstractBoard.ts" />

module Jet.Ui.Board {
    export interface IGadgetBoardScope extends IAbstractBoardScope {
        boardTouchHandler: TouchHandler;
        padding: number;
        pcbData: PcbData;
        zoom: number;
    }

    export class PcbData {
        constructor(public x: number, public y: number, public width: number, public height: number) { }
    }

    export class GadgetBoard extends AbstractBoard {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoard.html';

        constructor(AppContext: AppContext) {
            super(AppContext);
        }

        /** @override */
        protected onScopeLoaded_() {
            var scope = <IGadgetBoardScope> this.scope_;

            // Set zoom.
            scope.zoom = Application.InitialData.Board.zoom;

            // Register padding.
            scope.padding = fabric.util.parseUnit(Constants.Board.PCB_MARGIN);

            // Register board touch handler.
            scope.boardTouchHandler = new TouchHandler(
                null,
                null,
                this._onMouseMove.bind(this));

            // Set PCB data.
            scope.$watch('boardDimensions', function () {
                scope.pcbData = this._extractPcbData();
            }.bind(this));
        }

        // Extract PCB data from the instance element.
        private _extractPcbData(): PcbData {
            var scope = <IGadgetBoardScope> this.scope_;

            if (scope.boardDimensions == null) {
                return;
            }

            var x = scope.padding;
            var y = scope.padding;
            var width = scope.boardDimensions.width;
            var height = scope.boardDimensions.height;

            return new PcbData(x, y, width, height);
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