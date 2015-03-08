module Jet.Model {
    interface ComponentMap {
        [keyname: string]: CatalogModelData;
    }

    export class CatalogModel {
        private _ComponentUrl: string = "http://localhost:5000/public/components.json";
        private _componentMap: ComponentMap = {};
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
                        // TODO (othebe): Wrap data in an interface.
                        var data : any = components[i];
                        var component: CatalogModelData = new CatalogModelData(
                            data.longname,
                            data.keyname,
                            data.price,
                            data.componentUrl,
                            data.svgUrl
                            );
                        this._catalogModelData.push(component);
                        this._componentMap[data.keyname] = component;
                    }
                }
            };
            xhr.send();
        }

        // Get catalog model data.
        public getComponents(): Array<CatalogModelData> {
            return this._catalogModelData;
        }

        // Lookup catalog model data by keyname.
        public getComponent(keyname: string): CatalogModelData {
            return this._componentMap[keyname];
        }
    }
}