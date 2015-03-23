/// <reference path="../directives.ts" />

module Jet.Ui {
    export interface IMenuBarScope extends Jet.Application.IApplicationScope {
        // Show about dialog.
        showAbout(): void;
    }

    export class MenuBar extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/menu/menuBar.html";

        constructor(private AppContext: AppContext) {
            super(AppContext);

            var main = this;

            this.scope = function (scope: IMenuBarScope) {
                scope.showAbout = function () {
                    console.log(scope.about);
                }
            }
        }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new MenuBar(AppContext);
            }

            return directive;
        }
    }
} 
