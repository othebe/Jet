module Jet.Model {
    // TODO(othebe): Rename to CatalogComponent.
    export class CatalogModelData {
        // The seach index string can matched to identify this catalog model data.
        private _searchIndex: string;

        constructor(
            private _longName: string,
            private _keyName: string,
            private _price: Number,
            private _documentationUrl: string,
            private _svgUrl: string,
            private _placedParts: { [s:string] : CatalogPlacedPart})
        {
            this._searchIndex = this._longName.toLowerCase();
        }

        public getLongName(): string {
            return this._longName;
        }

        public getKeyName(): string {
            return this._keyName;
        }

        public getPrice(): Number {
            return this._price;
        }

        public getDocumentationUrl(): string {
            return this._documentationUrl;
        }

        public getSvgUrl(): string {
            return this._svgUrl;
        }

        public getPlacedParts(): {[s:string] :CatalogPlacedPart} {
            return this._placedParts;
        }
        public getPlacedPartByRef(s:string): CatalogPlacedPart {
            return this._placedParts[s];
        }

        // This returns a string that can be used to search for this ctalog component.
        public getSearchIndex(): string {
            return this._searchIndex;
        }
    }

    export class CatalogPlacedPart {
        constructor(private _ref: string,
		    private _svgUrl: string) { }

        public getRef(): string {
            return this._ref;
        }

        public getSvgUrl(): string {
            return this._svgUrl;
        }
    }
}
