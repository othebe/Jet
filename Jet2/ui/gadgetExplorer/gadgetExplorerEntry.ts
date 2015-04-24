/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IGadgetExplorerEntryScope extends Jet.Application.IApplicationScope {
        // Component instance.
        component: Model.ComponentInstance;

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
                    var componentInstances = main._getComponentsForParts(scope.selection.getBoardComponents());
                    return componentInstances.indexOf(scope.component) >= 0;

                };

                // Determine if the placed part is selected.
                scope.isPlacedPartSelected = function (placedPart: Model.PlacedPart): boolean {
                    var boardComponents = scope.selection.getBoardComponents();
                    for (var i = 0; i < boardComponents.length; i++) {
                        if (boardComponents[i].placedPart == placedPart) {
                            return true;
                        }
                    }
                    return false;
                };

                scope.toggleSelectedComponent = function (event: Event) {
                    if (main._isDelayed) {
                        return;
                    }
                    
                    // Select all placed parts in the component.
                    var boardComponents = [];
                    var placedParts = scope.component.get_placed_parts();
                    for (var i = 0; i < placedParts.length; i++) {
                        boardComponents.push(new Selection.BoardComponent(placedParts[i], null));
                    }
                    scope.selection.selectBoardComponents(boardComponents);

                    event.stopPropagation();

                    main._setDelay();
                };

                scope.toggleSelectedPlacedPart = function (placedPart: Model.PlacedPart, event: Event) {
                    if (main._isDelayed) {
                        return;
                    }

                    scope.selection.selectBoardComponents([
                        new Selection.BoardComponent(placedPart, null)
                    ]);

                    event.stopPropagation();

                    main._setDelay();
                };

                //// Watch for changes to selected gadget component.
                //scope.$watch('selectedGadgetComponent.selected', function () {
                //    if (scope.selectedGadgetComponent == null) {
                //        scope.isSelected = false;
                //    } else {
                //        var selected = scope.selectedGadgetComponent.selected;
                //        var isSelected = (selected != null && selected == scope.placedPart);
                //        scope.isSelected = isSelected;
                //    }
                //}, true);

                //// Toggle selected gadget model data.
                //scope.toggleSelected = function () {
                //    var selected = scope.selectedGadgetComponent.selected;

                //    if (selected == scope.placedPart) {
                //        scope.selectedGadgetComponent.selected = null;
                //    } else {
                //        scope.selectedGadgetComponent.selected = scope.placedPart;
                //    }
                //}
            };

            this.scope = {
                component: '=',
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

        // Get component instances for an array of board components.
        private _getComponentsForParts(boardComponents: Array<Selection.BoardComponent>): Array<Model.ComponentInstance> {
            var components = [];
            for (var i = 0; i < boardComponents.length; i++) {
                var placedPart = boardComponents[i].placedPart;
                var component = placedPart.get_component_instance();
                if (components.indexOf(component) < 0) {
                    components.push(component);
                }
            }

            return components;
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