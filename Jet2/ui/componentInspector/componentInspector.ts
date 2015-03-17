/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IComponentInspectorScope extends Jet.Application.IApplicationScope {
        componentData: Jet.Application.ISelectable;
        catalogModelData: Jet.Model.CatalogModelData;
    }

    export class ComponentInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IComponentInspectorScope) {
                scope.$watch('selectedGadgetComponent.selected',
                    function (gadgetModelData: Jet.Application.ISelectable) {
                        scope.componentData = gadgetModelData;

                        //if (gadgetModelData == null) {
                        //    scope.catalogModelData = null;
                        //} else {
                        //    scope.catalogModelData = scope.catalogModel.getComponent(gadgetModelData.keyname);
                        //}
                    }, true);
            };

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selectedGadgetComponent: '='
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