//#region Dependency list
import { FunctionComponent, useState, FormEvent } from "react";
import { application, eventReturn } from "../../types/database";
import {
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    Link,
    TextField,
} from "@mui/material";
//#endregion

type thisProps = {
    application?: application;
    onUpdateApplications(application: application): Promise<eventReturn<null>>;
};

type links = {
    link1: string;
    link2: string;
    link3: string;
};

const AppForm: FunctionComponent<thisProps> = ({
    application,
    onUpdateApplications,
}) => {
    const [disabled, setDisabled] = useState<boolean>(!!application);
    const [loading, setLoading] = useState<boolean>(false);
    const [links, setLinks] = useState<links>({
        link1: application?.link1 ?? "",
        link2: application?.link2 ?? "",
        link3: application?.link3 ?? "",
    });

    async function setApplication(formEvent: FormEvent<HTMLFormElement>) {
        setLoading(true);
        formEvent.preventDefault();
        const fieldset = formEvent.currentTarget.firstElementChild;
        const companyNameElem = fieldset?.querySelector(
            "input[name='companyName']"
        ) as HTMLInputElement;
        const companyName = companyNameElem?.value;
        const dateElem = fieldset?.querySelector(
            "input[name='date']"
        ) as HTMLInputElement;
        const date = dateElem?.value;
        const sourceElem = fieldset?.querySelector(
            "input[name='source']"
        ) as HTMLInputElement;
        const source = sourceElem?.value;
        const notesElem = fieldset?.querySelector(
            "textarea[name='notes']"
        ) as HTMLInputElement;
        const notes = notesElem?.value;
        const cityElem = fieldset?.querySelector(
            "input[name='city']"
        ) as HTMLInputElement;
        const city = cityElem?.value;
        const rejectedElem = fieldset?.querySelector(
            "input[name='rejected']"
        ) as HTMLInputElement;
        const rejected = rejectedElem?.checked;
        const remoteElem = fieldset?.querySelector(
            "input[name='remote']"
        ) as HTMLInputElement;
        const remote = remoteElem?.checked;
        const link1Elem = fieldset?.querySelector(
            "input[name='link1']"
        ) as HTMLInputElement;
        const link1 = link1Elem?.value;
        const link2Elem = fieldset?.querySelector(
            "input[name='link2']"
        ) as HTMLInputElement;
        const link2 = link2Elem?.value;
        const link3Elem = fieldset?.querySelector(
            "input[name='link3']"
        ) as HTMLInputElement;
        const link3 = link3Elem?.value;

        const newApp = {
            id: application?.id,
            companyName,
            date,
            source,
            notes,
            city,
            rejected,
            remote,
            link1,
            link2,
            link3,
        };
        const response = await onUpdateApplications(newApp);
        if (response.ok) {
            const form = formEvent.target as HTMLFormElement;
            form.reset();
            setLinks({
                link1: "",
                link2: "",
                link3: "",
            });
        }
        setLoading(false);
        setDisabled(true);
    }

    function handleLinkChange(link: string, index: 1 | 2 | 3): void {
        const propertyName: string = `link${index}`;
        setLinks({ ...links, [propertyName]: link });
    }

    return (
        <Grid
            item
            xs={3.9}
            component="form"
            autoComplete="off"
            onSubmit={setApplication}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                border: "1px solid",
                borderColor: "info.light",
                borderRadius: "5px",
            }}
        >
            <FormControl
                disabled={disabled}
                error={application?.rejected}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                <TextField
                    name="companyName"
                    label="Company name"
                    defaultValue={application?.companyName}
                    size="small"
                />
                <TextField
                    name="date"
                    label="Applied date"
                    defaultValue={application?.date}
                    size="small"
                />
                <TextField
                    name="source"
                    label="Source"
                    defaultValue={application?.source}
                    size="small"
                />
                <TextField
                    name="city"
                    label="City"
                    defaultValue={application?.city}
                    size="small"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            defaultChecked={application?.rejected}
                            name="rejected"
                            size="small"
                        />
                    }
                    label="Rejected"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            defaultChecked={application?.remote}
                            name="remote"
                            size="small"
                        />
                    }
                    label="Remote"
                />
                <div className="application-link-wrapper">
                    <TextField
                        name="link1"
                        label="Link"
                        defaultValue={application?.link1}
                        variant="standard"
                        onChange={(e) => handleLinkChange(e.target.value, 1)}
                        size="small"
                    />
                    {links.link1 && (
                        <Link href={links.link1} target="_blank">
                            Navigate
                        </Link>
                    )}
                </div>
                <div className="application-link-wrapper">
                    <TextField
                        name="link2"
                        label="Link"
                        defaultValue={application?.link2}
                        variant="standard"
                        onChange={(e) => handleLinkChange(e.target.value, 2)}
                        size="small"
                    />
                    {links.link2 && (
                        <Link href={links.link2} target="_blank">
                            Navigate
                        </Link>
                    )}
                </div>

                <div className="application-link-wrapper">
                    <TextField
                        name="link3"
                        label="Link"
                        defaultValue={application?.link3}
                        variant="standard"
                        onChange={(e) => handleLinkChange(e.target.value, 3)}
                        size="small"
                    />
                    {links.link3 && (
                        <Link href={links.link3} target="_blank">
                            Navigate
                        </Link>
                    )}
                </div>

                <TextField
                    name="notes"
                    label="Notes"
                    defaultValue={application?.notes}
                    multiline
                    maxRows={3}
                />
                {application?.rejected && (
                    <div className="form-rejected-overlay"></div>
                )}
            </FormControl>
            {!loading ? (
                <Button
                    sx={{ mt: "5px" }}
                    type="submit"
                    disabled={disabled || loading}
                >
                    {loading ? "Loading" : "Submit"}
                </Button>
            ) : (
                <CircularProgress
                    sx={{
                        my: "5px",
                        height: "25px !important",
                        width: "25px !important",
                    }}
                />
            )}
            {application && !loading && (
                <Button
                    disabled={loading}
                    onClick={(e) => {
                        e.preventDefault();
                        setDisabled((bool) => !bool);
                    }}
                >
                    {loading ? "Loading" : "Edit"}
                </Button>
            )}
            {application && loading && (
                <CircularProgress
                    sx={{
                        my: "5px",
                        height: "25px !important",
                        width: "25px !important",
                    }}
                />
            )}
        </Grid>
    );
};

export default AppForm;
