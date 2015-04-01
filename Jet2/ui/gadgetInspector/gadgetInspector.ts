/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IGadgetInspectorScope extends Jet.Application.IApplicationScope {
        board: { top: number; left: number; width: number; height: number }
    }

    export class GadgetInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/gadgetInspector/gadgetInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IGadgetInspectorScope) {
                // Board dimensions.
                var bbox = scope.gadgetModel.bounding_box();
                scope.board = {
                    top: bbox.min_y,
                    left: bbox.min_x,
                    width: bbox.max_x - bbox.min_x,
                    height: bbox.max_y - bbox.min_y
                };

                scope.$watch('board', function () {
                    var board = scope.board;
                    scope.gadgetModel.set_corners([
                        new Jet.Model.Vertex(board.left, board.top),
                        new Jet.Model.Vertex(board.left + board.width, board.top),
                        new Jet.Model.Vertex(board.left + board.width, board.top + board.height),
                        new Jet.Model.Vertex(board.left, board.top + board.height)
                    ]);
                }, true);
            };

            this.scope = {
                gadgetModel: '='
            };
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new GadgetInspector(AppContext);
            }

            return directive;
        }
    }
} 
