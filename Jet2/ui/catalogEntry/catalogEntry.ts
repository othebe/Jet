module Jet.Ui {
    export class CatalogEntry implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalogEntry/catalogEntry.html";

        private _catalogModelData: CatalogModelData;

        constructor() { }

        public scope() {
            return {
                ngModel: '='
            }
        }

        public link(scope, element, attrs) {
            console.log(scope);
            //var key = attrs.key;
            //var components = scope.catalogModel.getComponents();
            //console.log(this);
            //this._catalogModelData = this._findCatalogModelData(components, key);
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

        private _findCatalogModelData(components: Array<CatalogModelData>, key):CatalogModelData {
            // TODO: Store keys for catalog components on model.
            for (var i = 0; i < components.length; i++) {
                if (components[i].getKeyName == key)
                    return components[i];
            }
        }
    }
} 