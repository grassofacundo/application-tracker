import { useRef, useState, ChangeEvent, useEffect } from "react";
import country from "./services/country";
import firebaseDb from "./services/firebase";
import { countryStored } from "./types/country";
import Panel from "./applicationPanel/applicationPanel";
import "./App.css";

function App() {
    const [countryList, setCountryList] = useState<countryStored[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [loading, isLoading] = useState<boolean>(true);
    const inputList = useRef<string[]>([]);

    async function updateCountryList() {
        firebaseDb.getAllCountries().then((response) => {
            if (response.ok && response.content) {
                const arrayList = Object.values(response.content).map((p) => p);
                const sortedArray = arrayList.sort(
                    (a: countryStored, b: countryStored) => {
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

    useEffect(() => {
        firebaseDb.getAllCountries().then((response) => {
            if (response.ok && response.content) {
                const arrayList = Object.values(response.content).map((p) => p);
                const sortedArray = arrayList.sort(
                    (a: countryStored, b: countryStored) => {
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
                    {countryList.length > 0 && (
                        <div className="country-list">
                            <h3>Countries already in list</h3>
                            {countryList.map((country) => (
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
            )}
            {loading && <p>Loading...</p>}
        </>
    );
}

export default App;
