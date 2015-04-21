module Jet.Perspective {
    export class NBPerspective implements IPerspective {
        private _partialSrc: string = "perspectives/nbPerspective/nbPerspective.html";

        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IPerspectiveScope, private AppContext: AppContext) { }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }
    }
}
