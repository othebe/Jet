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

        // Event handlers.
        keyHandler: KeyHandler;
        touchHandler: TouchHandler;
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

                scope.keyHandler = new KeyHandler(
                    null,
                    main._onKeyDown.bind(main),
                    null);

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

                scope.toggleSelectedComponent = function (event: MouseEvent) {
                    main._toggleSelectedComponent(scope, event);
                };

                scope.toggleSelectedPlacedPart = function (placedPart: Model.PlacedPart, event: MouseEvent) {
                    main._toggleSelectedPlacedPart(scope, placedPart, event);
                };
            };

            this.scope = {
                component: '=',
                catalogModelData: '=',
                gadgetModel: '=',
                selection: '='
            };
        }

        // Handle key down.
        private _onKeyDown(keyHandler: KeyHandler) {
            // Handle Delete key.
            if (keyHandler.getKeyCode() == 46) {
                var selected = this._scope.selection.getComponentInstances();
                for (var i = 0; i < selected.length; i++) {
                    this._scope.gadgetModel.delete_component(selected[i].get_name());
                }
                this._scope.selection.selectPlacedPart([]);
            }
        }

        // Toggle selected component.
        private _toggleSelectedComponent(scope: IGadgetExplorerEntryScope, event: MouseEvent) {
            if (this._isDelayed) {
                return;
            }

            var parts = scope.component.get_placed_parts();

            // Ctrl key modifier.
            if (event.ctrlKey) {
                scope.selection.addPlacedPart(parts);
            }

            // Shift key modifier.
            else if (event.shiftKey) {
                var endSelection = false;
                var selectionComponents = [];
                var componentNames = scope.gadgetModel.component_names();

                for (var i = 0; i < componentNames.length; i++) {
                    var componentName = componentNames[i];
                    var component = scope.gadgetModel.components[componentName];

                    endSelection = (component == scope.component);

                    var placedParts = component.get_placed_parts();
                    scope.selection.addPlacedPart(placedParts);
                    
                    if (endSelection) {
                        break;
                    }
                }
            }

            // No modifier.
            else {
                scope.selection.selectPlacedPart(parts);
            }

            event.stopPropagation();
            this._setDelay();
        }

        // Toggle selected placed part.
        private _toggleSelectedPlacedPart(scope: IGadgetExplorerEntryScope, placedPart: Model.PlacedPart, event: MouseEvent) {
            if (this._isDelayed) {
                return;
            }

            // Ctrl key modifier.
            if (event.ctrlKey) {
                scope.selection.addPlacedPart([placedPart]);
            }

            // Shift key modifier.
            else if (event.shiftKey) {
                var endSelection = false;
                var component = placedPart.get_component_instance();
                var otherPlacedParts = component.get_placed_parts();

                for (var i = 0; i < otherPlacedParts.length; i++) {
                    var otherPlacedPart = otherPlacedParts[i];
                    endSelection = (otherPlacedPart == placedPart);

                    scope.selection.addPlacedPart([otherPlacedPart]);

                    if (endSelection) {
                        break;
                    }
                }
            }

            // No modifier.
            else {
                scope.selection.selectPlacedPart([placedPart]);
            }

            event.stopPropagation();
            this._setDelay();
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