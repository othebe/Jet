/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IComponentInspectorScope extends Jet.Application.IApplicationScope {
        selected: Jet.Application.ISelectable;
        catalogModelData: Jet.Model.CatalogModelData;
    }

    export class ComponentInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentInspector.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IComponentInspectorScope) {
                scope.$watch('selectedGadgetComponent.selected', function () {
                    var selected = scope.selectedGadgetComponent.selected;
                       
                    if (selected == null) {
                        scope.catalogModelData = null;
                        scope.selected = null;
                    } else {
                        if (selected instanceof Jet.Model.ComponentInstance) {
                            scope.catalogModelData = scope.catalogModel.getComponent(selected.keyname);
                        }
                        else if (selected instanceof Jet.Model.PlacedPart) {
                            var componentInstance = scope.gadgetModel.components[selected.componentInstanceName];
                            scope.catalogModelData = scope.catalogModel.getComponent(componentInstance.keyname);
                        }
                        scope.selected = selected;
                    }
                }, true);
            };

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selectedGadgetComponent: '=',
		myvariable: '='
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
