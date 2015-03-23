module Jet.Perspective {
    export class DebugPerspective implements IPerspective {
        private _partialSrc: string = "perspectives/debugPerspective/debugPerspective.html";

        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IPerspectiveScope, private AppContext: AppContext) { }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }
    }
}
