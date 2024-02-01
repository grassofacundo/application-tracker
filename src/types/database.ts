export type eventReturn<contentType> = {
    ok: boolean;
    content?: contentType;
    error?: {
        message: string;
    };
};

export interface applicationBase {
    companyName: string;
    source: string;
    rejected: boolean;
    remote: boolean;
    notes: string;
    city: string;
    link1: string;
    link2: string;
    link3: string;
    date: string;
}

export interface application extends applicationBase {
    id?: string;
}
