import { useContext, useState, useEffect } from "react"
import Styles from "./resetpassword.module.css"
import { useNavigate, Link } from "react-router-dom"
import { usercontext } from "../appcontext"
import { toast } from "react-toastify"

function Forgotpassword() {
    const navigate = useNavigate()
    const [email, setemail] = useState("")
    const [otp, setotp] = useState(["", "", "", "", "", ""])
    const [newpassword, setnewpassword] = useState("")
    const [confirmpassword, setconfirmpassword] = useState("")
    const [isloading, setisloading] = useState(false)
    const [isemailpresent, setisemailpresent] = useState(false)
    const [isemailverified, setisemailverified] = useState(false)
    const { backendURL, islogged } = useContext(usercontext)
    const [showpass, setshowpass] = useState(false)
    const [showconfirmpass, setshowconfirmpass] = useState(false)

    useEffect(() => {
        if (islogged) {
            navigate("/")
        }
    }, [islogged])

    const handleInput = (index, event) => {
        if (index < 5 && event.target.value !== "" && event.target.value.replace(/\D/, "") !== "") {
            const nextInp = document.getElementById(`otp-${index + 1}`);
            if (nextInp) nextInp.focus();
        }
        if (event.target.value.replace(/\D/, "") !== "") {
            const tem = [...otp]
            tem[index] = event.target.value
            setotp(tem)
        }
        if (event.target.value.replace(/\D/, "") === "") {
            event.target.value = ""
        }
    }

    const handlebck = (index, event) => {
        if (event.key === "Backspace") {
            if (index > 0 && !otp[index]) {
                const prevInp = document.getElementById(`otp-${index - 1}`);
                if (prevInp) prevInp.focus();
            }
            const tem = [...otp]
            tem[index] = ""
            event.target.value = ""
            setotp(tem)
        } else {
            if (event.target.value.length === 1 && index < 5 && event.target.value.replace(/\D/, "") !== "") {
                const nextInp = document.getElementById(`otp-${index + 1}`);
                if (nextInp) nextInp.focus();
            }
        }
    }

    function validateEmail(emailVal) {
        const emailregex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailregex.test(emailVal)
    }

    const verifyemail = () => {
        if (email.trim() === "") {
            toast.warn("Email must not be empty")
            return;
        }
        if (!validateEmail(email.trim())) {
            toast.warn("Please enter a valid email address")
            return;
        }
        setisloading(true)
        fetch(`${backendURL}/resetOtpSent`, { 
            method: "post", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ "email": email.trim() }) 
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Verification OTP sent to your email")
                    setisloading(false)
                    setisemailpresent(true)
                } else {
                    toast.error("Email not found in records")
                    setisloading(false)
                }
            })
            .catch(() => {
                toast.error("Verification request failed")
                setisloading(false)
            })
    }

    const verifyprocess = () => {
        let enteredOtp = ""
        otp.forEach((i) => enteredOtp += i)
        if (enteredOtp.length < 6) {
            toast.error("Please enter the complete 6-digit OTP")
            return;
        }
        setisloading(true)
        fetch(`${backendURL}/verifyResetOtp`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "email": email.trim(), "otp": enteredOtp })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("OTP verified! Set your new password")
                    setisloading(false)
                    setisemailverified(true)
                } else {
                    setotp(["", "", "", "", "", ""])
                    toast.error("Invalid or expired OTP")
                    setisloading(false)
                }
            })
            .catch(() => { 
                toast.error("Verification failed")
                setisloading(false) 
            })
    }

    const resetpasswordsent = () => {
        let enteredOtp = ""
        otp.forEach((i) => enteredOtp += i)
        if (newpassword.length < 6) {
            toast.warn("Password must be at least 6 characters long")
            return;
        }
        if (newpassword !== confirmpassword) {
            toast.warn("Passwords do not match")
            return;
        }
        setisloading(true)
        fetch(`${backendURL}/resetPassword`, { 
            method: "post", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ "email": email.trim(), "otp": enteredOtp, "password": newpassword }) 
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Password reset successfully! Please log in.")
                    setisloading(false)
                    setotp(["", "", "", "", "", ""])
                    setemail("")
                    setnewpassword("")
                    setisemailverified(false)
                    setisemailpresent(false)
                    setshowpass(false)
                    setconfirmpassword("")
                    setshowconfirmpass(false)
                    navigate("/login")
                } else {
                    toast.error("Failed to reset password. Please try again.")
                    setisloading(false)
                }
            })
            .catch(() => {
                toast.error("Password reset error")
                setisloading(false)
            })
    }

    // Determine current step index (1, 2, or 3)
    const currentStep = !isemailpresent ? 1 : !isemailverified ? 2 : 3

    return (
        <div className={Styles.container}>
            {/* ═══ NAVBAR ═══ */}
            <nav className={Styles.nav}>
                <Link to="/" className={Styles.navLogo}>
                    <div className={Styles.logoMark}>
                        <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                            <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
                            <path d="M7 9h14M7 13h10M7 17h12M7 21h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className={Styles.logoText}>ResumeAI</span>
                </Link>

                <Link to="/login" className={Styles.navBackBtn}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Login
                </Link>
            </nav>

            {/* ═══ STEPPER ═══ */}
            <div className={Styles.stepper}>
                <div className={`${Styles.stepNode} ${currentStep >= 1 ? Styles.stepActive : ''} ${currentStep > 1 ? Styles.stepCompleted : ''}`}>
                    <div className={Styles.stepCircle}>{currentStep > 1 ? "✓" : "1"}</div>
                    <span>Email</span>
                </div>
                <div className={`${Styles.stepLine} ${currentStep >= 2 ? Styles.stepLineActive : ''}`} />
                <div className={`${Styles.stepNode} ${currentStep >= 2 ? Styles.stepActive : ''} ${currentStep > 2 ? Styles.stepCompleted : ''}`}>
                    <div className={Styles.stepCircle}>{currentStep > 2 ? "✓" : "2"}</div>
                    <span>Verify</span>
                </div>
                <div className={`${Styles.stepLine} ${currentStep >= 3 ? Styles.stepLineActive : ''}`} />
                <div className={`${Styles.stepNode} ${currentStep === 3 ? Styles.stepActive : ''}`}>
                    <div className={Styles.stepCircle}>3</div>
                    <span>Reset</span>
                </div>
            </div>

            {/* ═══ STEP 1: EMAIL ENTRY ═══ */}
            {!isemailpresent && !isemailverified && (
                <div className={Styles.card}>
                    <div className={Styles.iconHeader}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>

                    <h1>Forgot Password?</h1>
                    <p className={Styles.cardSubtitle}>
                        Enter the email associated with your account and we’ll send a 6-digit OTP to reset your password.
                    </p>

                    <div className={Styles.inputGroup}>
                        <label className={Styles.inputLabel} htmlFor="reset-email">Email Address</label>
                        <input
                            className={Styles.textInput}
                            onChange={(event) => setemail(event.target.value)}
                            type="email"
                            name="email"
                            id="reset-email"
                            autoComplete="email"
                            value={email}
                            placeholder="name@example.com"
                            onKeyDown={(e) => { if (e.key === 'Enter') verifyemail(); }}
                        />
                    </div>

                    <button className={Styles.btnPrimary} onClick={verifyemail} disabled={isloading}>
                        {isloading ? "Sending Code..." : "Send Verification Code"}
                    </button>

                    <div className={Styles.cardFooter}>
                        <Link to="/login" className={Styles.backLink}>
                            Remember your password? <strong>Log in</strong>
                        </Link>
                    </div>
                </div>
            )}

            {/* ═══ STEP 2: OTP VERIFICATION ═══ */}
            {isemailpresent && !isemailverified && (
                <div className={Styles.card}>
                    <div className={Styles.iconHeader}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                    </div>

                    <h1>Verify OTP</h1>
                    <p className={Styles.cardSubtitle}>
                        Enter the 6-digit verification code sent to:
                        <br />
                        <span className={Styles.emailPill}>{email}</span>
                    </p>

                    <div className={Styles.otpcontainer}>
                        {otp.map((value, index) => (
                            <input
                                inputMode="numeric"
                                maxLength={1}
                                placeholder="·"
                                key={index}
                                value={value}
                                autoComplete="off"
                                type="text"
                                className={Styles.otpinp}
                                id={`otp-${index}`}
                                onChange={(e) => handleInput(index, e)}
                                onKeyDown={(e) => handlebck(index, e)}
                            />
                        ))}
                    </div>

                    <button className={Styles.btnPrimary} onClick={verifyprocess} disabled={isloading}>
                        {isloading ? "Verifying..." : "Verify OTP Code"}
                    </button>

                    <div className={Styles.cardFooter}>
                        <button
                            className={Styles.backLink}
                            onClick={() => {
                                setisemailpresent(false);
                                setotp(["", "", "", "", "", ""]);
                            }}
                            disabled={isloading}
                        >
                            ← Change email address
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ STEP 3: SET NEW PASSWORD ═══ */}
            {isemailpresent && isemailverified && (
                <div className={Styles.card}>
                    <div className={Styles.iconHeader}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>

                    <h1>Set New Password</h1>
                    <p className={Styles.cardSubtitle}>
                        Your identity has been verified. Create a strong new password for your account.
                    </p>

                    <div className={Styles.inputGroup}>
                        <label className={Styles.inputLabel} htmlFor="newpass">New Password</label>
                        <div className={Styles.passdiv}>
                            <input
                                onChange={(event) => setnewpassword(event.target.value)}
                                type={showpass ? "text" : "password"}
                                name="password"
                                id="newpass"
                                autoComplete="new-password"
                                placeholder="Minimum 6 characters"
                                value={newpassword}
                            />
                            <i
                                className={`fa-solid ${showpass ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => setshowpass(!showpass)}
                                aria-label="Toggle password visibility"
                            />
                        </div>
                    </div>

                    <div className={Styles.inputGroup}>
                        <label className={Styles.inputLabel} htmlFor="confirmpass">Confirm New Password</label>
                        <div className={Styles.passdiv}>
                            <input
                                type={showconfirmpass ? "text" : "password"}
                                name="confirmpassword"
                                id="confirmpass"
                                onChange={(event) => setconfirmpassword(event.target.value)}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                value={confirmpassword}
                                onKeyDown={(e) => { if (e.key === 'Enter') resetpasswordsent(); }}
                            />
                            <i
                                className={`fa-solid ${showconfirmpass ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => setshowconfirmpass(!showconfirmpass)}
                                aria-label="Toggle password visibility"
                            />
                        </div>
                    </div>

                    <button className={Styles.btnPrimary} onClick={resetpasswordsent} disabled={isloading}>
                        {isloading ? "Updating Password..." : "Update Password"}
                    </button>

                    <div className={Styles.cardFooter}>
                        <Link to="/login" className={Styles.backLink}>
                            Cancel and return to <strong>Log in</strong>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Forgotpassword