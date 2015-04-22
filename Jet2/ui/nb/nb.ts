/// <reference path="../directives.ts" />

// TODO (othebe): This file is growing too big. Move private classes into their own files.
module Jet.Ui {
    function convertPoint(evt) {
	var root = $("#id-foo").get()[0]
	var uupos = $("#id-foo").children().get()[0].createSVGPoint();
	
	uupos.x = evt.screenX;
	uupos.y = evt.screenY;
	
	return [uupos.x, uupos.y];
	var ctm = root.getScreenCTM();
	if (ctm = ctm.inverse()) {
	    uupos = uupos.matrixTransform(ctm);
	}
    }

    interface INBScope extends Jet.Application.IApplicationScope {
        height: Number;
	zoomFactor : number;
        Math: any;

        // NB options.
        // TODO (othebe): These should be moved into their own directive since
        // they are not technically part of the board.
        editGadget(): void;

        // Toggle grid.
        toggleGrid(): void;
    }


    
    interface INBComponentScope extends ng.IScope {
        placedPartData?: Jet.Model.PlacedPart;
        componentData?: Jet.Model.ComponentInstance;
    }


    // This represents a selectable board instance.
    class NBSelectable implements Selectable.ISelectable {
        /** @override */
        public getType = function () {
            return Selectable.Type.BOARD;
        };

	public get_id() : number {
	    return 0;
	}
        constructor() { }
    }

    class _NBComponent{
	private _placedParts : {[s:string] : NBPlacedPart}
	constructor(private _board : NB,
		    private _modelData : Jet.Model.ComponentInstance,
		    private _catalogEntry : Jet.Model.CatalogModelData) {
	    for (var p in _modelData.get_placed_parts()) {
		this._placedParts[p.getRef()] = new NBPlacedPart(this._board,p,_catalogEntry.getPlacedPartByRef(p.getRef()));
	    }
	}

	getPlacedParts() {
	    return this._placedParts;
	}

	getModelData() {
	    return this._modelData;
	}
	
    }

    interface INBComponentScope extends INBScope {
	placedPart : Jet.Model.PlacedPart;
    };
    
    export class NBComponent extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/nb/nbComponent.html";
        private _scope: INBComponentScope;
	templateNamespace: string = 'svg';
	//replace:boolean = true;
	
	public templateUrl() {
            return this._templateUrl;
        }
	
