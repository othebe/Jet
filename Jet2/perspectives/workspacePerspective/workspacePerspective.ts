module Jet.Perspective {
    export class WorkspacePerspective {
        private _partialSrc: string = "perspectives/WorkspacePerspective/workspacePerspective.html";

        constructor() { }

        // Get partial source.
        public getPartialSrc(): string {
            return this._partialSrc;
        }
    }
}