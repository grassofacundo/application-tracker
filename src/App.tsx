import { useRef, useState, ChangeEvent, useEffect } from "react";
import country from "./services/country";
import firebaseDb from "./services/firebase";
import {
    countryResponseApi,
    countryStoredAsDoc,
    countryStoredInList,
} from "./types/country";
import Panel from "./applicationPanel/applicationPanel";
import "./App.css";

function App() {
    const [countryList, setCountryList] = useState<countryStoredInList[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [showList, setShowList] = useState(false);
    const [randomCountry, setRandomCountry] =
        useState<countryResponseApi | null>(null);
    const [loading, isLoading] = useState<boolean>(true);
    const inputList = useRef<string[]>([]);

    async function updateCountryList() {
        firebaseDb.getAllCountries().then((response) => {
            if (response.ok && response.content) {
                const arrayList = Object.values(response.content).map((p) => p);
                const sortedArray = arrayList.sort(
                    (a: countryStoredInList, b: countryStoredInList) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    }
                );
                setCountryList(sortedArray);
            }
        });
    }

    function parseCountryList(event: ChangeEvent<HTMLTextAreaElement>) {
        const rawText = event.currentTarget.value;
        if (!rawText) return;
        const untrimmedNameList = rawText.split(",");
        const nameList = untrimmedNameList.map((name) => name.trim());
        inputList.current = nameList;
    }

    async function handleAddCountry() {
        let shouldUpdate = false;
        try {
            if (inputList.current.length > 0) {
                for (const inputName of inputList.current) {
                    const countryInfo = await country.getInfo(inputName);

                    if (countryInfo instanceof Error) {
                        console.log("Error");
                        break;
                    }
                    const code = countryInfo.cca2;
                    const name = countryInfo.name.common;
                    if (
                        countryList.some(
                            (country) =>
                                country.code.toLocaleLowerCase() ===
                                code.toLocaleLowerCase()
                        )
                    ) {
                        alert("Country already in list");
                        continue;
                    }
                    shouldUpdate = true;
                    const dbResponse = await firebaseDb.createCountry(
                        code,
                        name
                    );
                    if (dbResponse.ok) console.log(`Added ${name}`);
                }
            }
        } catch (error) {
            console.log(error);
        }
        if (shouldUpdate) updateCountryList();
    }

    async function getRandomCountry() {
        let count = 0;
        let countryDoc: countryStoredAsDoc | null = null;
        let selectedCountry: countryResponseApi | null = null;
        while (!selectedCountry) {
            const res = await firebaseDb.getCountryBySelectedCount(count);
            if (!res.ok || !res.content) {
                count++;
                continue;
            }
            countryDoc = res.content;
            const response = await country.getInfo(countryDoc.name);
            if (response instanceof Error) throw response;
            selectedCountry = response;
        }
        if (selectedCountry && countryDoc) {
            const incremented = await firebaseDb.incrementCountrySelectedCount(
                selectedCountry.cca2,
                countryDoc.selectedCount + 1
            );
            if (incremented) console.log("Count updated");
            setRandomCountry(selectedCountry);
        }
    }

    useEffect(() => {
        firebaseDb.getAllCountries().then((response) => {
            if (response.ok && response.content) {
                const arrayList = Object.values(response.content).map((p) => p);
                const sortedArray = arrayList.sort(
                    (a: countryStoredInList, b: countryStoredInList) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    }
                );
                setCountryList(sortedArray);
                isLoading(false);
            }
        });
    }, []);

    return (
        <>
            {!loading && (
                <div>
                    <h1>Getting hired, one country at a time</h1>
                    {countryList.length > 0 && (
                        <div className="random-country-panel">
                            <h3>Where to apply today?</h3>
                            <button
                                onClick={getRandomCountry}
                                disabled={!!randomCountry}
                            >
                                {loading ? "Loading" : "Feeling lucky"}
                            </button>
                            {randomCountry && (
                                <div>
                                    <p>{`Today's country is: ${randomCountry.name.common}`}</p>
                                    <p>{`It's capital city is ${randomCountry.capital[0]}`}</p>
                                    {Object.values(randomCountry.languages).map(
                                        (lang) => (
                                            <p
                                                key={lang}
                                            >{`They speak ${lang}`}</p>
                                        )
                                    )}
                                    {Object.values(
                                        randomCountry.currencies
                                    ).map((money) => (
                                        <p
                                            key={money.name}
                                        >{`They pay with ${money.name} (${money.symbol})`}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        {countryList.length > 0 && (
                            <div className="country-list">
                                <button
                                    onClick={() => setShowList((bool) => !bool)}
                                >{`${showList ? "Hide" : "Show"} list`}</button>
                                {showList &&
                                    countryList.map((country) => (
                                        <Panel
                                            key={country.code}
                                            name={country.name}
                                            code={country.code}
                                        />
                                    ))}
                            </div>
                        )}
                        <button
                            className="show-panel-button"
                            onClick={() => setShowPanel((bool) => !bool)}
                        >
                            {`${showPanel ? "Hide" : "Show"} add country panel`}
                        </button>
                        {showPanel && (
                            <div className="add-country">
                                <p>
                                    {
                                        "Add a new country or a list of countries (The list should have all countries separated by commas)"
                                    }
                                </p>
                                <textarea
                                    name="inputName"
                                    onChange={(e) => parseCountryList(e)}
                                ></textarea>
                                <button onClick={handleAddCountry}>
                                    Add country
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {loading && <p>Loading...</p>}
        </>
    );
}

export default App;
