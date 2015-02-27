module Jet.Ui {
    export class ComponentNameInspector implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentNameInspector.html";

        constructor(private AppContext: AppContext) { }

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