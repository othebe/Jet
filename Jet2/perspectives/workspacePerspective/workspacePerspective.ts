module Jet.Perspective {
    export class WorkspacePerspective implements IPerspective {
        private _partialSrc: string = "perspectives/workspacePerspective/workspacePerspective.html";

        static $inject = ['$scope', 'AppContext'];

        constructor(private $scope: IPerspectiveScope, private AppContext: AppContext) { }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }
    }
}