/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentTransformationInspectorScope extends Jet.Application.IApplicationScope {
        selected: Jet.Application.ISelectable;
        componentData: Jet.Model.PlacedPart;
    }

    export class ComponentTransformationInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentTransformationInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            this.link = function (scope: IComponentTransformationInspectorScope) {
                scope.$watch('selected', function () {
                    if (scope.selected instanceof Jet.Model.ComponentInstance) {
                        scope.componentData = null;
                    }
                    else if (scope.selected instanceof Jet.Model.PlacedPart) {
                        scope.componentData = <Jet.Model.PlacedPart> scope.selected;
                    }
                });
            }
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