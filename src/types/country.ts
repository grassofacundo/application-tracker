import { application } from "./database";

export type countryResponseApi = {
    name: {
        common: string;
    };
    cca2: string;
    languages: {
        [languageCode: string]: string;
    };
    capital: string[];
    currencies: {
        [currencyCode: string]: {
            name: string;
            symbol: string;
        };
    };
};

export type countryStoredInList = {
    name: string;
    code: string;
};

export type countryStoredAsDoc = {
    name: string;
    selectedCount: number;
    applications?: application[];
};
