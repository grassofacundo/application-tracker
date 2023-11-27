//#region Dependency list
import {
    FunctionComponent,
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
} from "react";
import { countryStoredInList } from "../../types/country";
import firebaseDb from "../../services/firebase";
import GetCountryPanel from "../getCountryPanel/getCountryPanel";
import Panel from "../applicationPanel/applicationPanel";
import AddCountryPanel from "../addCountryPanel/addCountryPanel";
import { getAuth, signOut } from "firebase/auth";
import "./landing.css";
//#endregion

type thisProps = {
    setIsAuth: Dispatch<SetStateAction<boolean>>;
};

const Landing: FunctionComponent<thisProps> = ({ setIsAuth }) => {
    const [countryList, setCountryList] = useState<countryStoredInList[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [showList, setShowList] = useState(false);
    const [loading, isLoading] = useState<boolean>(true);

    function handleLogOut() {
        const auth = getAuth();
        try {
            signOut(auth)
                .then(() => {
                    setIsAuth(false);
                })
                .catch((error) => {
                    console.error(error);
                    setIsAuth(false);
                });
        } catch (error) {
            console.error(error);
            setIsAuth(false);
        }
    }

    useEffect(() => {
        firebaseDb.getAllCountries().then((response) => {
            if (response.ok) {
                if (response.content) {
                    const arrayList = Object.values(response.content).map(
                        (p) => p
                    );
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
            } else {
                alert(response.error?.message);
            }
            isLoading(false);
        });
    }, []);

    return (
        <>
            {!loading && (
                <div>
                    <button onClick={handleLogOut}>Log out</button>
                    <h1>Getting hired, one country at a time</h1>
                    {countryList.length > 0 && (
                        <GetCountryPanel loading={loading} />
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
                            <AddCountryPanel
                                countryList={countryList}
                                setCountryList={setCountryList}
                                loading={loading}
                                onSetShowPanel={setShowPanel}
                            />
                        )}
                    </div>
                </div>
            )}
            {loading && <p>Loading...</p>}
        </>
    );
};

export default Landing;
