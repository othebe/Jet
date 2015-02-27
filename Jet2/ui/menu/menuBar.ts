module Jet.Ui {
    export interface IMenuBarScope extends Jet.Application.IApplicationScope {
        // Show about dialog.
        showAbout(): void;
    }

    export class MenuBar implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/menu/menuBar.html";

        constructor(private AppContext: AppContext) { }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public link(scope: IMenuBarScope) {
            scope.showAbout = function () {
                console.log(scope.about);
            }
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new MenuBar(AppContext);
            }

            return directive;
        }
    }
} 