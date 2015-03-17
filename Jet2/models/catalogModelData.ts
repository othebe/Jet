module Jet.Model {
    // TODO(othebe): Rename to CatalogComponent.
    export class CatalogModelData {
        constructor(
            private _longName: string,
            private _keyName: string,
            private _price: Number,
            private _documentationUrl: string,
            private _svgUrl: string,
            private _placedParts: Array<CatalogPlacedPart>) { }

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

        public getPlacedParts(): Array<CatalogPlacedPart> {
            return this._placedParts;
        }
    }

    export class CatalogPlacedPart {
        constructor(private _ref: string, private _svgUrl: string) { }

        public getRef(): string {
            return this._ref;
        }

        public getSvgUrl(): string {
            return this._svgUrl;
        }
    }
}