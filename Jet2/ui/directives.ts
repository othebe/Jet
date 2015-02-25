module Jet.Ui {
    export class Directive implements ng.IDirective {
        // Url for rendering UI template.
        templateUrl(): string {
            throw new Error('This method is abstract.');
        }

        // Factory method for returning a function that returns a directive.
        static Factory(): Directive {
            throw new Error('This method is abstract.');
        }
    }
} 