import { useContext, useState, useEffect } from "react";
import Styles from "./login.module.css";
import { toast } from "react-toastify";
import { AppContext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";
import GoogleSignInButton from "../GoogleSignInButton.jsx";

function Login() {
    const navigate = useNavigate();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { backendURL, setHasPreviousReport, setUserName, setIsLoggedIn, isLoggedIn } = useContext(AppContext);
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    const submit = (event) => {
        event.preventDefault();
        
        if (!isLoginMode) {
            if (name.trim() === "") {
                toast.warn("Username must not be empty");
                return;
            }
            if (email.trim() === "") {
                toast.warn("Email must not be empty");
                return;
            }
            if (!validateEmail(email.trim())) {
                toast.warn("Invalid Email");
                return;
            }
            if (password.length < 6) {
                toast.warn("Password must be at least 6 characters");
                return;
            }
            if (password !== confirmPassword) {
                toast.warn("Passwords don't match");
                return;
            }
            
            setIsLoading(true);
            fetch(`${backendURL}/verifyEmail`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: name.trim(), email: email.trim() })
            })
                .then(response => {
                    if (response.ok) {
                        setIsEmailVerified(true);
                        setIsLoading(false);
                    } else {
                        return response.text().then(message => {
                            toast.error(message || "Unable to send verification OTP");
                            setIsLoading(false);
                        });
                    }
                })
                .catch(() => {
                    toast.error("Signup Failed");
                    setIsLoading(false);
                });

        } else {
            if (email.trim() === "") {
                toast.warn("Email must not be empty");
                return;
            }
            if (!validateEmail(email.trim())) {
                toast.warn("Invalid Email");
                return;
            }
            if (password.length < 6) {
                toast.warn("Password must be at least 6 characters");
                return;
            }
            
            setIsLoading(true);
            fetch(`${backendURL}/login`, {
                method: "post",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password: password }),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        setEmail("");
                        setPassword("");
                        setIsLoading(false);
                        setShowPass(false);
                        toast.success("Successfully logged in");
                        return response.json();
                    } else {
                        setIsLoading(false);
                        toast.error("Invalid credentials");
                        return null;
                    }
                })
                .then(data => {
                    if (data != null) {
                        setIsLoggedIn(true);
                        setUserName(data.username);
                        setHasPreviousReport(data.isPrevious);
                        navigate("/");
                    }
                })
                .catch(() => {
                    toast.error("Login Failed");
                    setIsLoading(false);
                });
        }
    };

    function toggleAuthMode() {
        setName("");
        setEmail("");
        setPassword("");
        setShowPass(false);
        setShowConfirmPass(false);
        setConfirmPassword("");
        setIsLoginMode(!isLoginMode);
    }

    const handleOtpInput = (index, event) => {
        if (index < 5 && event.target.value !== "" && event.target.value.replace(/\D/, "") !== "") {
            document.getElementById(`otp-${index + 1}`).focus();
        }
        if (event.target.value.replace(/\D/, "") !== "") {
            let temp = [...otp];
            temp[index] = event.target.value;
            setOtp(temp);
        }
        if (event.target.value.replace(/\D/, "") === "") {
            event.target.value = "";
        }
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            if (index > 0 && event.target.value === "") {
                document.getElementById(`otp-${index - 1}`).focus();
                event.preventDefault();
            }
            let temp = [...otp];
            temp[index] = "";
            event.target.value = "";
            setOtp(temp);
        } else {
            if (event.target.value.length === 1 && index < 5 && event.target.value.replace(/\D/, "") !== "") {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        }
    };

    const submitOtp = () => {
        const enteredOtp = otp.join("");
        
        if (enteredOtp.length < 6) {
            toast.error("Fill all fields");
            return;
        }
        
        setIsLoading(true);
        fetch(`${backendURL}/register`, {
            method: "post",
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                username: name.trim(), 
                email: email.trim(), 
                password: password, 
                verifyotp: enteredOtp 
            })
        })
            .then(response => {
                if (response.ok) {
                    setOtp(["", "", "", "", "", ""]);
                    setName("");
                    setEmail("");
                    setPassword("");
                    toast.success("Account created successfully");
                    setIsLoading(false);
                    setIsEmailVerified(false);
                    setShowPass(false);
                    setShowConfirmPass(false);
                    setConfirmPassword("");
                    setIsLoginMode(true);
                } else {
                    setOtp(["", "", "", "", "", ""]);
                    toast.error("Invalid OTP");
                    setIsLoading(false);
                }
            })
            .catch(() => { 
                toast.error("Network error"); 
                setIsLoading(false); 
            });
    };

    return (
        <div className={Styles.container}>
            <nav className={Styles.nav}>
                <Link to="/" className={Styles.navLogo}>
                    <div className={Styles.logoMark}>
                        <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                            <rect width="28" height="28" rx="8" fill="url(#loginLogoGrad)" />
                            <path d="M7 9h14M7 13h10M7 17h12M7 21h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="loginLogoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className={Styles.logoText}>ResumeAI</span>
                </Link>
            </nav>
            {!isEmailVerified ? (
                <div className={Styles.logincontainer}>
                    <h1>{isLoginMode ? "Login" : "Signup"}</h1>
                    {!isLoginMode && (
                        <input className={Styles.logincontainerinput} onChange={(event) => setName(event.target.value)} type="text" name="username" maxLength={20} autoComplete="off" value={name} placeholder="Username" />
                    )}
                    <input type="email" className={Styles.logincontainerinput} onChange={(event) => setEmail(event.target.value)} name="email" value={email} autoComplete="off" placeholder="Email" />
                    
                    <div className={Styles.passdiv}>
                        <input type={`${showPass ? "text" : "password"}`} onChange={(event) => setPassword(event.target.value)} name="password" value={password} autoComplete="off" placeholder="Password" />
                        <i className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowPass(!showPass)}></i>
                    </div>
                    
                    {!isLoginMode && (
                        <div className={Styles.passdiv}>
                            <input type={`${showConfirmPass ? "text" : "password"}`} name="confirmpassword" onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" autoComplete="off" value={confirmPassword} />
                            <i className={`fa-solid ${showConfirmPass ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowConfirmPass(!showConfirmPass)}></i>
                        </div>
                    )}
                    
                    {isLoginMode && (
                        <Link className={Styles.linkdis} to={"/forgotpassword"}> 
                            <p className={Styles.forgetpass}>Forgot password?</p>
                        </Link>
                    )}
                    
                    <button className={Styles.logincontainerbutton} onClick={submit} disabled={isLoading}>
                        {isLoading ? "Loading..." : isLoginMode ? "Login" : "Signup"}
                    </button>
                    
                    <p>
                        {isLoginMode ? "Don't have an account? " : "Already have an account? "} 
                        <span className={Styles.logincontainerspan} onClick={toggleAuthMode}>
                            {isLoginMode ? "Signup" : "Login"}
                        </span>
                    </p>
                    <hr className={Styles.ghr} />

                    <GoogleSignInButton disabled={isLoading} />
                </div>
            ) : null}

            {isEmailVerified ? (
                <div className={Styles.verifycontainer}>
                    <h1>Verify Email</h1>
                    <p>Enter the 6-digit OTP sent to your email address to complete your registration</p>
                    <div className={Styles.otpcontainer}>
                        {otp.map((value, index) => (
                            <input 
                                key={index}
                                inputMode="numeric" 
                                maxLength={1} 
                                placeholder="--" 
                                value={value} 
                                autoComplete="off" 
                                type="text" 
                                className={Styles.otpinp} 
                                id={`otp-${index}`} 
                                onChange={(e) => handleOtpInput(index, e)} 
                                onKeyDown={(e) => handleOtpKeyDown(index, e)} 
                            />
                        ))}
                    </div>
                    <button className={Styles.verbtn} disabled={isLoading} onClick={submitOtp}>
                        {isLoading ? "Verifying..." : "Verify"}
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default Login;
