// The application context should be the root level storage for Jet data.
// Although the application scope could be considered to replace the
// application context, having this data structure live outside the scope
// allows for data to be shared within different ng- apps.
class AppContext {
    // Catalog model.
    private _catalogModel: Jet.Model.CatalogModel;
    // Gadget model.
    private _gadgetModel: Jet.Model.GadgetModel;
    // Save state manager.
    private _saveStateManager: Jet.SaveStateManager;

    constructor($cookieStore: ng.cookies.ICookiesService) {
        var InitialData = Jet.Application.InitialData;

        this._catalogModel = new Jet.Model.CatalogModel();

        var dimensions = InitialData.Board.dimensions;
        this._gadgetModel = new Jet.Model.GadgetModel();
        this._gadgetModel.set_corners([
            new Jet.Model.Vertex(dimensions.left, dimensions.top),
            new Jet.Model.Vertex(dimensions.left + dimensions.width, dimensions.top),
            new Jet.Model.Vertex(dimensions.left + dimensions.width, dimensions.top + dimensions.left + dimensions.height),
            new Jet.Model.Vertex(dimensions.left, dimensions.top + dimensions.height)
        ]);

        this._saveStateManager = new Jet.SaveStateManager($cookieStore);
    }

    getCatalogModel(): Jet.Model.CatalogModel {
        return this._catalogModel;
    }

    getGadgetModel(): Jet.Model.GadgetModel {
        return this._gadgetModel;
    }

    getSaveStateManager(): Jet.SaveStateManager {
        return this._saveStateManager;
    }
}