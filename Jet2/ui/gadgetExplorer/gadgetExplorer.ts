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
            }

            this.scope = {
                gadgetModel: '=',
                selectedGadgetComponent: '='
            };
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