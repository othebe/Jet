module Jet.Ui {
    export class ComponentInspector implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentInspector.html";

        constructor(private AppContext: AppContext) { }

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