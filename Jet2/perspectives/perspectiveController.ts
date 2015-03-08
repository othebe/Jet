/// <reference path="../common/appContext.ts" />

module Jet.Perspective {
    export interface IPerspectiveScope extends ng.IScope {
        // Current perspective.
        perspective: IPerspective;
    }

    export class PerspectiveController {
        static $inject = ['$scope', 'AppContext'];

        // Allowed perspectives.
        // TODO: Generate this array dynamically.
        private _perspectives: Array<(scope: IPerspectiveScope, appContext: AppContext) => IPerspective> = [
            function (scope, appContext) {
                return new Jet.Perspective.WorkspacePerspective(scope, appContext);
            },
        ];

        constructor(private $scope: IPerspectiveScope, private appContext: AppContext) {
            $scope.perspective = this._perspectives[0]($scope, appContext);
        }
    }
}