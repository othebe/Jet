module Jet.Ui {
    interface GadgetExplorerScope extends Jet.Application.IApplicationScope { }

    export class GadgetExplorer implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/gadgetExplorer/gadgetExplorer.html";
        private _scope: GadgetExplorerScope;
        
        public link: (scope: GadgetExplorerScope) => void;

        constructor(private AppContext: AppContext) {
            var main = this;

            this.link = function (scope: GadgetExplorerScope) {
                main._scope = scope;

                // Watch gadget model for changes.
                scope.$watch('gadgetModel.components', function (
                    newComponents: { [index: string]: Jet.Model.GadgetModelData },
                    oldComponents: { [index: string]: Jet.Model.GadgetModelData })
                {
                }, true);

                // Watch selected gadget model data for changes.
                // scope.$watch('selectedGadgetComponent', function
            }
        }

        public scope() {
            return {
                ngModel: '='
            }
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