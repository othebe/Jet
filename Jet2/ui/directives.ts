module Jet.Ui {
    export class Directive implements ng.IDirective {
        constructor(AppContext: AppContext, arguments?) { }

        public link: (scope: Jet.Application.IApplicationScope, instanceElement: JQuery) => void;

        public scope: any;

        // Url for rendering UI template.
        public templateUrl(): string {
            throw new Error('This method is abstract.');
        }

        // Factory method for returning a function that returns a directive.
        static Factory(): (...arguments: any[]) => Directive {
            throw new Error('This method is abstract.');
        }
    }
} 