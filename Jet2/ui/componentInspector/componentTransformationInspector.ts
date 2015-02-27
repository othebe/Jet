module Jet.Ui {
    export class ComponentTransformationInspector implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/componentInspector/componentTransformationInspector.html";

        constructor(private AppContext: AppContext) { }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new ComponentTransformationInspector(AppContext);
            }

            return directive;
        }
    }
} 