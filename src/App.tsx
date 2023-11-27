//#region Dependency list
import { FunctionComponent, useState, useEffect } from "react";
import Landing from "./components/landing/landing";
import {
    getAuth,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
} from "firebase/auth";
import firebaseDb from "./services/firebase";
import "./App.css";
//#endregion

type thisProps = unknown;

const App: FunctionComponent<thisProps> = () => {
    const [isAuth, setIsAuth] = useState<boolean>(false);
    const [usePasswords, setUsePasswords] = useState<boolean>(true);
    const [inputEmail, setInputEmail] = useState<string>("");
    const [inputPassword, setInputPassword] = useState<string>("");

    function handleCreateAccount() {
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, inputEmail, inputPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                if (user.email) firebaseDb.setCollectionName(user.email);
                setIsAuth(true);
            })
            .catch((error) => console.log(error));
    }

    function handleLogIn() {
        const auth = getAuth();
        if (usePasswords) {
            signInWithEmailAndPassword(auth, inputEmail, inputPassword)
                .then((userCredential) => {
                    const user = userCredential.user;
                    if (user.email) firebaseDb.setCollectionName(user.email);
                    setIsAuth(true);
                })
                .catch((error) => console.log(error));
        } else {
            const w = window;
            const url = w.location.href;
            const actionCodeSettings = {
                url,
                handleCodeInApp: true,
            };
            sendSignInLinkToEmail(auth, inputEmail, actionCodeSettings)
                .then(() => {
                    w.localStorage.setItem("emailForSignIn", inputEmail);
                    alert("Email sent. Closing window...");
                    w.close();
                })
                .catch((error) => {
                    alert("Error, check dev  panel");
                    console.error(error.code);
                    console.error(error.message);
                });
        }
    }

    useEffect(() => {
        const ws = window.localStorage;
        const auth = getAuth();
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = ws.getItem("emailForSignIn");
            if (!email) {
                email = window.prompt(
                    "Please provide your email for confirmation"
                );
            }
            if (email)
                signInWithEmailLink(auth, email, window.location.href)
                    .then(() => {
                        if (email) firebaseDb.setCollectionName(email);
                        ws.removeItem("emailForSignIn");
                        setIsAuth(true);
                    })
                    .catch((error) => {
                        alert("Some error");
                        console.error(error);
                        setIsAuth(false);
                    });
        }
    }, []);

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.email) firebaseDb.setCollectionName(user.email);
            setIsAuth(true);
        } else {
            setIsAuth(false);
        }
    });

    return (
        <div>
            {isAuth && <Landing setIsAuth={setIsAuth} />}
            {!isAuth && (
                <div className="form-container">
                    <input
                        type="mail"
                        placeholder="email"
                        onChange={(e) => setInputEmail(e.target.value)}
                    ></input>
                    {usePasswords && (
                        <input
                            type="password"
                            placeholder="password"
                            onChange={(e) => setInputPassword(e.target.value)}
                        ></input>
                    )}
                    <button
                        onClick={handleLogIn}
                        disabled={
                            !inputEmail || (usePasswords && !inputPassword)
                        }
                    >
                        Log in
                    </button>
                    {usePasswords && (
                        <button
                            onClick={handleCreateAccount}
                            disabled={!inputEmail || !inputPassword}
                        >
                            Create account
                        </button>
                    )}
                    <button onClick={() => setUsePasswords((bool) => !bool)}>
                        {usePasswords
                            ? "magic link instead"
                            : "Password instead"}
                    </button>
                    <p>
                        Fun fact! If it is your first time here, create an
                        account with email and password first, and then, and
                        ONLY THEN, use the magic link to log in. Why?
                        Programming works in mysterious ways
                    </p>
                </div>
            )}
        </div>
    );
};

export default App;
