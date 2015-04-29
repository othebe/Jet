/// <reference path="../abstractBoard.ts" />


module Jet.Ui.Board {
    export interface IGadgetBoardScope extends IAbstractBoardScope {
        padding: number;
    }

    export class GadgetBoard extends AbstractBoard {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoard.html';

        private _padding = Constants.Board.PCB_MARGIN;

        constructor(AppContext: AppContext) {
            super(AppContext);
        }

        /** @override */
        protected onScopeLoaded_() {
            (<IGadgetBoardScope> this.scope_).padding = fabric.util.parseUnit(this._padding);
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