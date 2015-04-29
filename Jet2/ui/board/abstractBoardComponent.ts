// This represents an abstract board component.

module Jet.Ui.Board {
    export interface IAbstractBoardComponentScope extends Application.IApplicationScope {
        boardComponent: Model.PlacedPart;
        catalogModel: Model.CatalogModel;
        handleMouseMove: (e: MouseEvent) => void;
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
                        var isSelected = scope.selection.getBoardComponentByPlacedPart(placedPart) != null;
                        scope.isSelected = isSelected;
                    }
                }, true);

                // TODO: Shouldn't be here.
                // Handle mouse move.
                scope.handleMouseMove = function(e: MouseEvent) {
                    main.handleMouseMove_(e);
                };

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

        // Handle mouse movement.
        protected handleMouseMove_(e: MouseEvent) { }
    }
} 