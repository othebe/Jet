/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IGadgetInspectorScope extends Jet.Application.IApplicationScope {
    }

    export class GadgetInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/gadgetInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IGadgetInspectorScope) {
                
            };

            this.scope = {
                gadgetModel: '='
            };
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new ComponentInspector(AppContext);
            }

            return directive;
        }
    }
} 
