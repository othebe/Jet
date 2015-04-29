/// <reference path="../directives.ts" />

module Jet.Ui {
    interface GadgetExplorerScope extends Jet.Application.IApplicationScope { }

    export class GadgetExplorer extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/gadgetExplorer/gadgetExplorer.html";
        private _scope: GadgetExplorerScope;

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: GadgetExplorerScope) {
                main._scope = scope;

                // Watch gadget model for changes.
                scope.$watch('gadgetModel.components', function (
                    newComponents: { [index: string]: Jet.Model.ComponentInstance },
                    oldComponents: { [index: string]: Jet.Model.ComponentInstance })
                {
                }, true);

                // Watch selection.
                scope.$watch('selection', function () {
                    var boardComponents = scope.selection.getBoardComponents();
                    
                    // Get placed parts.
                    var placedParts = [];
                    for (var i = 0; i < boardComponents.length; i++) {
                        placedParts.push(boardComponents[i]);
                    }

                    // Get component instances.
                    var componentInstances = main._getComponentsForParts(scope.selection.getBoardComponents());
                }, true);
            }

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selection: '='
            };
        }

        // Get component instances for an array of board components.
        private _getComponentsForParts(boardComponents: Array<Selection.BoardComponent>): Array<Model.ComponentInstance> {
            var components = [];
            for (var i = 0; i < boardComponents.length; i++) {
                var placedPart = boardComponents[i].placedPart;
                var component = placedPart.get_component_instance();
                if (components.indexOf(component) < 0) {
                    components.push(component);
                }
            }

            return components;
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new GadgetExplorer(AppContext);
            }

            return directive;
        }
    }
}
