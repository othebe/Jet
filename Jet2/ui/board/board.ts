module Jet.Ui {
    export class Board implements Jet.Ui.Directive {
        private _templateUrl: string = "ui/board/board.html";

        constructor(private AppContext: AppContext) { }

        public templateUrl(): string {
            return this._templateUrl;
        }

        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new Board(AppContext);
            }

            return directive;
        }
    }
} 