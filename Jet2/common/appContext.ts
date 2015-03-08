class AppContext {
    // Catalog model.
    private _catalogModel: Jet.Model.CatalogModel;
    // Gadget model.
    private _gadgetModel: Jet.Model.GadgetModel;

    constructor() {
        this._catalogModel = new Jet.Model.CatalogModel();

        // Temporary.
        this._gadgetModel = new Jet.Model.GadgetModel();
    }

    getCatalogModel(): Jet.Model.CatalogModel {
        return this._catalogModel;
    }

    getGadgetModel(): Jet.Model.GadgetModel {
        return this._gadgetModel;
    }
}