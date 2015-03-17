﻿/// <reference path="../directives.ts" />

module Jet.Ui {
    interface ICatalogEntryScope extends Jet.Application.IApplicationScope {
        // Passed in from directive attribute.
        catalogModelData: Jet.Model.CatalogModelData;

        // Add component to gadget model.
        addComponentToGadget(): void;
    }

    export class CatalogEntry extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalogEntry/catalogEntry.html";

        private _catalogModelData: Jet.Model.CatalogModelData;

        constructor(AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: ICatalogEntryScope) {
                // Add component to gadget.
                scope.addComponentToGadget = function () {
                    var component = scope.catalogModelData;

                    // TODO(othebe): This should just be made into an array. A
                    // hash map is pointless since we don't need to look up
                    //  objects since we have their reference already.
                    var placedPartMap: { [index: string]: Jet.Model.PlacedPart; } = {}
                    var placedParts = component.getPlacedParts();
                    for (var i = 0; i < placedParts.length; i++) {
                        var placedPart = placedParts[i];
                        placedPartMap[placedPart.getRef()] = new Jet.Model.PlacedPart(
                            placedPart.getRef(), 100, 100, 0);
                    }
                    
                    scope.gadgetModel.add_component(
                        Math.random() + "", component.getKeyName(), placedPartMap);
                }
            };
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new CatalogEntry(AppContext);
            }

            return directive;
        }
    }
} 