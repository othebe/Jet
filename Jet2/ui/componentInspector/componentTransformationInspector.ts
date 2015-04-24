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
                    var boardComponents = scope.selection.getBoardComponents();

                    // Transformations will only be shown if a single board component is selected.
                    if (boardComponents.length == 1) {
                        main._placedPart = boardComponents[0].placedPart;
                        main._eagleDisplayMapper = boardComponents[0].eagleDisplayMapper;
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
                    }

                    var translation = new Point(scope.transformation.translation.x, scope.transformation.translation.y);
                    var rotation = scope.transformation.rotation;

                    var eagleCoords = main._eagleDisplayMapper.convertDisplayToEaglePoint(translation, rotation);
                    main._placedPart.set_xpos(eagleCoords.x);
                    main._placedPart.set_ypos(eagleCoords.y);
                    main._placedPart.set_rot(rotation);
                }, true);
            }
        }

        // Get component instances for an array of board components.
        private _getComponentsForParts(boardComponents: Array<Selection.BoardComponent>): Array<Model.ComponentInstance> {
            var components = [];
            for (var i = 0; i < boardComponents.length; i++) {
                var placedPart = boardComponents[i].placedPart;
                var component = placedPart.get_component_instance();
                if (components.indexOf(component) < 0) {
                    components.push(component);
                }
            }

            return components;
        }

        // Sets transformation data from the data model.
        private _setTransformationData(scope: IComponentTransformationInspectorScope) {
            if (this._eagleDisplayMapper == null) {
                return;
            }

            var translation = new Point(this._placedPart.get_xpos(), this._placedPart.get_ypos());
            var rotation = this._placedPart.get_rot();
            var displayCoords = this._eagleDisplayMapper.convertEagleToDisplayPoint(translation, rotation);
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