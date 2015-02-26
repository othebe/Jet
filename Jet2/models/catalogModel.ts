 module Jet.Model {
    export class CatalogModel {
        private _ComponentUrl: string = "http://localhost:5000/public/components.json";
        private _catalogModelData: Array<CatalogModelData> = [];

        constructor() {
            this._readComponents();
        }

        // Read catalog component data from external resource.
        private _readComponents() {
            this._catalogModelData = [];
            var xhr = new XMLHttpRequest();
            xhr.open("GET", this._ComponentUrl, true);
            xhr.onreadystatechange = (e: Event) => {
                var target : any = e.target;
                if (target.readyState == 4) {
                    var components: Array<JSON> = JSON.parse(target.response);
                    for (var i = 0; i < components.length; i++) {
                        var data : any = components[i];
                        var component: CatalogModelData = new CatalogModelData(
                            data.longname,
                            data.keyname,
                            data.price,
                            data.componentUrl,
                            data.svgUrl
                            );
                        this._catalogModelData.push(component);
                    }
                }
            };
            xhr.send();
        }

        // Get catalog model data.
        public getComponents(): Array<CatalogModelData> {
            return this._catalogModelData;
        }
    }
}