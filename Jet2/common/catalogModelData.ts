class CatalogModelData {
    constructor(
        private longName: string,
        private keyName: string,
        private price: Number,
        private componentUrl: string,
        private svgUrl: string) { }

    public getLongName(): string {
        return this.longName;
    }

    public getKeyName(): string {
        return this.keyName;
    }

    public getPrice(): Number {
        return this.price;
    }

    public getComponentUrl(): string {
        return this.componentUrl;
    }

    public getSvgUrl(): string {
        return this.svgUrl;
    }
} 