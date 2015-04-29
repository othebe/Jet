/// <reference path="../directives.ts" />

module Jet.Ui {
    interface ICatalogEntryScope extends Jet.Application.IApplicationScope {
        // Passed in from directive attribute.
        catalogModelData: Jet.Model.CatalogModelData;

        // Add component to gadget model.
        addComponentToGadget(): void;
    }

    export class CatalogEntry extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/catalogEntry/catalogEntry.html";

        // TODO (othebe): Add dynamically to center.
        private _DEFAULT_X = 100;
        private _DEFAULT_Y = 100;

        private _catalogModelData: Jet.Model.CatalogModelData;

        constructor(AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: ICatalogEntryScope) {
                // Add component to gadget.
                scope.addComponentToGadget = function () {
                    // SS: This should probably be routed through the board, so
                    // the board can decide where to put the newly placed
                    // parts.
                    var component = scope.catalogModelData;
                    // Add component to gadget.
                    var added: boolean = false;
                    var componentCtr = 0;
                    var componentName = component.getKeyName();

                    while (!added) {
                        try {
                            scope.gadgetModel.add_component(
                                component,
                                componentName + '_' + componentCtr, component.getKeyName()
                            //part_locations
                                );
                            added = true;
                        } catch (e) {
                            componentCtr++;
                        }
                    }
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