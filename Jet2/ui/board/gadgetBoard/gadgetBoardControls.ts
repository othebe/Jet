/// <reference path="../../directives.ts" />

// This represents an abstract base class for a JET board.
module Jet.Ui.Board {
    export interface IGadgetBoardControls extends Application.IApplicationScope {
        selection: Selection.Manager;

        // Zoom.
        setZoom: (number) => void;
        zoom: number;

        // Edit board.
        toggleEditGadget: () => void;
    }

    export class GadgetBoardControls extends Ui.Directive {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoardControls.html';

        protected scope_: IGadgetBoardControls;

        constructor(protected AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IGadgetBoardControls) {
                main.scope_ = scope;
                
                // Zoom.
                scope.setZoom = function (zoom: number) {
                    main._setZoom(zoom);
                };

                // Toggle edit board.
                scope.toggleEditGadget = function () {
                    main._toggleEditGadget();
                };
            };

            this.scope = {
                isPerspectiveTouchBased: '=',
                selection: '=',
                zoom: '='
            };
        }

        // Set zoom.
        private _setZoom(zoom: number) {
            this.scope_.zoom = zoom;
        }

        // Toggle edit gadget.
        private _toggleEditGadget() {
            var board = (this.scope_.selection.getBoard() == null) ? true : null;
            this.scope_.selection.setBoard(board);
        }

        /** @override */
        public templateUrl() {
            return this._templateUrl;
        }

        /** @override */
        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new GadgetBoardControls(AppContext);
            }

            return directive;
        }
    }
} 