	constructor(private _appContext: AppContext) {
            super(_appContext);

            this.scope = {
		placedPart: '=',
                catalogModel: '=',
                gadgetModel: '=',
                selectedGadgetComponent: '='
            };
	    
	    var main = this
            this.link = function (scope: INBComponentScope, instanceElement: JQuery) {
		main._scope = scope;
	    }
	}
	public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new NBComponent(AppContext);
            };
	    
            return directive;
        }

	
    };
    
    class NBPlacedPart {//implements Selectable.ISelectable {
	private _svgSnap: Snap.Paper = null;
	private _svgNode = null;
	
	constructor (private _board : NB,
		     private _gadgetData: Jet.Model.PlacedPart,
		     private _catalogData: Jet.Model.CatalogPlacedPart) {
	    var main = this;
	    var xhr = new XMLHttpRequest;
	    xhr.open('get',this._catalogData.getSvgUrl(), true);
	    xhr.onreadystatechange = function(){
		if (xhr.readyState != 4) return;
		var svg = xhr.responseXML.documentElement;
		svg = document.importNode(svg,true); // surprisingly optional in these browsers
		main._svgNode = svg;
		main._svgSnap = Snap(svg);
		this._board.displayPlacedPart(main);
	    };
	    xhr.send();
	}
	getSnap():Snap.Paper {
	    return this._svgSnap;
	}
	getNode () {
	    return this._svgNode;
	}
	getX() : number {
	    return this._gadgetData.get_xpos();
	}
	getY() : number {
	    return this._gadgetData.get_ypos();
	}
	    
	deconstruct() {
	    //this._board.undisplayPlacedPart(this);
	}
    }


    // This represents the OVERALL board, including the PCB and components.
    export class NB extends Jet.Ui.Directive {
        private _templateUrl: string = "ui/nb/nb.html";
        private _scope: INBScope;
	private moving = null
	private start_loc
	private start_mouse
	private end_loc
	private end_mouse
	private _container = null;
	private _componentMap : { [s: number] : NBComponent }
	    
	public templateUrl() {
            return this._templateUrl;
        }

	public displayPlacedPart(pp: NBPlacedPart) {
	    var snap = pp.getSnap();
	    var node = pp.getNode();
	   
	    var bb = snap.getBBox();
	    console.log(bb.vb);
	    node.setAttribute('width', bb.width + "mm");
	    node.setAttribute('height', bb.height + "mm");
	    node.setAttribute('viewBox', (bb.x-4) + " " + (bb.y -4) + " " + (bb.width + 8) + " " + (bb.height + 8))

	    $(node).css("top", pp.getX())
	    $(node).css("left", pp.getY())

	    var outline = snap.rect(bb.x, bb.y, bb.width, bb.height).attr({stroke:"#F00",
									   fill:"none"})
	    var handles = [snap.rect(bb.x-2,bb.y-2,4,4).attr({stroke: "#F00",
							      fill: "none"}),
			   snap.rect(bb.x2-2,bb.y-2,4,4).attr({stroke: "#F00",
							       fill: "none"}),
			   snap.rect(bb.x-2,bb.y2-2,4,4).attr({stroke: "#F00",
							       fill: "none"}),
			   snap.rect(bb.x2-2,bb.y2-2,4,4).attr({stroke: "#F00",
								fill: "none"}),
			  ]
	    var ui = snap.g(outline)
	    ui.add(handles[0],
		   handles[1],
		   handles[2],
		   handles[3])

	    $(this._container).append(node);
	}
	

        constructor(private AppContext: AppContext) {
            super(AppContext);

            this.scope = {
                catalogModel: '=',
                gadgetModel: '=',
                selectedGadgetComponent: '='
            };

	    var main = this
            this.link = function (scope: INBScope, instanceElement: JQuery) {

                main._scope = scope;
		scope.$watch('gadgetModel.components',
			     function (newComponents: { [index: string]: Jet.Model.ComponentInstance },
				       oldComponents: { [index: string]: Jet.Model.ComponentInstance })
			     {
				 //main._updateComponents(scope.gadgetModel);
			     }, true);
		
		this._container = $("#id-foo")

		console.log(this._container.get(0))
		console.log(this._container.children().first().get()[0]) //get(0))

		/*
		  $(svg_elt).mousedown(function(e) {
		    main.start_mouse = convertPoint(e);
		    var C = $(event.target)
		    while (C.length != 0 && !$(C).is("svg")) {
			C = $(C).parent();
			console.log(C)
		    }
		    main.moving = C
		    console.log("moving = " , main.moving)
		    var t = main.start_loc = [main.moving.css("left"),
					      main.moving.css("top") ]
		    console.log(t)
		    main.start_loc = [parseFloat(main.moving.css("left")),
				      parseFloat(main.moving.css("top")) ]
		    console.log("start_loc =   ", main.start_loc)
		    console.log("start_mouse = " ,main.start_mouse)
		})
		$(svg_elt).mousemove(function(e) {
		    if (main.moving != null) {
			main.end_mouse = convertPoint(e);
			main.end_loc = [parseFloat(main.moving.css("top")),
					parseFloat(main.moving.css("left")) ]
			console.log("left",  main.end_mouse[0] - main.start_mouse[0] + main.start_loc[0])
			console.log("top", main.end_mouse[1] - main.start_mouse[1] + main.start_loc[1])
			console.log(main.end_loc)
			console.log(main.end_mouse)
			main.moving.css("left", main.end_mouse[0] - main.start_mouse[0] + main.start_loc[0])
			main.moving.css("top", main.end_mouse[1] - main.start_mouse[1] + main.start_loc[1])
		    }
		})
		
		$(svg_elt).mouseup(function(e) {
		    console.log("moving")
		    //main.moving.css({ WebkitTransform: 'rotate(45deg'})
		    main.moving = null
		})

		*/

		this._container.css("height",400)
		this._container.css("width",400)

		//snap.select("g").drag()
		//snap.drag()
		
		
	    }
        }

        public setDimensions(width: number, height: number) {
        }

	
        public static Factory() {
            var directive = (AppContext: AppContext) => {
                return new NB(AppContext);
            };

            return directive;
        }
    }
} 
