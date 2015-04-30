/// <reference path="../directives.ts" />

module Jet.Ui {
    // This scope points to the component inspector's scope.
    interface IComponentNameInspectorScope extends Jet.Application.IApplicationScope {
        name: string;
        componentData: Jet.Model.ComponentInstance;
    }

    export class ComponentNameInspector extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentNameInspector.html";
        private _name: string = '';

        constructor(private AppContext: AppContext) {
            super(AppContext);
            var main = this;

            this.link = function (scope: IComponentNameInspectorScope) {
                scope.$watch('selection', function () {
                    // Check if multiple components are selected.
                    var components = scope.selection.getComponentInstances();
                    if (components.length > 1) {
                        scope.name = Constants.Strings.MULTIPLE_COMPONENTS_SELECTED;
                    } else if (components.length == 1) {
                        scope.name = components[0].get_name();
                    } else {
                        scope.name = null;
                    }

                    main._name = scope.name;
                }, true);

                // Rename a gadget model entry.
                scope.$watch('name', function (newName: string, oldName: string) {
                    if (main._name != null && main._name != newName) {
                        scope.gadgetModel.rename_component(oldName, newName);
                        main._name = newName;
                    }
                }, true);
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
                return new ComponentNameInspector(AppContext);
            }

            return directive;
        }
    }
} 
