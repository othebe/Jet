/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentTransformationInspectorScope extends Jet.Application.IApplicationScope {
        gadgetModelData: Jet.Model.GadgetModelData;
    }

    export class ComponentTransformationInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentTransformationInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            this.link = function (scope: IComponentTransformationInspectorScope) {
                
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