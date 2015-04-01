﻿/// <reference path="../directives.ts" />

module Jet.Ui {
    interface IGadgetExplorerEntryScope extends Jet.Application.IApplicationScope {
        // Gadget model data.
        placedPart: Selectable.ISelectable;

        // Is selected.
        isSelected: boolean;

        // Toggle selected gadget model data.
        toggleSelected();

        // Part name (Over-ride for components with one part).
        // TODO (othebe): Use default when partName not provided.
        partName: string;
    }

    export class GadgetExplorerEntry extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/gadgetExplorer/gadgetExplorerEntry.html";
        private _scope: IGadgetExplorerEntryScope;

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IGadgetExplorerEntryScope) {
                main._scope = scope;

                // Watch for changes to selected gadget component.
                scope.$watch('selectedGadgetComponent.selected', function () {
                    if (scope.selectedGadgetComponent == null) {
                        scope.isSelected = false;
                    } else {
                        var selected = scope.selectedGadgetComponent.selected;
                        var isSelected = (selected != null && selected == scope.placedPart);
                        scope.isSelected = isSelected;
                    }
                }, true);

                // Toggle selected gadget model data.
                scope.toggleSelected = function () {
                    var selected = scope.selectedGadgetComponent.selected;

                    if (selected == scope.placedPart) {
                        scope.selectedGadgetComponent.selected = null;
                    } else {
                        scope.selectedGadgetComponent.selected = scope.placedPart;
                    }
                }
            };

            this.scope = {
                partName: '=',
                placedPart: '=',
                selectedGadgetComponent: '='
            };
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