/// <reference path="../directives.ts" />

// This represents an abstract base class for a JET board.
module Jet.Ui.Board {
    class BoardDimensions {
        constructor(public width: number, public height: number) { }
    }

    export interface IAbstractBoardScope extends Application.IApplicationScope {
        // Board components.
        boardComponents: Array<Model.PlacedPart>;

        // Board dimensions.
        boardDimensions: BoardDimensions;
    }

    export class AbstractBoard extends Ui.Directive {
        protected scope_: IAbstractBoardScope;

        constructor(protected AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IAbstractBoardScope) {
                main.scope_ = scope;
                
                // Watch for new components in the gadget model.
                scope.$watch('gadgetModel.get_components()', function () {
                    main._updateBoardComponents();
                }, true);

                // Update board dimensions.
                scope.$watch('gadgetModel.corners', function () {
                    scope.boardDimensions = main._getBoardDimensions(scope.gadgetModel);
                }, true);

                main.onScopeLoaded_();
            };

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selection: '='
            };
        }

        // Call once scope has been loaded.
        protected onScopeLoaded_() { }

        // Translate board component.
        protected translateBoardComponentBy_(boardComponent: Model.PlacedPart, translation: Point) {
            boardComponent.set_xpos(boardComponent.get_xpos() + translation.x);
            boardComponent.set_ypos(boardComponent.get_ypos() + translation.y);
        }

        // Rotate board component.
        protected rotateBoardComponentBy_(boardComponent: Model.PlacedPart, rotation: number) {
            boardComponent.set_rot(boardComponent.get_rot() + rotation);
        }

        // Set board dimensions.
        private _getBoardDimensions(gadgetModel: Model.GadgetModel): BoardDimensions {
            var bb = gadgetModel.bounding_box();
            var width = fabric.util.parseUnit((bb.max_x - bb.min_x) + Constants.Board.MODEL_UNITS);
            var height = fabric.util.parseUnit((bb.max_y - bb.min_y) + Constants.Board.MODEL_UNITS);
            return new BoardDimensions(width, height);
        }

        // Update the board components with the current set of placed parts.
        private _updateBoardComponents() {
            this.scope_.boardComponents = this.scope_.gadgetModel.get_parts();
        }
    }
} 