/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentNameInspectorScope extends Jet.Application.IApplicationScope {
        selected: Jet.Application.ISelectable;
        componentData: Jet.Model.ComponentInstance;
    }

    export class ComponentNameInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentNameInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            this.link = function (scope: IComponentNameInspectorScope) {
                scope.$watch('selected', function () {
                    if (scope.selected instanceof Jet.Model.ComponentInstance) {
                        scope.componentData = <Jet.Model.ComponentInstance> scope.selected;
                    }
                    else if (scope.selected instanceof Jet.Model.PlacedPart) {
                        var placedPart = <Jet.Model.PlacedPart> scope.selected;
                        scope.componentData = <Jet.Model.ComponentInstance>
                            scope.gadgetModel.components[placedPart.component_name];
                    }
                });
            };

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selected: '='
            };
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new ComponentNameInspector(AppContext);
            }

            return directive;
        }
    }
} 