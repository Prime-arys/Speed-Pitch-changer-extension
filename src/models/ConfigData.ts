/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */



export class ConfigData implements IConfigData {
    version!: number;
    enabled!: boolean;
    blacklist!: string[];
    specificList!: string[];

    [key: string]: any;

    constructor(data?: IConfigData) {
        if (data) {
            for (const property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }

    init(_data?: any) {
        if (_data) {
            for (const property in _data) {
                if (_data.hasOwnProperty(property))
                    this[property] = _data[property];
            }
            this.version = _data["version"];
            this.enabled = _data["enabled"];
            this.blacklist = _data["blacklist"] || [];
            this.specificList = _data["specificList"] || [];
        }
    }

    static fromJS(data: any): ConfigData {
        data = typeof data === 'object' ? data : {};
        const result = new ConfigData();
        result.init(data);
        return result;
    }

    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        for (const property in this) {
            if (this.hasOwnProperty(property))
                data[property] = this[property];
        }
        data["version"] = this.version;
        data["enabled"] = this.enabled;
        data["blacklist"] = this.blacklist || [];
        data["specificList"] = this.specificList || [];
        return data;
    }
}

export interface IConfigData {
    version: number;
    enabled: boolean;
    blacklist: string[];
    specificList: string[];

    [key: string]: any;
}
