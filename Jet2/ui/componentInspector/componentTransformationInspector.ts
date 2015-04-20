/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentTransformationInspectorScope extends Jet.Application.IApplicationScope {
        selected: Selectable.ISelectable;
        eagleDisplayMapper: EagleDisplayMapper;
        transformation: { translation: Point; rotation: number };
        componentData: Jet.Model.PlacedPart;
    }

    export class ComponentTransformationInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentTransformationInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IComponentTransformationInspectorScope) {
                scope.transformation = { translation: new Point(0, 0), rotation: 0 };

                scope.$watch('selected', function () {
                    if (scope.selected == null) {
                        return;
                    }
                    else if (scope.selected.getType() == Selectable.Type.COMPONENT_INSTANCE) {
                        scope.componentData = null;
                    }
                    else if (scope.selected.getType() == Selectable.Type.PLACED_PART) {
                        scope.componentData = <Jet.Model.PlacedPart> scope.selected;
                    }
                });

                scope.$root.$on(Jet.Constants.RootEvent.RESTRICT_COORDINATES, function () {
                    main._setTransformationData(scope);
                });

                scope.$watch('componentData', function () {
                    main._setTransformationData(scope);
                }, true);

                scope.$watch('transformation', function () {
                    var translation = new Point(scope.transformation.translation.x, scope.transformation.translation.y);
                    var rotation = scope.transformation.rotation;

                    var eagleCoords = scope.eagleDisplayMapper.convertDisplayToEaglePoint(translation, rotation);
                    scope.componentData.set_xpos(eagleCoords.x);
                    scope.componentData.set_ypos(eagleCoords.y);
                    scope.componentData.set_rot(rotation);
                }, true);
            }
        }

        // Sets transformation data from the data model.
        private _setTransformationData(scope: IComponentTransformationInspectorScope) {
            var translation = new Point(scope.componentData.get_xpos(), scope.componentData.get_ypos());
            var rotation = scope.componentData.get_rot();

            var displayCoords = scope.eagleDisplayMapper.convertEagleToDisplayPoint(translation, rotation);
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