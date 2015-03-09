/// <reference path="../directives.ts" />

module Jet.Ui {
    export class Catalog extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalog/catalog.html";

        constructor(AppContext: AppContext) {
            super(AppContext);
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new Catalog(AppContext);
            }

            return directive;
        }
    }
} 