/// <reference path="../directives.ts" />

module Jet.Ui {
    export class ComponentTransformationInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentTransformationInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            this.link = function (scope: Jet.Application.IApplicationScope) {
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