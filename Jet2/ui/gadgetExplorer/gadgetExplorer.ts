module Jet.Ui {
    export class GadgetExplorer implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/gadgetExplorer/gadgetExplorer.html";

        constructor(private AppContext: AppContext) { }

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