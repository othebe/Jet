/// <reference path="../../directives.ts" />

// This represents an abstract base class for a JET board.
module Jet.Ui.Board {
    export interface IGadgetBoardControls extends Application.IApplicationScope {
        // Zoom.
        setZoom: (number) => void;
        zoom: number;
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
            };

            this.scope = {
                zoom: '='
            };
        }

        // Set zoom.
        private _setZoom(zoom: number) {
            this.scope_.zoom = zoom;
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