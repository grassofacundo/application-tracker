import { countryResponse } from "../types/country";

class Country {
    url = "https://restcountries.com/v3.1/name";

    async getInfo(countryName: string): Promise<countryResponse | Error> {
        let response;
        try {
            response = await fetch(`${this.url}/${countryName}`);
            if (!response.ok) throw Error("Error fetching country");
            const content = await response.json();
            if (!content) throw Error("Response was empty");
            return content[0];
        } catch (error) {
            return error instanceof Error ? error : new Error("Couldn't fetch");
        }
    }
}

const country = new Country();
export default country;
