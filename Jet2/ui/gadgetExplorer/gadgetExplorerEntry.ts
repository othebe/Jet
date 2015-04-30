/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IGadgetExplorerEntryScope extends Jet.Application.IApplicationScope {
        // Component instance.
        component: Model.ComponentInstance;

        // Catalog model data for this component instance.
        catalogModelData: Model.CatalogModelData;

        // Is component instance selected.
        isComponentInstanceSelected: () => boolean;

        // Is placed part selected.
        isPlacedPartSelected: (placedPart: Model.PlacedPart) => boolean;

        // Selection toggles.
        toggleSelectedComponent(event: Event);
        toggleSelectedPlacedPart(placedPart: Model.PlacedPart, event: Event);
    }

    export class GadgetExplorerEntry extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/gadgetExplorer/gadgetExplorerEntry.html";
        private _scope: IGadgetExplorerEntryScope;

        // Delays to prevent Angular from registering double clicks as single clicks.
        private _CLICK_DELAY = 500;
        private _isDelayed = false;

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IGadgetExplorerEntryScope) {
                main._scope = scope;

                // Watch selection.
                scope.$watch('selection', function () {
                });

                // Determine if the component instance is selected.
                scope.isComponentInstanceSelected = function (): boolean {
                    var componentInstances = scope.selection.getComponentInstances();
                    return componentInstances.indexOf(scope.component) >= 0;

                };

                // Determine if the placed part is selected.
                scope.isPlacedPartSelected = function (placedPart: Model.PlacedPart): boolean {
                    var placedParts = scope.selection.getPlacedParts();
                    return placedParts.indexOf(placedPart) >= 0;
                };

                scope.toggleSelectedComponent = function (event: Event) {
                    if (main._isDelayed) {
                        return;
                    }
                    
                    // Select all placed parts in the component.
                    var placedParts = scope.component.get_placed_parts();
                    scope.selection.selectBoardComponents(placedParts);

                    event.stopPropagation();

                    main._setDelay();
                };

                scope.toggleSelectedPlacedPart = function (placedPart: Model.PlacedPart, event: Event) {
                    if (main._isDelayed) {
                        return;
                    }

                    scope.selection.selectBoardComponents([
                        placedPart
                    ]);

                    event.stopPropagation();

                    main._setDelay();
                };
            };

            this.scope = {
                component: '=',
                catalogModelData: '=',
                selection: '='
            };
        }

        // Set delay.
        private _setDelay() {
            this._isDelayed = true;
            setTimeout(function () {
                this._isDelayed = false;
            }.bind(this), this._CLICK_DELAY);
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new GadgetExplorerEntry(AppContext);
            }

            return directive;
        }
    }
} 