var Jet;
(function (Jet) {
    var Application;
    (function (Application) {
        var ApplicationController = (function () {
            function ApplicationController($scope, AppContext) {
                this.$scope = $scope;
                this.AppContext = AppContext;
                $scope.catalogModel = AppContext.getCatalogModel();
                $scope.about = "Gadgetron Jet V2.0";
            }
            ApplicationController.$inject = ['$scope', 'AppContext'];
            return ApplicationController;
        })();
        Application.ApplicationController = ApplicationController;
    })(Application = Jet.Application || (Jet.Application = {}));
})(Jet || (Jet = {}));
var AppContext = (function () {
    function AppContext() {
        this._catalogModel = new Jet.Model.CatalogModel();
    }
    AppContext.prototype.getCatalogModel = function () {
        return this._catalogModel;
    };
    return AppContext;
})();
/// <reference path="../common/appcontext.ts" />
var Jet;
(function (Jet) {
    var Perspective;
    (function (Perspective) {
        var PerspectiveController = (function () {
            function PerspectiveController($scope, appContext) {
                this.$scope = $scope;
                this.appContext = appContext;
                // Allowed perspectives.
                // TODO: Generate this array dynamically.
                this._perspectives = [
                    new Jet.Perspective.WorkspacePerspective()
                ];
                $scope.perspective = this._perspectives[0];
            }
            PerspectiveController.$inject = ['$scope', 'AppContext'];
            return PerspectiveController;
        })();
        Perspective.PerspectiveController = PerspectiveController;
    })(Perspective = Jet.Perspective || (Jet.Perspective = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Ui;
    (function (Ui) {
        var Board = (function () {
            function Board(AppContext) {
                this.AppContext = AppContext;
                this._templateUrl = "ui/board/board.html";
            }
            Board.prototype.templateUrl = function () {
                return this._templateUrl;
            };
            Board.Factory = function () {
                var directive = function (AppContext) {
                    return new Board(AppContext);
                };
                return directive;
            };
            return Board;
        })();
        Ui.Board = Board;
    })(Ui = Jet.Ui || (Jet.Ui = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Ui;
    (function (Ui) {
        var Catalog = (function () {
            function Catalog() {
                this._templateUrl = "ui/catalog/catalog.html";
            }
            Catalog.prototype.templateUrl = function () {
                return this._templateUrl;
            };
            Catalog.Factory = function () {
                var directive = function () {
                    return new Catalog();
                };
                return directive;
            };
            return Catalog;
        })();
        Ui.Catalog = Catalog;
    })(Ui = Jet.Ui || (Jet.Ui = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Ui;
    (function (Ui) {
        var CatalogEntry = (function () {
            function CatalogEntry() {
                this._templateUrl = "ui/catalogEntry/catalogEntry.html";
            }
            CatalogEntry.prototype.scope = function () {
                return {
                    ngModel: '='
                };
            };
            CatalogEntry.prototype.templateUrl = function () {
                return this._templateUrl;
            };
            CatalogEntry.Factory = function () {
                var directive = function () {
                    return new CatalogEntry();
                };
                return directive;
            };
            CatalogEntry.prototype._findCatalogModelData = function (components, key) {
                for (var i = 0; i < components.length; i++) {
                    if (components[i].getKeyName == key)
                        return components[i];
                }
            };
            return CatalogEntry;
        })();
        Ui.CatalogEntry = CatalogEntry;
    })(Ui = Jet.Ui || (Jet.Ui = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Ui;
    (function (Ui) {
        var GadgetExplorer = (function () {
            function GadgetExplorer(AppContext) {
                this.AppContext = AppContext;
                this._templateUrl = "ui/gadgetExplorer/gadgetExplorer.html";
            }
            GadgetExplorer.prototype.templateUrl = function () {
                return this._templateUrl;
            };
            GadgetExplorer.Factory = function () {
                var directive = function (AppContext) {
                    return new GadgetExplorer(AppContext);
                };
                return directive;
            };
            return GadgetExplorer;
        })();
        Ui.GadgetExplorer = GadgetExplorer;
    })(Ui = Jet.Ui || (Jet.Ui = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Ui;
    (function (Ui) {
        var MenuBar = (function () {
            function MenuBar(AppContext) {
                this.AppContext = AppContext;
                this._templateUrl = "ui/menu/menuBar.html";
            }
            MenuBar.prototype.templateUrl = function () {
                return this._templateUrl;
            };
            MenuBar.prototype.link = function (scope) {
                scope.showAbout = function () {
                    console.log(scope.about);
                };
            };
            MenuBar.Factory = function () {
                var directive = function (AppContext) {
                    return new MenuBar(AppContext);
                };
                return directive;
            };
            return MenuBar;
        })();
        Ui.MenuBar = MenuBar;
    })(Ui = Jet.Ui || (Jet.Ui = {}));
})(Jet || (Jet = {}));
/// <reference path="public/typings/angularjs/angular.d.ts" />
/// <reference path="application/applicationcontroller.ts" />
/// <reference path="perspectives/perspectivecontroller.ts" />
/// <reference path="ui/board/board.ts" />
/// <reference path="ui/catalog/catalog.ts" />
/// <reference path="ui/catalogentry/catalogentry.ts" />
/// <reference path="ui/gadgetexplorer/gadgetexplorer.ts" />
/// <reference path="ui/menu/menuBar.ts" />
(function () {
    var app = angular.module('Jet', ['ngMaterial']);
    // Application context.
    app.service('AppContext', AppContext);
    // Application controller.
    app.controller('AppCtrl', Jet.Application.ApplicationController);
    // Perspective controller.
    app.controller('PerspectiveCtrl', Jet.Perspective.PerspectiveController);
    // Catalog directive.
    app.directive('catalog', Jet.Ui.Catalog.Factory());
    // Catalog entry directive.
    app.directive('catalogEntry', Jet.Ui.CatalogEntry.Factory());
    // Menu directive.
    app.directive('menuBar', Jet.Ui.MenuBar.Factory());
    // Gadget explorer.
    app.directive('gadgetExplorer', Jet.Ui.GadgetExplorer.Factory());
    // Board.
    app.directive('board', Jet.Ui.Board.Factory());
})();
var CatalogModelData = (function () {
    function CatalogModelData(longName, keyName, price, componentUrl, svgUrl) {
        this.longName = longName;
        this.keyName = keyName;
        this.price = price;
        this.componentUrl = componentUrl;
        this.svgUrl = svgUrl;
    }
    CatalogModelData.prototype.getLongName = function () {
        return this.longName;
    };
    CatalogModelData.prototype.getKeyName = function () {
        return this.keyName;
    };
    CatalogModelData.prototype.getPrice = function () {
        return this.price;
    };
    CatalogModelData.prototype.getComponentUrl = function () {
        return this.componentUrl;
    };
    CatalogModelData.prototype.getSvgUrl = function () {
        return this.svgUrl;
    };
    return CatalogModelData;
})();
var Jet;
(function (Jet) {
    var Model;
    (function (Model) {
        var CatalogModel = (function () {
            function CatalogModel() {
                this._ComponentUrl = "http://localhost:5000/public/components.json";
                this._catalogModelData = [];
                this._readComponents();
            }
            // Read catalog component data from external resource.
            CatalogModel.prototype._readComponents = function () {
                var _this = this;
                this._catalogModelData = [];
                var xhr = new XMLHttpRequest();
                xhr.open("GET", this._ComponentUrl, true);
                xhr.onreadystatechange = function (e) {
                    var target = e.target;
                    if (target.readyState == 4) {
                        var components = JSON.parse(target.response);
                        for (var i = 0; i < components.length; i++) {
                            var data = components[i];
                            var component = new CatalogModelData(data.longname, data.keyname, data.price, data.componentUrl, data.svgUrl);
                            _this._catalogModelData.push(component);
                        }
                    }
                };
                xhr.send();
            };
            // Get catalog model data.
            CatalogModel.prototype.getComponents = function () {
                return this._catalogModelData;
            };
            return CatalogModel;
        })();
        Model.CatalogModel = CatalogModel;
    })(Model = Jet.Model || (Jet.Model = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Perspective;
    (function (Perspective) {
        var WorkspacePerspective = (function () {
            function WorkspacePerspective() {
                this._partialSrc = "perspectives/WorkspacePerspective/workspacePerspective.html";
            }
            // Get partial source.
            WorkspacePerspective.prototype.getPartialSrc = function () {
                return this._partialSrc;
            };
            return WorkspacePerspective;
        })();
        Perspective.WorkspacePerspective = WorkspacePerspective;
    })(Perspective = Jet.Perspective || (Jet.Perspective = {}));
})(Jet || (Jet = {}));
var Jet;
(function (Jet) {
    var Ui;
    (function (Ui) {
        var Directive = (function () {
            function Directive() {
            }
            // Url for rendering UI template.
            Directive.prototype.templateUrl = function () {
                throw new Error('This method is abstract.');
            };
            // Factory method for returning a function that returns a directive.
            Directive.Factory = function () {
                throw new Error('This method is abstract.');
            };
            return Directive;
        })();
        Ui.Directive = Directive;
    })(Ui = Jet.Ui || (Jet.Ui = {}));
})(Jet || (Jet = {}));
//# sourceMappingURL=Jet.js.map