/// <reference path="../common/appContext.ts" />
/// <reference path="../common/ISelectable.ts" />

module Jet.Perspective {
    export interface IPerspectiveScope extends ng.IScope {
        // Current perspective.
        perspective: IPerspective;
        
        // Expose Selectable.
        Selectable: any;
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

        constructor(private $scope: IPerspectiveScope, private appContext: AppContext) {
            var main = this;

            var scope = $scope;

            $scope.Selectable = Selectable;

            $scope.perspective = this._perspectives[0]($scope, appContext);
	        $scope.$on("change:perspective", function(name: ng.IAngularEvent, newPerspective: number) {
		        scope.perspective = main._perspectives[newPerspective](scope, appContext);
	        });
	    }
    }
}
