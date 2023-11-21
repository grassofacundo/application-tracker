//#region Dependency list
import { FunctionComponent, useState, FormEvent } from "react";
import { application, eventReturn } from "../types/database";
//#endregion

type thisProps = {
    application?: application;
    onUpdateApplications(application: application): Promise<eventReturn<null>>;
};

const AppForm: FunctionComponent<thisProps> = ({
    application,
    onUpdateApplications,
}) => {
    const [disabled, setDisabled] = useState<boolean>(!!application);
    const [loading, setLoading] = useState<boolean>(false);

    function getDate(fullDate: Date): string {
        const d = new Date(fullDate);
        const stringDate = `${d.getFullYear()}-${
            d.getMonth() + 1
        }-${d.getDate()}`;
        return stringDate;
    }

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
        const date = new Date(dateElem?.value);
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
        }
        setLoading(false);
    }

    return (
        <form className="application-form" onSubmit={setApplication}>
            <fieldset disabled={disabled}>
                <input
                    name="companyName"
                    placeholder="companyName"
                    defaultValue={application?.companyName}
                />
                <div>
                    <label htmlFor="date">Applied date </label>
                    <input
                        name="date"
                        type="date"
                        defaultValue={
                            application?.date ? getDate(application?.date) : ""
                        }
                    />
                </div>
                <input
                    name="source"
                    placeholder="Source"
                    defaultValue={application?.source}
                />
                <textarea
                    name="notes"
                    placeholder="notes"
                    defaultValue={application?.notes}
                />
                <input
                    name="city"
                    placeholder="city"
                    defaultValue={application?.city}
                />
                <div>
                    <input
                        type="checkbox"
                        name="rejected"
                        defaultChecked={application?.rejected}
                    />
                    <label htmlFor="rejected">Got rejected?</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        name="remote"
                        defaultChecked={application?.remote}
                    />
                    <label htmlFor="remote">Is remote?</label>
                </div>
                <input
                    name="link1"
                    placeholder="link"
                    defaultValue={application?.link1}
                />
                <input
                    name="link2"
                    placeholder="link"
                    defaultValue={application?.link2}
                />
                <input
                    name="link3"
                    placeholder="link"
                    defaultValue={application?.link3}
                />
            </fieldset>
            <button type="submit" disabled={disabled || loading}>
                {loading ? "Loading" : "Submit"}
            </button>
            {application && (
                <button
                    disabled={loading}
                    onClick={(e) => {
                        e.preventDefault();
                        setDisabled((bool) => !bool);
                    }}
                >
                    {loading ? "Loading" : "Edit"}
                </button>
            )}
        </form>
    );
};

export default AppForm;
