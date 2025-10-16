export class DashBoardDto {
    page: number
    limit: number
    service: Service
};

export type Service = {
    version: string | "1.0",
    timestamp: Date | "2024-03-04T07:12:43.528351Z",
    channel: string | "myais2.0",
    broker: string | "none",
    useCase: string | "init2",
    useCaseStep: string | "0",
    useCaseAge: number | 2,
    from: string | "MSS",
    name: string |  "init2",
    invoke: string |  "command-oda=ecf66093-4c3e-49e7-bf39-a594b41b859efadbbc52ac111a8d",
    session: string |  "command-oda=ecf66093-4c3e-49e7-bf39-a594b41b859efadbbc52ac111a8d",
    transaction: string |  "command-oda=ecf66093-4c3e-49e7-bf39-a594b41b859efadbbc52ac111a8d",
    token: string |  "",
    orgService: string |  "MSS",
    communication: string |  "unicast",
    groupTags: any[],
    identity: Identity | {
        device: ["fadbbc52ac111a8d"],
        public: "0934025114",
        user: "kBnInp26EJA"
    },
    locationInfo: object | {},
    networkInfo: NetworkInfo | {
        isp: "Advanced Wireless Network Company Limited",
        ip: "49.228.105.5"
    },
    deviceInfo: DeviceInfo | {
        brand: "samsung",
        model: "SM-G973F",
        os: "android",
        osVersion: "11"
    },
    diagMessage: string | ""
};

export type Identity = {
	device: string[] | ["fadbbc52ac111a8d"],
    public: string | "0934025114",
    user: string | "kBnInp26EJA"
};

export type NetworkInfo = {
	isp: string[] | ["fadbbc52ac111a8d"],
    ip: string | "0934025114",
};

export type DeviceInfo = {
    brand: string | "samsung",
    model: string | "SM-G973F",
    os: string | "android",
    osVersion: string | "11"
};