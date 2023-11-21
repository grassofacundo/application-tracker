import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { application, applicationDb, eventReturn } from "../types/database";
import { countryStored } from "../types/country";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MASSAGER_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

class FirebaseDb {
    app;
    db;
    collectionName = "countries";

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    async createCountry(countryCode: string, countryName: string) {
        const response: eventReturn<null> = {
            ok: false,
        };
        //Create entry
        try {
            await setDoc(doc(this.db, this.collectionName, countryCode), {
                name: countryName,
                selectedCount: 0,
            })
                .then(() => (response.ok = true))
                .catch((error) => {
                    response.ok = false;
                    response.error = { message: error.message };
                });
        } catch (error) {
            response.ok = false;
            if (error instanceof Error) {
                response.error = { message: error.message };
            } else {
                response.error = {
                    message: `Couldn't create collection ${countryCode}`,
                };
            }
        }
        //Add to list
        try {
            await setDoc(
                doc(this.db, this.collectionName, "list"),
                {
                    [countryCode]: { name: countryName, code: countryCode },
                },
                { merge: true }
            )
                .then(() => (response.ok = true))
                .catch((error) => {
                    response.ok = false;
                    response.error = { message: error.message };
                });
        } catch (error) {
            response.ok = false;
            if (error instanceof Error) {
                response.error = { message: error.message };
            } else {
                response.error = {
                    message: `Couldn't add ${countryCode} to list`,
                };
            }
        }
        return response;
    }

    async getAllCountries(): Promise<eventReturn<countryStored[]>> {
        const response: eventReturn<countryStored[]> = {
            ok: false,
        };
        //Create entry
        try {
            const listDoc = doc(this.db, this.collectionName, "list");
            const list = await getDoc(listDoc);
            if (list.exists()) {
                response.ok = true;
                response.content = list.data() as countryStored[];
            }
        } catch (error) {
            response.ok = false;
            if (error instanceof Error) {
                response.error = { message: error.message };
            } else {
                response.error = {
                    message: `Couldn't fetch all countries`,
                };
            }
        }
        return response;
    }

    async getApplications(
        countryCode: string
    ): Promise<eventReturn<applicationDb[]>> {
        const response: eventReturn<applicationDb[]> = {
            ok: false,
        };
        //Create entry
        try {
            const listDoc = doc(this.db, this.collectionName, countryCode);
            const list = await getDoc(listDoc);
            if (list.exists()) {
                response.ok = true;
                const data = list.data();
                response.content = data.applications as applicationDb[];
            }
        } catch (error) {
            response.ok = false;
            if (error instanceof Error) {
                response.error = { message: error.message };
            } else {
                response.error = {
                    message: `Couldn't fetch applications`,
                };
            }
        }
        return response;
    }

    async setApplications(
        applications: application[],
        countryCode: string
    ): Promise<eventReturn<null>> {
        const response: eventReturn<null> = {
            ok: false,
        };
        //Create entry
        try {
            await setDoc(
                doc(this.db, this.collectionName, countryCode),
                {
                    applications: applications,
                },
                { merge: true }
            )
                .then(() => (response.ok = true))
                .catch((error) => {
                    response.ok = false;
                    response.error = { message: error.message };
                });
        } catch (error) {
            response.ok = false;
            if (error instanceof Error) {
                response.error = { message: error.message };
            } else {
                response.error = {
                    message: `Couldn't update applications`,
                };
            }
        }
        return response;
    }
}

const firebaseDb = new FirebaseDb();
export default firebaseDb;
