module Jet.Ui {
    interface ICatalogEntryScope extends Jet.Application.IApplicationScope {
        // Passed in from directive attribute.
        catalogModelData: Jet.Model.CatalogModelData;

        // Add component to gadget model.
        addComponentToGadget(): void;
    }

    export class CatalogEntry implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalogEntry/catalogEntry.html";

        private _catalogModelData: Jet.Model.CatalogModelData;

        constructor() { }

        public scope() {
            return {
                ngModel: '='
            }
        }

        public link(scope: ICatalogEntryScope) {
            scope.addComponentToGadget = function () {
                var component = scope.catalogModelData;
                scope.gadgetModel.add_component(
                    Math.random() + "",     /** Name */
                    component.getKeyName()  /** Key name */
                    );
            }
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = () => {
                return new CatalogEntry();
            }

            return directive;
        }
    }
} 