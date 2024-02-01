//#region Dependency list
import {
    FunctionComponent,
    ChangeEvent,
    useRef,
    Dispatch,
    SetStateAction,
} from "react";
import countryService from "../../services/country";
import firebaseDb from "../../services/firebase";
import { countryStoredInList } from "../../types/country";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
//#endregion

type thisProps = {
    countryList: countryStoredInList[];
    setCountryList: Dispatch<SetStateAction<countryStoredInList[]>>;
    onSetShowPanel: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
};

const AddCountryPanel: FunctionComponent<thisProps> = ({
    setCountryList,
    countryList,
    loading,
    onSetShowPanel,
}) => {
    const inputList = useRef<string[]>([]);

    function parseCountryList(
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
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
                    const countryInfo = await countryService.getInfo(inputName);

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
                onSetShowPanel(false);
            }
        } catch (error) {
            console.log(error);
        }
        if (shouldUpdate) updateCountryList();
    }

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

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "15px",
                mt: "10px",
            }}
        >
            <p>
                {
                    "Add a new country or a list of countries (The list should have all countries separated by commas)"
                }
            </p>
            <TextField
                name="inputName"
                multiline
                fullWidth
                sx={{ width: "80%" }}
                maxRows={7}
                onChange={(e) => parseCountryList(e)}
            />
            {!loading ? (
                <Button variant="contained" onClick={handleAddCountry}>
                    {"Add country"}
                </Button>
            ) : (
                <CircularProgress />
            )}
        </Box>
    );
};

export default AddCountryPanel;
