/// <reference path="../directives.ts" />

module Jet.Ui {
    export interface IMenuBarScope extends Jet.Application.IApplicationScope {
        // Show about dialog.
        showAbout(): void;

        // Export GSpec.
        exportGSpec(e:any): void;
    }

    export class MenuBar extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/menu/menuBar.html";

        constructor(private AppContext: AppContext, $mdDialog: any) {
            super(AppContext);

            var main = this;

            this.link = function (scope: IMenuBarScope) {                
                scope.showAbout = function () {
                    console.log(scope.about);
                };

                // Export GSpec.
                scope.exportGSpec = function (ev: any) {
                    var _scope = scope;
                    $mdDialog.show({
                        templateUrl: 'ui/menu/exportGSpec.html',
                        clickOutsideToClose: false,
                        targetEvent: ev,
                        controller: (scope, $mdDialog) => {
                            scope.exportGSpec = _scope.gadgetModel.get_gspec();

                            scope.close = function () {
                                $mdDialog.cancel();
                            };
                        }
                    });
                };
            }
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext, $mdDialog: any) => {
                return new MenuBar(AppContext, $mdDialog);
            }

            return directive;
        }
    }
} 
