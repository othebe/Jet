// This represents an abstract board component.

module Jet.Ui.Board {
    export interface IAbstractBoardComponentScope extends Application.IApplicationScope {
        boardComponent: Model.PlacedPart;
        catalogModel: Model.CatalogModel;
        isSelected: boolean;
        selection: Selection.Manager;
    }

    export class AbstractBoardComponent extends Ui.Directive {
        constructor(protected AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IAbstractBoardComponentScope, instanceElement: JQuery) {
                // Update the UI when board component details change.
                scope.$watch('boardComponent', function () {
                    main.updateUi_(scope);
                }, true);

                // Set selection status.
                scope.$watch('selection', function () {
                    if (scope.selection == null) {
                        return;
                    } else {
                        var placedPart = scope.boardComponent;
                        var isSelected = scope.selection.getPlacedParts().indexOf(placedPart) >= 0;
                        scope.isSelected = isSelected;
                    }
                }, true);

                main.onScopeLoaded_(scope, instanceElement);
            };

            this.scope = {
                boardComponent: '=',
                catalogModel: '=',
                selection: '='
            };
        }

        // Call once scope has been loaded.
        protected onScopeLoaded_(scope: IAbstractBoardComponentScope, instanceElement: JQuery) { }

        // Update UI based on placed part data.
        protected updateUi_(scope: IAbstractBoardComponentScope) { }

        // Add to selection.
        protected addToSelected_(scope: IAbstractBoardComponentScope) {
            scope.isSelected = true;

            var placedPart = scope.boardComponent;
            scope.selection.addBoardComponent([placedPart]);
        }

        // Set selected.
        protected setSelected_(scope: IAbstractBoardComponentScope, isSelected: boolean) {
            scope.isSelected = isSelected;

            var placedPart = scope.boardComponent;
            var boardComponents = [
                placedPart
            ];
            scope.selection.selectBoardComponents(boardComponents);
        }

        // Rotate board component.
        protected rotateBoardComponentBy_(boardComponent: Model.PlacedPart, rotationDelta: number) {
            var rot = boardComponent.get_rot();
            var eagleDisplayMapper = boardComponent.get_catalog_data().getEagleDisplayMapper();

            var currentCoords = eagleDisplayMapper.convertEagleToDisplayPoint(
                new Point(boardComponent.get_xpos(), boardComponent.get_ypos()), rot);
            var newCoords = eagleDisplayMapper.convertDisplayToEaglePoint(
                new Point(currentCoords.x, currentCoords.y), rot + rotationDelta);

            boardComponent.set_xpos(newCoords.x);
            boardComponent.set_ypos(newCoords.y);
            boardComponent.set_rot(rot + rotationDelta);
        }
    }
} 