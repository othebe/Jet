/// <reference path="../common/appcontext.ts" />

module Jet.Perspective {
    export interface IPerspectiveScope extends ng.IScope {
        // Current perspective.
        perspective: IPerspective;
    }

    export class PerspectiveController {
        static $inject = ['$scope', 'AppContext'];

        // Allowed perspectives.
        // TODO: Generate this array dynamically.
        private _perspectives: Array<IPerspective> = [
            new Jet.Perspective.WorkspacePerspective()
        ];

        constructor(private $scope: IPerspectiveScope, private appContext: AppContext) {
            $scope.perspective = this._perspectives[0];
        }
    }
}