module Jet.Perspective {
    export class BoardPerspective implements IPerspective {
        private _partialSrc: string = "perspectives/boardPerspective/boardPerspective.html";

        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IPerspectiveScope, private AppContext: AppContext) { }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }
    }
} 