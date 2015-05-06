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
            private _placedParts: { [s: string]: CatalogPlacedPart }) {
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

        public getPlacedParts(): { [s: string]: CatalogPlacedPart } {
            return this._placedParts;
        }
        public getPlacedPartByRef(s: string): CatalogPlacedPart {
            return this._placedParts[s];
        }

        // This returns a string that can be used to search for this ctalog component.
        public getSearchIndex(): string {
            return this._searchIndex;
        }
    }

    export class CatalogPlacedPart {
        private _eagleDisplayMapper: EagleDisplayMapper;
        private _svgData: string;

        constructor(private _ref: string, private _svgUrl: string) {
            // Read SVG data and set Eagle Display mapper.
            this._readSvgData(function (svgStr: string) {
                this._svgData = svgStr;
                this._setEagleDisplayMapper();
            }.bind(this));
        }

        public getRef(): string {
            return this._ref;
        }

        public getSvgUrl(): string {
            return this._svgUrl;
        }

        public getSvgData(): string {
            return this._svgData;
        }

        public getEagleDisplayMapper(): EagleDisplayMapper {
            return this._eagleDisplayMapper;
        }

        // Sets the eagle display mapper for this placed part.
        private _setEagleDisplayMapper() {
            if (this._svgData != null) {
                var start = this._svgData.indexOf('viewBox="');
                var end = this._svgData.indexOf('"', start + 9);

                // Incorrect SVG format.
                if (start < 0 || end < 0) {
                    console.log(Constants.Strings.VIEWBOX_MISSING(this._svgUrl));
                    return;
                }

                var viewBoxStr = this._svgData.substring(start + 9, end);
                var viewBoxArr = viewBoxStr.split(' ');
                this._eagleDisplayMapper = new EagleDisplayMapper(
                    parseFloat(viewBoxArr[3]), // Image height
                    parseFloat(viewBoxArr[2]), // Image width
                    parseFloat(viewBoxArr[0]), // Eagle origin-x
                    parseFloat(viewBoxArr[1])  // Eagle origin-y
                );
            }
        }

        // Read SVG data.
        private _readSvgData(onRead: (svgStr: string) => void) {
            // Read SVG URL.
            var xhr = new XMLHttpRequest();
            xhr.open('GET', this._svgUrl);
            xhr.onreadystatechange = (e: Event) => {
                var target: any = e.target;
                if (target.readyState == 4) {
                    onRead(xhr.response);
                }
            };
            xhr.send();
        }
    }
}