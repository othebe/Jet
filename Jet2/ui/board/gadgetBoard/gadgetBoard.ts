/// <reference path="../abstractBoard.ts" />

module Jet.Ui.Board {
    export interface IGadgetBoardScope extends IAbstractBoardScope {
        boardTouchHandler: TouchHandler;
        boardKeyHandler: KeyHandler;
        clickedParts: Array<Model.PlacedPart>;
        padding: number;
        pcbData: PcbData;
        selectionCoords: SelectionCoords;
        setSelectionToSingle: boolean;
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

            // This stores coordinates for a selection.
            scope.selectionCoords = new SelectionCoords(null, null);

            // This stores the board components that were clicked.
            scope.clickedParts = [];

            // Set zoom.
            scope.zoom = Application.InitialData.Board.zoom;

            // Register padding.
            scope.padding = EagleDisplayMapper.mmToPx(Constants.Board.PCB_MARGIN);

            // Register board touch handler.
            scope.boardTouchHandler = new TouchHandler(
                this._onMouseUp.bind(this),
                this._onMouseDown.bind(this),
                this._onMouseMove.bind(this));

            // Register board key handler.
            scope.boardKeyHandler = new KeyHandler(
                null,
                this._onKeyDown.bind(this),
                null);

            // Set PCB data.
            scope.$watch('boardDimensions', function () {
                scope.pcbData = this._extractPcbData();
            }.bind(this));

            // This determines if clicking a component should clear the current
            // selection and only select that component.
            scope.setSelectionToSingle = true;
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

        // Handle mouse down.
        private _onMouseDown(touchHandler: TouchHandler) {
            var scope = <IGadgetBoardScope> this.scope_;

            // Clear selection unless a move occurs.
            scope.setSelectionToSingle = true;

            // If no board components were clicked, deselect everything.
            if (scope.clickedParts.length == 0) {
                scope.selection.selectPlacedPart([]);

                // Deselection the selection box.
                scope.selectionCoords.p1 = null;
                scope.selectionCoords.p2 = null;
            }

            // Reset clicked parts.
            scope.clickedParts = [];
        }

        // Handle mouse up.
        private _onMouseUp(touchHandler: TouchHandler) {
            var scope = <IGadgetBoardScope> this.scope_;
            
            // Remove the selection box.
            scope.selectionCoords.p1 = null;
            scope.selectionCoords.p2 = null;
        }

        // Handle mouse move.
        private _onMouseMove(touchHandler: TouchHandler) {
            // If the left mouse button is not held, do not apply translation.
            if (touchHandler.getMouseButton() != 1) {
                return;
            }

            var scope = <IGadgetBoardScope> this.scope_;
            var selectionCoords = scope.selectionCoords;

            // Translate all selected board components.
            var selectedComponents = scope.selection.getPlacedParts();
            if (selectedComponents.length > 0 && selectionCoords.p1 == null) {
                var translation = touchHandler.getTranslation();

                // Preserve selection due to the move.
                scope.setSelectionToSingle = false;

                if (translation == null) {
                    return;
                } else {
                    for (var i = 0; i < selectedComponents.length; i++) {
                        var placedPart = selectedComponents[i];
                        this.translateBoardComponentBy_(placedPart, translation);
                    }
                }
            }

            // Create selection area.
            else {
                selectionCoords.p1 = touchHandler.getOriginalCoordinates();
                selectionCoords.p2 = touchHandler.getCurrentCoordinates();
            }
        }

        // Handle key down.
        private _onKeyDown(keyHandler: KeyHandler) {
            // Handle Delete key.
            if (keyHandler.getKeyCode() == 46) {
                var selected = this.getSelectedComponents_();
                for (var i = 0; i < selected.length; i++) {
                    this.deleteComponent_(selected[i]);
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