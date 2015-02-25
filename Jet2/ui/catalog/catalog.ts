module Jet.Ui {
    export class Catalog implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalog/catalog.html";

        constructor() { }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = () => {
                return new Catalog();
            }

            return directive;
        }
    }
} 