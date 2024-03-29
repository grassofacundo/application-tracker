//#region Dependency list
import { FunctionComponent, useState } from "react";
import { application, eventReturn } from "../../types/database";
import firebaseDb from "../../services/firebase";
import "./applicationPanel.css";
import AppForm from "./applicationForm";
import { Button, Grid, LinearProgress } from "@mui/material";
//#endregion

type thisProps = {
    name: string;
    code: string;
};

const Panel: FunctionComponent<thisProps> = ({ name, code }) => {
    const [showPanel, setShowPanel] = useState<boolean>(false);
    const [applications, setApplications] = useState<application[]>([]);
    const [loading, isLoading] = useState<boolean>(true);

    function createId(): string {
        return Math.random().toString(16).slice(2);
    }

    async function handleShowPanel() {
        isLoading(true);
        if (!showPanel && applications.length === 0) {
            setShowPanel((bool) => !bool);
            const response = await firebaseDb.getApplications(code);
            if (response.content) {
                const parsedApps: application[] = [];
                response.content.forEach((app) => {
                    const newApp: application = {
                        id: app.id,
                        date: app.date,
                        companyName: app.companyName,
                        source: app.source,
                        rejected: app.rejected,
                        remote: app.remote,
                        notes: app.notes,
                        city: app.city,
                        link1: app.link1,
                        link2: app.link2,
                        link3: app.link3,
                    };
                    if (app.rejected) {
                        parsedApps.push(newApp);
                    } else {
                        parsedApps.unshift(newApp);
                    }
                });
                setApplications(parsedApps);
            }
            isLoading(false);
        } else {
            setShowPanel((bool) => !bool);
            isLoading(false);
        }
    }

    async function updateApplications(
        application: application
    ): Promise<eventReturn<null>> {
        const exists = !!application.id;
        const appsCopy = structuredClone(applications);
        if (exists) {
            const appToUpdate = appsCopy.findIndex(
                (app) => app.id === application.id
            );
            appsCopy[appToUpdate] = application;
        } else {
            application.id = createId();
            appsCopy.push(application);
        }
        const response = await firebaseDb.setApplications(appsCopy, code);
        const incremented = await firebaseDb.incrementCountryAppsCount(
            code,
            appsCopy.length
        );
        if (incremented) console.log("Count updated");
        if (response.ok) setApplications(appsCopy);
        return response;
    }

    return (
        <div className="panel-wrapper">
            <div className="country-panel">
                <Button onClick={handleShowPanel}>
                    {`${showPanel ? "Hide" : "Show"} ${name}`}
                </Button>
            </div>
            {showPanel && !loading && (
                <Grid
                    container
                    rowSpacing={2}
                    gap={"1px"}
                    sx={{ my: "5px", mx: "10px", width: "calc(100% - 20px)" }}
                >
                    {applications.map((app) => (
                        <AppForm
                            key={app.id}
                            application={app}
                            onUpdateApplications={updateApplications}
                        ></AppForm>
                    ))}
                    <AppForm
                        key={"unique"}
                        onUpdateApplications={updateApplications}
                    ></AppForm>
                </Grid>
            )}
            {showPanel && loading && <LinearProgress />}
        </div>
    );
};

export default Panel;
