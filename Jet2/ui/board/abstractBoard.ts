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
        protected instanceElement_: JQuery;

        constructor(protected AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IAbstractBoardScope, instanceElement: JQuery) {
                main.scope_ = scope;
                main.instanceElement_ = instanceElement;

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

        // Get selected component instances.
        protected getSelectedComponents_() {
            return this.scope_.selection.getComponentInstances();
        }

        // Delete board component.
        protected deleteComponent_(componentInstance: Model.ComponentInstance) {
            this.scope_.gadgetModel.delete_component(componentInstance.get_name());
            this.scope_.selection.selectPlacedPart([]);
        }

        // Translate board component.
        protected translateBoardComponentBy_(boardComponent: Model.PlacedPart, translation: Point) {
            // Eagle flips the y-axis.
            var yTranslation = translation.y * -1;

            var xMm = boardComponent.get_xpos() + EagleDisplayMapper.pxToMm(translation.x);
            var yMm = boardComponent.get_ypos() + EagleDisplayMapper.pxToMm(yTranslation);

            boardComponent.set_xpos(xMm);
            boardComponent.set_ypos(yMm);
        }

        // Rotate board component.
        protected rotateBoardComponentBy_(boardComponent: Model.PlacedPart, rotation: number) {
            var rot = boardComponent.get_rot();
            var eagleDisplayMapper = boardComponent.get_catalog_data().getEagleDisplayMapper();

            var currentCoords = eagleDisplayMapper.convertEagleToDisplayPoint(
                new Point(boardComponent.get_xpos(), boardComponent.get_ypos()), rot);
            var newCoords = eagleDisplayMapper.convertDisplayToEaglePoint(
                new Point(currentCoords.x, currentCoords.y), rot + rotation);

            boardComponent.set_xpos(newCoords.x);
            boardComponent.set_ypos(newCoords.y);
            boardComponent.set_rot(rot + rotation);
        }

        // Set board dimensions.
        private _getBoardDimensions(gadgetModel: Model.GadgetModel): BoardDimensions {
            var bb = gadgetModel.bounding_box();
            var width = EagleDisplayMapper.mmToPx(bb.max_x - bb.min_x);
            var height = EagleDisplayMapper.mmToPx(bb.max_y - bb.min_y);

            return new BoardDimensions(width, height);
        }
    }
} 
