// The save state manager provides functionality for saving JET data.
// The cookie-store can be accessed via _cookieStore.
// GSpec data is stored via the localstorage store due to the 4K size limit.
module Jet {
    export class SaveStateManager {
        static KEY_GSPEC: string = 'key-gspec';

        constructor(private _cookieStore: ng.cookies.ICookiesService) { }

        // Save GSpec.
        public saveGSpec(gadgetModel: Model.GadgetModel) {
            // this._cookieStore.put(SaveStateManager.KEY_GSPEC, gadgetModel.get_gspec());
            localStorage.setItem(SaveStateManager.KEY_GSPEC, gadgetModel.get_gspec());
        }

        // Load GSpec.
        public loadGSpec(): string {
            //return this._cookieStore.get(SaveStateManager.KEY_GSPEC);
            return localStorage.getItem(SaveStateManager.KEY_GSPEC);
        }

        // Clear GSpec.
        public clearGSpec() {
            localStorage.removeItem(SaveStateManager.KEY_GSPEC);
        }
    }
}