import "../styles/Setting.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import CustomAlert from "../components/CustomAlert"

export default function Setting() {
    const navigate = useNavigate();
    const [isHovered, setHovered] = useState(false);
    const [avatarFile, setAvatarFile] = useState('');
    const [reloadSignal, setReloadSignal] = useState(false);
    const [userInfo, setUserInfo] = useState('');
    const [noWordSets, setNoWordSets] = useState(0);
    const [noWords, setNoWords] = useState(0);
    const [cusAleMsg, setCusAleMsg] = useState(''); // abbreviation of CustomAlertMessage

    // check if the access token is expired and user has 'admin' role
    useEffect(() => {
        const access_token = Cookies.get('access_token');
        if (!access_token) {
            navigate('/login');
            return;
        }
        const role = Cookies.get('role');
        if (role === 'admin') {
            navigate('/admin/users')
        }
    }, []);

    // useEffect uses to change avatar
    useEffect(() => {
        async function updateAvatar() {
            // upload avatar to Cloudinary
            const formData = new FormData();
            formData.append('file', avatarFile);
            formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);
            formData.append('cloud_name', import.meta.env.VITE_CLOUD_NAME);
            formData.append('resource_type', 'image');
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );
            if (!response.ok) {
                throw new Error('Failed to upload avatar');
            }
            const data = await response.json();

            // upload the avatar link to the database
            const requestBody = {
                "avatarUrl": data.secure_url,
            }
            const response1 = await fetch(`${import.meta.env.VITE_USER_API_BASE_URL}/users/avatar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });
            if (response1.ok) {
                setReloadSignal(!reloadSignal);
                setCusAleMsg("Update avatar successfully");
            }
            setAvatarFile('');
        }

        if (avatarFile) {
            updateAvatar();
        }
    }, [avatarFile])

    // useEffect uses to pull user's avatar and analystics
    useEffect(() => {
        async function getUserInfo() {
            // call api to get userinfo
            const response = await fetch(`${import.meta.env.VITE_USER_API_BASE_URL}/users/me`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`,
                }
            }
            );

            if (response.ok) {
                const responseJson = await response.json();
                setUserInfo(responseJson);
            }

            // call api to get wordset count
            const response1 = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/me/count`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`,
                }
            }
            );

            if (response1.ok) {
                const responseJson = await response1.json();
                setNoWordSets(responseJson.amount);
            }

            // call api to get word count
            const response2 = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/me/count`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`,
                }
            }
            );

            if (response2.ok) {
                const responseJson = await response2.json();
                setNoWords(responseJson.amount);
            }
        }

        getUserInfo();
    }, [reloadSignal])

    return (
        <>
            <div className="setting">
                <div style={{ display: "flex", backgroundColor: "#21B6A8", marginTop: "20px", borderRadius: "22px" }}>
                    <div className="setting_userAvatar">
                        <img src={userInfo.avatarUrl ? userInfo.avatarUrl : "./default_user.png"} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}></img>
                        {
                            isHovered &&
                            <div className="setting_upload-button-container" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                                <label htmlFor="avatar-input" className="setting_custom-file-upload">Change Avatar</label>
                            </div>
                        }
                        <input accept=".png,.jpg,.jpeg" id="avatar-input" type="file" onChange={(e) => setAvatarFile(e.target.files[0])} />
                    </div>
                    <div className="setting_userStudyInfo">
                        <p className="setting_title" style={{ marginTop: "60px" }}>You have studied with us {Math.ceil((new Date() - new Date(userInfo.createAt)) / (1000 * 60 * 60 * 24))} days from {userInfo ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(userInfo.createAt)) : "NaN"}</p>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <p className="setting_info setting_title">Words</p>
                                <p className="setting_info">{noWords}</p>
                            </div>
                            <div>
                                <p className="setting_info setting_title">Word sets</p>
                                <p className="setting_info">{noWordSets}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <UpdateInfoZone userInfo={userInfo} setCusAleMsg={setCusAleMsg} />
            </div>
            {cusAleMsg && <CustomAlert message={cusAleMsg} okHandler={() => { setCusAleMsg('') }} />}
        </>
    );
}

