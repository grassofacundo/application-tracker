import { initializeApp } from "firebase/app";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    limit,
    orderBy,
} from "firebase/firestore";
import { application, eventReturn } from "../types/database";
import { countryStoredAsDoc, countryStoredInList } from "../types/country";

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
    collectionName = "";

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getFirestore(this.app);
    }

    setCollectionName(email: string): void {
        this.collectionName = `countries-${email}`;
    }

    async createCountry(countryCode: string, countryName: string) {
        const response: eventReturn<null> = {
            ok: false,
        };
        //Create entry
        try {
            await setDoc(doc(this.db, this.collectionName, countryCode), {
                name: countryName,
                appsCount: 0,
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

    async incrementCountryAppsCount(
        countryCode: string,
        count: number
    ): Promise<eventReturn<null>> {
        const response: eventReturn<null> = {
            ok: false,
        };
        try {
            await setDoc(
                doc(this.db, this.collectionName, countryCode),
                {
                    appsCount: count,
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
                    message: `Couldn't update selection code for ${countryCode}`,
                };
            }
        }
        return response;
    }

    async getCountryByAppsCount(
        count: number
    ): Promise<eventReturn<countryStoredAsDoc>> {
        const response: eventReturn<countryStoredAsDoc> = {
            ok: false,
        };
        try {
            const orderByText =
                Number(Math.random().toFixed()) === 1 ? "desc" : undefined;
            const q = query(
                collection(this.db, this.collectionName),
                where("appsCount", "==", count),
                orderBy("name", orderByText),
                limit(5)
            );
            const querySnapshot = await getDocs(q);
            const countries: countryStoredAsDoc[] = [];

            querySnapshot.forEach((doc) =>
                countries.push(doc.data() as countryStoredAsDoc)
            );

            const country: countryStoredAsDoc | null =
                countries[Math.floor(Math.random() * countries.length)];

            response.ok = true;
            if (country) {
                response.content = country;
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

    async getAllCountries(): Promise<eventReturn<countryStoredInList[]>> {
        const response: eventReturn<countryStoredInList[]> = {
            ok: false,
        };
        //Create entry
        try {
            const listDoc = doc(this.db, this.collectionName, "list");
            const list = await getDoc(listDoc);
            response.ok = true;
            if (list.exists())
                response.content = list.data() as countryStoredInList[];
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
    ): Promise<eventReturn<application[]>> {
        const response: eventReturn<application[]> = {
            ok: false,
        };
        //Create entry
        try {
            const listDoc = doc(this.db, this.collectionName, countryCode);
            const list = await getDoc(listDoc);
            if (list.exists()) {
                response.ok = true;
                const data = list.data();
                response.content = data.applications as application[];
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
