class AppContext {
    // Catalog model.
    private _catalogModel: Jet.Model.CatalogModel;
    // Gadget model.
    private _gadgetModel: Jet.Model.GadgetModel;

    constructor() {
        var InitialData = Jet.Application.InitialData;

        this._catalogModel = new Jet.Model.CatalogModel();

        this._gadgetModel = new Jet.Model.GadgetModel();
        this._gadgetModel.set_corners([
            new Jet.Model.Vertex(InitialData.Board.left, InitialData.Board.top),
            new Jet.Model.Vertex(InitialData.Board.left + InitialData.Board.width, InitialData.Board.top),
            new Jet.Model.Vertex(InitialData.Board.left + InitialData.Board.width, InitialData.Board.top + InitialData.Board.left + InitialData.Board.height),
            new Jet.Model.Vertex(InitialData.Board.left, InitialData.Board.top + InitialData.Board.height)
        ]);
    }

    getCatalogModel(): Jet.Model.CatalogModel {
        return this._catalogModel;
    }

    getGadgetModel(): Jet.Model.GadgetModel {
        return this._gadgetModel;
    }
}