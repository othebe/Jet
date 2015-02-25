class AppContext {
    // Catalog model.
    private _catalogModel: Jet.Model.CatalogModel;

    constructor() {
        this._catalogModel = new Jet.Model.CatalogModel();
    }

    getCatalogModel(): Jet.Model.CatalogModel {
        return this._catalogModel;
    }
}