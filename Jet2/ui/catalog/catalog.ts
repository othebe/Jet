/// <reference path="../directives.ts" />

module Jet.Ui {
    interface ICatalogScope extends Jet.Application.IApplicationScope {
        filterByName: (_: Jet.Model.CatalogModelData) => boolean;
        filterText: string;
    }

    export class Catalog extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalog/catalog.html";

        constructor(AppContext: AppContext) {
            super(AppContext);

            this.link = function (scope: ICatalogScope) {
                scope.filterText = "";

                scope.filterByName = function (catalogModelData: Jet.Model.CatalogModelData) {
                    var searchIndex = catalogModelData.getSearchIndex();
                    var filterText = scope.filterText.toLowerCase();

                    return searchIndex.indexOf(filterText) == 0;
                }
            }

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                displayMode: '='
            };
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