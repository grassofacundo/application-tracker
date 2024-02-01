//#region Dependency list
import { FunctionComponent, useState } from "react";
import { countryResponseApi, countryStoredAsDoc } from "../../types/country";
import firebaseDb from "../../services/firebase";
import countryService from "../../services/country";
import { Box, Button } from "@mui/material";
//#endregion

type thisProps = {
    loading: boolean;
};

const GetCountryPanel: FunctionComponent<thisProps> = ({ loading }) => {
    const [randomCountry, setRandomCountry] =
        useState<countryResponseApi | null>(null);

    async function getRandomCountry() {
        let count = 0;
        let countryDoc: countryStoredAsDoc | null = null;
        let selectedCountry: countryResponseApi | null = null;
        while (!selectedCountry) {
            const res = await firebaseDb.getCountryByAppsCount(count);
            if (res.ok && !res.content) {
                count++;
                continue;
            }
            if (!res.ok) {
                alert(res.error?.message);
                throw new Error(res.error?.message);
            }
            if (res.ok && res.content) {
                countryDoc = res.content;
                const response = await countryService.getInfo(countryDoc.name);
                if (response instanceof Error) throw response;
                selectedCountry = response;
            }
        }
        if (selectedCountry && countryDoc) setRandomCountry(selectedCountry);
    }

    return (
        <Box
            sx={{
                border: "1px solid black",
                padding: "10px",
                marginBottom: "15px",
            }}
        >
            <h3>Where to apply today?</h3>
            <Button
                variant="contained"
                onClick={getRandomCountry}
                disabled={!!randomCountry}
            >
                {loading ? "Loading" : "Feeling lucky"}
            </Button>
            {randomCountry && (
                <div>
                    <p>{`Today's country is: ${randomCountry.name.common}`}</p>
                    <p>{`It's capital city is ${randomCountry.capital[0]}`}</p>
                    {Object.values(randomCountry.languages).map((lang) => (
                        <p key={lang}>{`They speak ${lang}`}</p>
                    ))}
                    {Object.values(randomCountry.currencies).map((money) => (
                        <p
                            key={money.name}
                        >{`They pay with ${money.name} (${money.symbol})`}</p>
                    ))}
                </div>
            )}
        </Box>
    );
};

export default GetCountryPanel;
