module Jet.Model {
    interface ComponentMap {
        [keyname: string]: CatalogModelData;
    }

    export class CatalogModel {
        private _catalogUrl: string = "public/catalog/components.xml";
        private _imgDir: string = "public/catalog";
        private _componentMap: ComponentMap = {};
        private _catalogModelData: Array<CatalogModelData> = [];

        constructor() {
            this._readComponents();
        }

        // Read catalog component data from external resource.
        private _readComponents() {
            this._catalogModelData = [];
            var xhr = new XMLHttpRequest();

            xhr.open("GET", this._catalogUrl, true);
            xhr.onreadystatechange = (e: Event) => {
                var target: any = e.target;
                if (target.readyState == 4) {
                    var xml = xhr.responseXML;

                    var components = xml.getElementsByTagName('component');

                    for (var i = 0; i < components.length; i++) {
                        var component = components[i];

                        // Keyname.
                        var keyname = component.getAttribute('keyname');
                        // Longname.
                        var name = component.getElementsByTagName('name')[0].innerHTML;
                        // Price.
                        var price = 0;
                        if (component.getElementsByTagName('supplier').length > 0) {
                            price = parseFloat(
                                component.getElementsByTagName('supplier')[0].getAttribute('price'));
                        }
                        // Documentation URL.
                        var docUrl = "";
                        if (component.getElementsByTagName('documentationURL').length > 0) {
                            docUrl = component.getElementsByTagName('documentationURL')[0].innerHTML;
                        }
                        // Placed parts.
                        var placedParts = component.getElementsByTagName('placedparts');

                        if (placedParts.length == 0) continue;

                        placedParts = placedParts[0].getElementsByTagName('placedpart');

                        var placedPartsData: {[s:string] : CatalogPlacedPart}= {};
                        for (var j = 0; j < placedParts.length; j++) {
                            var placedPart = placedParts[j];

                            // SVG Url.
                            var modelPath = placedPart.getAttribute('model2D');
                            var svgUrl = this._imgDir + "/" + modelPath

                            // Ref.
                            var ref = placedPart.getAttribute('refdes');
                            placedPartsData[ref] = new CatalogPlacedPart(ref, svgUrl);
                        }

                        // TODO(othebe): Different img when more than one placed
                        // part is present?
                        var imgUrl = this._imgDir + "/" + placedParts[0].getAttribute('model2D')
			
                        var c: CatalogModelData = new CatalogModelData(
                            name,           /** longname */
                            keyname,        /** keyname */
                            price,          /** price */
                            docUrl,         /** documentationUrl */
                            imgUrl,         /** svgUrl */
                            placedPartsData   /** placedParts */
                        );
                        this._catalogModelData.push(c);
                        this._componentMap[keyname] = c;
                    }
                }
            };

            //xhr.open("GET", this._ComponentUrl, true);
            //xhr.onreadystatechange = (e: Event) => {
            //    var target : any = e.target;
            //    if (target.readyState == 4) {
            //        var components: Array<JSON> = JSON.parse(target.response);
            //        for (var i = 0; i < components.length; i++) {
            //            // TODO (othebe): Wrap data in an interface.
            //            var data : any = components[i];
            //            var component: CatalogModelData = new CatalogModelData(
            //                data.longname,
            //                data.keyname,
            //                data.price,
            //                data.componentUrl,
            //                data.svgUrl
            //                );
            //            this._catalogModelData.push(component);
            //            this._componentMap[data.keyname] = component;
            //        }
            //    }
            //};
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
