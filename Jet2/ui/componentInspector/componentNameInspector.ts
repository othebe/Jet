/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentNameInspectorScope extends Jet.Application.IApplicationScope {
        selected: Selectable.ISelectable;
        name: string;
        componentData: Jet.Model.ComponentInstance;
    }

    export class ComponentNameInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentNameInspector.html";
        private _name: string = '';

        constructor(private AppContext: AppContext) {
            super(AppContext);

            this.link = function (scope: IComponentNameInspectorScope) {
                scope.$watch('selected', function () {
                    if (scope.selected == null) {
                        return;
                    }
                    else if (scope.selected.getType() == Selectable.Type.COMPONENT_INSTANCE) {
			var component = <Jet.Model.ComponentInstance>scope.selected;
			scope.componentData = component
                    }
                    else if (scope.selected.getType() == Selectable.Type.PLACED_PART) {
                        var placedPart = <Jet.Model.PlacedPart> scope.selected;
			scope.componentData = placedPart.get_component_instance();
                    }
		    //console.log("componentData = " + scope.componentData);
                    scope.name = scope.componentData.get_name();
                    this._name = scope.name;
                }.bind(this), true);

                // Rename a gadget model entry.
                scope.$watch('name', function () {
                    if (this._name != scope.name) {
                        scope.gadgetModel.rename_component(this._name, scope.name);
                    }
                }.bind(this), true);
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
