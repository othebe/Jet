/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentTransformationInspectorScope extends Jet.Application.IApplicationScope {
        transformation: { translation: Point; rotation: number };
    }

    export class ComponentTransformationInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentTransformationInspector.html";
        private _placedPart: Model.PlacedPart = null;
        private _eagleDisplayMapper: EagleDisplayMapper = null;

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IComponentTransformationInspectorScope) {
                scope.transformation = { translation: new Point(0, 0), rotation: 0 };

                scope.$watch('selection', function () {
                    var placedParts = scope.selection.getPlacedParts();

                    // Transformations will only be shown if a single board component is selected.
                    if (placedParts.length == 1) {
                        main._placedPart = placedParts[0];
                        main._eagleDisplayMapper = placedParts[0].get_catalog_data().getEagleDisplayMapper();
                        main._setTransformationData(scope);
                    } else {
                        main._placedPart = null;
                        main._eagleDisplayMapper = null;
                    }
                }, true);

                scope.$root.$on(Jet.Constants.RootEvent.RESTRICT_COORDINATES, function () {
                    main._setTransformationData(scope);
                });

                scope.$watch('transformation', function () {
                    if (main._eagleDisplayMapper == null) {
                        return;
                    } else {
                        main._updateTransformationData(scope);
                    }
                }, true);
            }
        }

        // Updates transformation in the data model.
        private _updateTransformationData(scope: IComponentTransformationInspectorScope) {
            var translation = new Point(scope.transformation.translation.x, scope.transformation.translation.y);
            var rotation = scope.transformation.rotation;

            var boardBB = scope.gadgetModel.bounding_box();
            var boardWidth = fabric.util.parseUnit((boardBB.max_x - boardBB.min_x) + Constants.Board.MODEL_UNITS);
            var boardHeight = fabric.util.parseUnit((boardBB.max_y - boardBB.min_y) + Constants.Board.MODEL_UNITS);
            var boardDimensions = new Point(boardWidth, boardHeight);

            var eagleCoords = this._eagleDisplayMapper.convertDisplayToEaglePoint(translation, rotation, boardDimensions);

            this._placedPart.set_xpos(eagleCoords.x);
            this._placedPart.set_ypos(eagleCoords.y);
            this._placedPart.set_rot(rotation);
        }

        // Sets transformation data from the data model.
        private _setTransformationData(scope: IComponentTransformationInspectorScope) {
            if (this._eagleDisplayMapper == null) {
                return;
            }

            // Get board dimensions.
            var boardBB = scope.gadgetModel.bounding_box();
            var boardWidth = fabric.util.parseUnit((boardBB.max_x - boardBB.min_x) + Constants.Board.MODEL_UNITS);
            var boardHeight = fabric.util.parseUnit((boardBB.max_y - boardBB.min_y) + Constants.Board.MODEL_UNITS);
            var boardDimensions = new Point(boardWidth, boardHeight);

            var translation = new Point(this._placedPart.get_xpos(), this._placedPart.get_ypos());
            var rotation = this._placedPart.get_rot();
            var displayCoords = this._eagleDisplayMapper.convertEagleToDisplayPoint(translation, rotation, boardDimensions);
            displayCoords.x = parseFloat(displayCoords.x.toFixed(Jet.Constants.PRECISION));
            displayCoords.y = parseFloat(displayCoords.y.toFixed(Jet.Constants.PRECISION));

            scope.transformation.translation = displayCoords;
            scope.transformation.rotation = rotation;
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new ComponentTransformationInspector(AppContext);
            }

            return directive;
        }
    }
} 