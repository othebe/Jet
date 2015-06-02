/// <reference path="../directives.ts" />

module Jet.Ui {
    export interface IMenuBarScope extends Jet.Application.IApplicationScope {
        // Show about dialog.
        showAbout(): void;

        /* *************** */
        /** Action buttons */
        /* *************** */
        // New gadget.
        newGadget(e: any): void;
        // Import GSpec.
        importGSpec(e: any): void;
        // Export GSpec.
        exportGSpec(e: any): void;
        // Select perspective.
        selectPerspective(ndx: number): void;
        // Show more options.
        showOptions(e: any): void;

        // Show set perspective.
        showPerspectives(e: any): void;
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

                scope.selectPerspective = function (perspectiveNdx) {
                    scope.perspectiveIndex = perspectiveNdx;
                };

                // New gadget.
                scope.newGadget = function (ev: any) {
                    scope.resetGadget();
                };

                // Import GSpec.
                scope.importGSpec = function (ev: any) {
                    var _scope = scope;
                    $mdDialog.show({
                        templateUrl: 'ui/menu/importGSpec.html',
                        clickOutsideToClose: false,
                        targetEvent: ev,
                        controller: (scope, $mdDialog) => {
                            scope.importStr = "";
                            scope.importStatus = "";
                            scope.importSuccess = false;

                            scope.import = function () {
                                try {
                                    _scope.gadgetModel.import_gspec_string(scope.importStr, _scope.catalogModel);
                                    scope.importStatus = Constants.Strings.GSPEC_IMPORT_SUCCESS;
                                    scope.importSuccess = true;
                                } catch (exception) {
                                    scope.importStatus = exception;
                                    scope.importSuccess = false;
                                }
                            };

                            scope.close = function () {
                                $mdDialog.cancel();
                            };
                        }
                    });
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

                // Show perspective.
                scope.showPerspectives = function (ev: any) {
                    var _scope = scope;
                    $mdDialog.show({
                        templateUrl: 'ui/menu/setPerspective.html',
                        clickOutsideToClose: false,
                        targetEvent: ev,
                        controller: (scope, $mdDialog) => {
                            scope.perspectiveIndex = _scope.perspectiveIndex;

                            scope.selectPerspective = (perspectiveNdx) => {
                                _scope.perspectiveIndex = perspectiveNdx;
                            };

                            scope.close = function () {
                                $mdDialog.cancel();
                            };
                        }
                    });
                };

                // Show more options.
                scope.showOptions = function (ev: any) {
                    var _scope = scope;
                    $mdDialog.show({
                        templateUrl: 'ui/menu/options.html',
                        clickOutsideToClose: true,
                        targetEvent: ev,
                        controller: (scope, $mdDialog) => {
                            scope.importGSpec = function (e) {
                                _scope.importGSpec(e);
                            };

                            scope.exportGSpec = function (e) {
                                _scope.exportGSpec(e);
                            };

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
