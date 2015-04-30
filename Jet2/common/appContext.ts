// The application context should be the root level storage for Jet data.
// Although the application scope could be considered to replace the
// application context, having this data structure live outside the scope
// allows for data to be shared within different ng- apps.
class AppContext {
    // Catalog model.
    private _catalogModel: Jet.Model.CatalogModel;
    // Gadget model.
    private _gadgetModel: Jet.Model.GadgetModel;

    constructor() {
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
    }

    getCatalogModel(): Jet.Model.CatalogModel {
        return this._catalogModel;
    }

    getGadgetModel(): Jet.Model.GadgetModel {
        return this._gadgetModel;
    }
}