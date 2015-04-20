/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IComponentInspectorScope extends Jet.Application.IApplicationScope {
        selected: Selectable.ISelectable;
        eagleDisplayMapper: EagleDisplayMapper;
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
                        if (selected.getType() == Selectable.Type.COMPONENT_INSTANCE) {
                            var componentInstance = <Jet.Model.ComponentInstance> selected;
                            scope.catalogModelData = scope.catalogModel.getComponent(componentInstance.keyname);
                        }
                        else if (selected.getType() == Selectable.Type.PLACED_PART) {
                            var placedPart = <Jet.Model.PlacedPart> selected;
                            var componentInstance = scope.gadgetModel.components[placedPart.component_name];
                            scope.catalogModelData = scope.catalogModel.getComponent(componentInstance.keyname);
                        }
                        scope.eagleDisplayMapper = scope.selectedGadgetComponent.eagleDisplayMapper;
                        scope.selected = selected;
                    }
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