function UpdateInfoZone({ userInfo, setCusAleMsg }) {
    // for UI's purpose
    const [isChangePassword, setChangePassword] = useState(false);
    // for API's purpose
    const [fullname, setFullname] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [needUpdate, setNeedUpdate] = useState(false);

    useEffect(() => {
        if (userInfo) {
            setFullname(userInfo.fullname);
            setGender(userInfo.gender);
            setDob(userInfo.dob);
            setEmail(userInfo.email);
            setPhoneNumber(userInfo.phoneNumber);
        }
    }, [userInfo])

    useEffect(() => {
        async function updateUserInfo() {
            const requestBody = {
                "fullname": fullname,
                "email": email,
                "phoneNumber": phoneNumber,
                "dob": dob,
                "gender": gender,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_USER_API_BASE_URL}/users/me`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
                body: JSON.stringify(requestBody),
            }
            );

            if (response.ok) {
                return;
            }

            // catch errors and notify user
            const responseJson = await response.json();
            let alertMessage = '';
            if (Array.isArray(responseJson.message)) {
                responseJson.message.forEach((v, i) => { alertMessage += `${i + 1}. ${v}\n`; });
            } else {
                alertMessage = `1. ${responseJson.message}`;
            }
            setCusAleMsg(alertMessage);
            setNeedUpdate(false);
        }

        if (needUpdate) {
            updateUserInfo();
        }
    }, [needUpdate]);

    return (
        <div className="setting_userUpdateInfo">
            <h1 style={{ fontSize: "45px", fontFamily: "sans-serif", margin: "20px" }}>Profile</h1>
            <div style={{ display: "flex", height: "400px", justifyContent: "center" }}>
                <div className="setting_updateInfo">
                    <div style={{ display: "flex" }}>
                        <div style={{ marginRight: "20px" }}>
                            <div>
                                <label className="setting_label">Username</label><br></br>
                                <input type="text" className="setting_input" id="username" defaultValue={userInfo.username} required style={{ marginBottom: 10, pointerEvents: "none", backgroundColor: "lightgrey" }} />
                            </div>
                            <div>
                                <label className="setting_label">Email</label><br></br>
                                <input onChange={(e) => setEmail(e.target.value)} defaultValue={userInfo.email} type="text" className="setting_input" id="username" required style={{ marginBottom: 10 }} />
                            </div>
                            <div>
                                <label className="setting_label">Phone number</label><br></br>
                                <input onChange={(e) => setPhoneNumber(e.target.value)} defaultValue={userInfo.phoneNumber} type="tel" pattern="0[0-9]{9}" className="setting_input" id="username" required style={{ marginBottom: 10 }} />
                            </div>
                        </div>

                        <div>
                            <div>
                                <label className="setting_label">Full name</label><br></br>
                                <input onChange={(e) => setFullname(e.target.value)} defaultValue={userInfo.fullname} className="setting_input" type="text" required></input>
                            </div>
                            <div>
                                <label className="setting_label">Gender</label><br></br>
                                <select className="setting_optionInput" onChange={(e) => setGender(e.target.value)} defaultValue={userInfo.gender}>
                                    <option value={"male"}>Male</option>
                                    <option value={"female"}>Female</option>
                                    <option value={"unspecified"}>I prefer not to say</option>
                                </select>
                            </div>

                            <div>
                                <label className="setting_label">Date of Birth</label><br></br>
                                <input onChange={(e) => setDob(e.target.value)} defaultValue={userInfo.dob} className="setting_DoBInput" type="date" data-date="" data-date-format="DD MM YYYY" required></input>
                            </div>
                        </div>
                    </div>

                    <button className={needUpdate ? "setting_updateBtn-disable" : "setting_updateBtn"} onClick={() => setNeedUpdate(true)}>{needUpdate ? "Updated" : "Update"}</button>
                </div>
                <div className="setting_changePassword">
                    {
                        isChangePassword ?
                            <ChangePassZone setCusAleMsg={setCusAleMsg} /> :
                            <button className="setting_changepwdBtn" onClick={() => setChangePassword(!isChangePassword)}>Change password</button>
                    }
                </div>
            </div>
        </div>
    )
}

function ChangePassZone({ setCusAleMsg }) {
    const [curPass, setCurPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newPassConf, setNewPassConf] = useState('');
    const [needChange, setNeedChange] = useState(false);

    useEffect(() => {
        async function changeUserPassword() {
            const requestBody = {
                password: curPass,
                newPassword: newPass,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_USER_API_BASE_URL}/users/password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`,
                },
                body: JSON.stringify(requestBody),
            }
            );

            if (response.ok) {
                return;
            }

            // catch errors and notify user
            const responseJson = await response.json();
            let alertMessage = '';
            if (Array.isArray(responseJson.message)) {
                responseJson.message.forEach((v, i) => { alertMessage += `${i + 1}. ${v}\n`; });
            } else {
                alertMessage = `1. ${responseJson.message}`;
            }
            setCusAleMsg(alertMessage);
            setNeedChange(false);
        }

        if (needChange) {
            if (newPass !== newPassConf) {
                setNeedChange(false);
                setCusAleMsg("Password confirmation does not match. Please try again.");
                return;
            }
            changeUserPassword();
        }
    }, [needChange]);

    return (
        <div>
            <label className="setting_label">Current password</label><br></br>
            <input onChange={(e) => setCurPass(e.target.value)} type="password" className="setting_input" id="username" required style={{ marginBottom: 10 }} /><br></br>
            <label className="setting_label">New password</label><br></br>
            <input onChange={(e) => setNewPass(e.target.value)} type="password" className="setting_input" id="username" required style={{ marginBottom: 10 }} /><br></br>
            <label className="setting_label">Confirm new password</label><br></br>
            <input onChange={(e) => setNewPassConf(e.target.value)} type="password" className="setting_input" id="username" required style={{ marginBottom: 10 }} /><br></br>
            <button className={needChange ? "setting_changepwdBtn-disable" : "setting_changepwdBtn"} onClick={() => setNeedChange(true)}>{needChange ? "Changed" : "Change"}</button>
        </div>
    );
}
