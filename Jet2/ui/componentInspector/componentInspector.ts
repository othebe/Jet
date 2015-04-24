/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IComponentInspectorScope extends Jet.Application.IApplicationScope {
        selection: Selection.Manager;
        eagleDisplayMapper: EagleDisplayMapper;
        catalogModelData: Jet.Model.CatalogModelData;
    }

    export class ComponentInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IComponentInspectorScope) {
            };

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selection: '='
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
