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
            function (scope, appContext) {
                return new Jet.Perspective.DebugPerspective(scope, appContext);
            },
        ];

        constructor(private $scope: IPerspectiveScope,
		    private appContext: AppContext) {
	    var scope=$scope;
	    var main = this;
            $scope.perspective = this._perspectives[0]($scope, appContext);
	    $scope.$on("change:perspective", function(name: ng.IAngularEvent,
						      newPerspective: number) {
		
		//console.log("received change persective " + newPerspective);
		//console.log(main._perspectives);
		scope.perspective = main._perspectives[newPerspective](scope, appContext);
	    });
	}
    }
}
