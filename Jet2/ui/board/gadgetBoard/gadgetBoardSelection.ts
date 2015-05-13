/// <reference path="../../directives.ts" />

// This represents an abstract base class for a JET board.
module Jet.Ui.Board {
    export interface IGadgetBoardSelectionScope extends Application.IApplicationScope {
        gadgetModel: Model.GadgetModel;
        padding: number;
        pcbData: PcbData;
        selection: Selection.Manager;
        selectionCoords: SelectionCoords;
        transformation: Transformation;
    }

    export class SelectionCoords {
        constructor(public p1: Point, public p2: Point) { }
    }

    class Transformation {
        constructor(public x: number, public y: number, public width: number, public height: number) { }

        public setData(x: number, y: number, width: number, height: number) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
    }

    export class GadgetBoardSelection extends Ui.Directive {
        private _templateUrl = 'ui/board/gadgetBoard/gadgetBoardSelection.html';

        protected scope_: IGadgetBoardSelectionScope;

        constructor(protected AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IGadgetBoardSelectionScope) {
                main.scope_ = scope;

                scope.transformation = new Transformation(0, 0, 0, 0);

                scope.$watch('selectionCoords', function () {
                    main._setTransformation(scope);
                    main._setSelection(scope);
                }, true);
            };

            this.scope = {
                gadgetModel: '=',
                padding: '=',
                pcbData: '=',
                selection: '=',
                selectionCoords: '='
            };
        }

        // Set transformation for selection box.
        private _setTransformation(scope: IGadgetBoardSelectionScope) {
            var selectionCoords = scope.selectionCoords;
            if (selectionCoords == null || selectionCoords.p1 == null || selectionCoords.p2 == null) {
                scope.transformation.setData(null, null, null, null);
            } else {
                var x = Math.min(selectionCoords.p1.x, selectionCoords.p2.x);
                var y = Math.min(selectionCoords.p1.y, selectionCoords.p2.y);
                var width = Math.abs(selectionCoords.p1.x - selectionCoords.p2.x);
                var height = Math.abs(selectionCoords.p1.y - selectionCoords.p2.y);

                scope.transformation.setData(x, y, width, height);
            }
        }

        // Select board components within selection.
        private _setSelection(scope: IGadgetBoardSelectionScope) {
            var selectionTransformation = scope.transformation;

            if (selectionTransformation.x == null || selectionTransformation.y == null) {
                return;
            }

            scope.selection.selectPlacedPart([]);

            var boardComponents = scope.gadgetModel.get_parts();
            for (var i = 0; i < boardComponents.length; i++) {
                var boardComponent = boardComponents[i];
                var transformation = GadgetBoardComponent.getDisplayTransformationForComponent(boardComponent, scope.padding, scope.pcbData);
                var centerX = transformation.x + transformation.imgWidth / 2;
                var centerY = transformation.y + transformation.imgHeight / 2;
                
                if (centerX >= selectionTransformation.x && centerX <= selectionTransformation.x + selectionTransformation.width &&
                    centerY >= selectionTransformation.y && centerY <= selectionTransformation.y + selectionTransformation.height)
                {
                    scope.selection.addPlacedPart([boardComponent]);
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
                return new GadgetBoardSelection(AppContext);
            }

            return directive;
        }
    }
} 