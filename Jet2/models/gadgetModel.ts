module Jet.Model {

    var theGadgetModel : GadgetModel;
    export class GadgetModel {
        // This is the component dictionary
        // You can use this to iterate over if you have too
        components: { [index: string]: ComponentInstance; } = {};
	
	// This is how you can access the board outline
	// For now it will get degraded to a bounding box when the gspec is exported
	corners: Vertex[] = [new Vertex(-30.0, -30.0), new Vertex(-30.0, 30.0), new Vertex(30.0, -30.0), new Vertex(30.0, 30.0)];
	
        // Other options
	faceplate_color: string = "clear-nocolor";
	backplate_color: string = "clear-nocolor";
	faceplate_etch: string = "etch-front";
	backplate_etch: string = "etch-back";
	front_standoff_height: number = 8.0;
	back_standoff_height: number = 8.0;
	pcb_thickness: number = 1.57;
	faceplate_thickness: number = 3.175;
	backplate_thickness: number = 3.175;
	
	// Options
	options: string[] = [
	    "faceplate_color", 
	    "backplate_color", 
	    "faceplate_etch", 
	    "backplate_etch",
	    "front_standoff_height",
	    "back_standoff_height",
	    "pcb_thickness",
	    "faceplate_thickness",
	    "backplate_thickness"
	];

        constructor() {}
	
	set_option (name:string, value:any) {
	    if (this.options.indexOf(name) > -1) {
		this[name] = value;
	    } else {
		throw new Error("Unsupported option "+name+". Supported options are: "+this.options.toString());
	    }
	}
	
	get_option (name:string):any {
	    if (this.options.indexOf(name) > -1) {
		return this[name];
	    } else {
		throw new Error("Unsupported option "+name+". Supported options are: "+this.options.toString());
	    }
	}
	
        // Add component. This adds a component of the keyname type. The name must be a unique ID.
        add_component(
	    component_data: CatalogModelData,
	    name: string,
            keyname: string
	) {
            if (Object.keys(this.components).indexOf(name) > -1) {
                throw new Error("Adding component with duplicate name: " + name);
            }

            var component = new ComponentInstance(this, name, keyname);
	    for (var i in component_data.getPlacedParts()){
		var ref =component_data.getPlacedParts()[i].getRef()
		component.add_placed_part(new PlacedPart(this, component, ref, 0, 0, 0))
	    }

            this.components[name] = component;
        }

        // Delete a component.
        delete_component(name: string) {
            if (this.components[name] != null) {
                delete this.components[name];
            }
        }
	
	// Set the corners of the board
	set_corners (corners: Vertex[]) {
	    // for now we only support square boards
	    if (corners.length != 4) {
		throw new Error("Board must have 4 corners.")
	    }
	    
	    this.corners = corners;
	}
	
	get_corners ():Vertex[] {
	    return this.corners;
	}
	
	bounding_box (): BoardSize {
	    var corners: Vertex[] = this.corners;
	    var min_x: number = corners[0].x;
	    var max_x: number = corners[0].x;
	    var min_y: number = corners[0].y;
	    var max_y: number = corners[0].y;
	    
	    for (var i = 0; i < corners.length; i += 1) {
		if (corners[i].x < min_x) {
		    min_x = corners[i].x;
		}
		if (corners[i].x > max_x) {
		    max_x = corners[i].x;
		}
		if (corners[i].y < min_y) {
		    min_y = corners[i].y;
		}
		if (corners[i].y > max_y) {
		    max_y = corners[i].y;  
		}
	    }
	    
	    return {min_x: min_x, min_y: min_y, max_x: max_x, max_y: max_y};
	}
	
        // Gets the info of a component by name.
        component(name: string) {
            // Is there really no good way to copy an object by value?
            return JSON.parse(JSON.stringify(this.components[name]));
        }
	
        // Move a component.
        move_placed_part(name: string, ref: string, xpos: number, ypos: number, rot?: number) {
            this.components[name].placed_parts[ref].xpos = xpos;
            this.components[name].placed_parts[ref].ypos = ypos;
            if (rot) {
                this.components[name].placed_parts[ref].rot = rot;
            }
        }

	get_components() {
	    return this.components;
	}
	get_parts (): PlacedPart[] {
	    var parts: PlacedPart[] = [];
	    
	    var c;
	    for (c in this.components) {
		var p;
		for (p in this.components[c].placed_parts) {
		    var part: PlacedPart = this.components[c].placed_parts[p];
		    parts.push(part);
		}
	    }
	    
	    return parts;
	}
	
	rename_component (old_name:string, new_name:string) {
	    if (Object.keys(this.components).indexOf(new_name) > -1) {
                throw new Error("Another component already has this name: " + new_name);
            }
	    if (Object.keys(this.components).indexOf(old_name) == -1) {
                throw new Error("Cannot rename. Component does not exist: " + old_name);
            }
	    
	    this.components[new_name] = this.components[old_name];
	    delete this.components[old_name];
	    
	    // var p;
	    // for (p in this.components[new_name]) {
	    // 	this.components[new_name].placed_parts[p].component = this;
	    // }
	}
	
        // Returns list of component names
        component_names(): string[] {
            return Object.keys(this.components);
        }
	
	get_gspec (): string {
	    var XML = document.createElement("div");
	    var Node = document.createElement("gadgetlayout");
            Node.setAttribute("version", "1.1");
            
            var name = document.createElement("name")
            name.innerText = "Gadget Name"
	    Node.appendChild( name );
	    
	    var board = document.createElement("board")
	    this.set_corners(this.corners);
	    var bounding_box: BoardSize = this.bounding_box();
	    
	    board.setAttribute("x", (bounding_box.min_x).toString());
	    board.setAttribute("y", (bounding_box.min_y).toString());
	    board.setAttribute("w", (bounding_box.max_x - bounding_box.min_x).toString());
	    board.setAttribute("h", (bounding_box.max_y - bounding_box.min_y).toString());
	    Node.appendChild( board );
	    
	    var option:string;
	    for (option in this.options)
	    {
		var opt_name:string = this.options[option];
		Node.appendChild( this.make_option(opt_name, this[opt_name]) );
	    }
            
            for (var key in this.components) {
                if (this.components.hasOwnProperty(key)) {
                    var comp = document.createElement("component");
		    comp.setAttribute("name", this.components[key].name);
		    comp.setAttribute("type", this.components[key].keyname);
                    Node.appendChild(comp);
		}
            }
            
	    XML.appendChild(Node);
	    
	    return XML.innerHTML;
	}
	
	make_option (name:string, value:any):HTMLElement {
	    var option = document.createElement("option");
	    option.setAttribute(name, value.toString())
	    return option;	
	}

	get_component_instance_by_id(id : number) : ComponentInstance {
	    for (var key in this.components) {
		if (this.components[key].get_id() == id) {
		    return this.components[key];
		}
	    }
	    throw new Error("Couldn't find component with id=" + id);
	    return null;
	}
    }
    
    // Basic component info class
    export class ComponentInstance implements Selectable.ISelectable {

	static _currentID : number = 0;
	private _id: number;
	name: string;
	keyname: string;
	
        placed_parts: { [index: string]: PlacedPart; } = {};
	// Basic constructor
	constructor (
	    _gadgetModel : GadgetModel,
            name: string, 
	    keyname: string
        ) {
	    theGadgetModel = _gadgetModel;
	    this.name = name;
	    this.keyname = keyname;
	    this._id = ComponentInstance._currentID++;
        }

	public add_placed_part(pp : PlacedPart) {
	    this.placed_parts[pp.get_ref()] = pp;
	}
	
	public get_id() {
	    return this._id;
	}
	
        // Returns an array of placed parts.
        public get_placed_parts(): PlacedPart[] {
            var placed_parts = [];

            for (var key in this.placed_parts) {
                placed_parts.push(this.placed_parts[key]);
            }

            return placed_parts;
        }

        // Determines if this component instance has a placed part.
        // TODO(othebe): Replace placed_parts with array, or hash by placedpart.
        public has_placed_part(placed_part: PlacedPart): boolean {
            for (var key in this.placed_parts) {
                if (this.placed_parts[key] == placed_part) {
                    return true;
                }
            }
            return false;
        }

	public get_name() : string {
	    return this.name;
        }

	public get_placed_part_count(): number {
            return Object.keys(this.placed_parts).length
	}

        /** @override */
        public getType(): Selectable.Type {
            return Selectable.Type.COMPONENT_INSTANCE;
        }
    }
    
    // Placed part class
    export class PlacedPart implements Selectable.ISelectable {
	static _currentID : number = 0;
	private _id :number;
        ref: string;
        xpos: number;
        ypos: number;
        rot: number;
	private _componentID : number;
        
        constructor (
	    _gadgetModel : GadgetModel,
	    component: ComponentInstance,
            ref: string,
            xpos: number,
            ypos: number,
            rot: number
        ) {
	    theGadgetModel = _gadgetModel;
	    this.ref = ref;
	    this.xpos = xpos;
	    this.ypos = ypos;
	    this.rot = rot;
	    this._componentID = component.get_id();
	    this._id = PlacedPart._currentID++;
        }

	public get_id() { return this._id;}
	
	public get_ref() : string {
	    return this.ref;
        }

        public get_xpos() {
            return parseFloat(this.xpos.toFixed(Jet.Constants.PRECISION));
        }

        public set_xpos(xpos: number) {
            this.xpos = xpos;
        }

        public get_ypos() {
            return parseFloat(this.ypos.toFixed(Jet.Constants.PRECISION));
        }

        public set_ypos(ypos: number) {
            this.ypos = ypos;
        }

        public get_rot() {
            return parseFloat(this.rot.toFixed(Jet.Constants.PRECISION));
        }

        public set_rot(rot: number) {
            this.rot = rot;
        }

        /** @override */
        public getType(): Selectable.Type {
            return Selectable.Type.PLACED_PART;
        }
	public get_component_instance() : ComponentInstance{
	    return theGadgetModel.get_component_instance_by_id(this._componentID);
	}
    }
    
    export class BoardSize {
	min_x: number;
	min_y: number;
	max_x: number;
	max_y: number;
    }
    
    export class Vertex {
	x: number
	y: number
	
	constructor (
	    x: number,
	    y:number
	) {
	    this.x = x;
	    this.y = y;
	}
    }
}

//var test = new Jet.Model.GadgetModel();
//test.add_component("name1", "RGB_LED", {"u1": new Jet.Model.PlacedPart("u1", 0.0, 1.0, 90.0, "name1")});
//alert( test.get_gspec() );
