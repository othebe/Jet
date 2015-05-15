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

        private _catalogModelData: Jet.Model.CatalogModelData;

        constructor(AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: ICatalogEntryScope, instanceElement: JQuery) {
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
                                componentName + '_' + componentCtr,
                                component.getKeyName());
                            added = true;
                        } catch (e) {
                            componentCtr++;
                        }
                    }
                };

                // Enable dragging.
                main._enableDrag(scope, instanceElement.find('div')[0]);
            };
        }

        // Enable dragging on element.
        private _enableDrag(scope: ICatalogEntryScope, elt: HTMLElement) {
            elt.draggable = true;
            elt.ondragstart = function (e: any) {
                // Set ghost.
                var img = document.createElement('img');
                img.src = scope.catalogModelData.getSvgUrl();
                e.dataTransfer.setDragImage(img, 0, 0);

                // Set data.
                e.dataTransfer.setData(Constants.DragDrop.CATALOG_DATA, scope.catalogModelData.getKeyName());
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