import { Link } from "react-router-dom";
import "../styles/Login.css"
export default function Login() {
    const baseUrl = import.meta.env.BASE_URL;
    return (

        <div className="login">

            <div className="leftContainer">

                <div className="loginArea">
                    <form className="form">
                        <div className="loginInfo">
                        <h1 style={{ fontSize: 60, textAlign: "center", fontFamily: 'Segoe UI', marginTop: -20, marginBottom: 30 }}>Sign in</h1>
                            <label className="label">Username</label><br></br>
                            <input type="text" className = "input" id="username" required style={{marginBottom: 10}} /><br></br>
                            <label className="label">Password</label><br></br>
                            <input type="password" className = "input" id="password" required /><br></br> <br></br>
                            <div className="action">
                                <button type="submit" id="submit" className="submit">LOGIN</button><br></br>
                                <Link to={`${baseUrl}passwordrecovery`} className="link">Forgot your password?</Link>
                                <Link to={`${baseUrl}signup`} className="link">Don't have an account? Sign up</Link>
                            </div>
                        </div>

                    </form>

                </div>

            </div>

            <div className="rightContainer">
                <img src="./logo_transparent.svg" alt="logo" width={1000}></img>
            </div>

        </div>


    );
}