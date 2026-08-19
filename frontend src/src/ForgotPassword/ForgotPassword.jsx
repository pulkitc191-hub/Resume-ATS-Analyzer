import { useContext, useState, useEffect } from "react";
import Styles from "./ForgotPassword.module.css";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../appcontext";
import { toast } from "react-toastify";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailPresent, setIsEmailPresent] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    
    const { backendURL, isLoggedIn } = useContext(AppContext);
    
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/");
        }
    }, [isLoggedIn, navigate]);

    const handleOtpInput = (index, event) => {
        const digit = event.target.value.replace(/\D/g, "").slice(-1);
        const updatedOtp = [...otp];
        updatedOtp[index] = digit;
        setOtp(updatedOtp);

        if (digit && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleOtpKeyDown = (index, event) => {
        if (event.key === "Backspace") {
            if (index > 0 && !otp[index]) {
                event.preventDefault();
                const updatedOtp = [...otp];
                updatedOtp[index - 1] = "";
                setOtp(updatedOtp);
                document.getElementById(`otp-${index - 1}`)?.focus();
                return;
            }
        }
    };

    const handleOtpPaste = (index, event) => {
        event.preventDefault();
        const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6 - index);
        if (!pastedDigits) return;

        const updatedOtp = [...otp];
        pastedDigits.split("").forEach((digit, offset) => {
            updatedOtp[index + offset] = digit;
        });
        setOtp(updatedOtp);
        document.getElementById(`otp-${Math.min(index + pastedDigits.length, 5)}`)?.focus();
    };

    function validateEmail(emailVal) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailVal);
    }

    const handleEmailSubmit = () => {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === "") {
            toast.warn("Email must not be empty");
            return;
        }
        if (!validateEmail(normalizedEmail)) {
            toast.warn("Please enter a valid email address");
            return;
        }
        setIsLoading(true);
        setEmail(normalizedEmail);
        fetch(`${backendURL}/resetOtpSent`, { 
            method: "post", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ email: normalizedEmail }) 
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Verification OTP sent to your email");
                    setIsLoading(false);
                    setIsEmailPresent(true);
                } else {
                    return response.text().then(message => {
                        toast.error(message || "Unable to send verification OTP");
                        setIsLoading(false);
                    });
                }
            })
            .catch(() => {
                toast.error("Verification request failed");
                setIsLoading(false);
            });
    };

    const handleOtpVerify = () => {
        const enteredOtp = otp.join("");
        
        if (enteredOtp.length < 6) {
            toast.error("Please enter the complete 6-digit OTP");
            return;
        }
        setIsLoading(true);
        fetch(`${backendURL}/verifyResetOtp`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim(), otp: enteredOtp })
        })
            .then(response => {
                if (response.ok) {
                    toast.success("OTP verified! Set your new password");
                    setIsLoading(false);
                    setIsEmailVerified(true);
                } else {
                    setOtp(["", "", "", "", "", ""]);
                    toast.error("Invalid or expired OTP");
                    setIsLoading(false);
                }
            })
            .catch(() => { 
                toast.error("Verification failed");
                setIsLoading(false); 
            });
    };

    const handlePasswordReset = () => {
        const enteredOtp = otp.join("");
        
        if (newPassword.length < 6) {
            toast.warn("Password must be at least 6 characters long");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.warn("Passwords do not match");
            return;
        }
        setIsLoading(true);
        fetch(`${backendURL}/resetPassword`, { 
            method: "post", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ email: email.trim(), otp: enteredOtp, password: newPassword }) 
        })
            .then(response => {
                if (response.ok) {
                    toast.success("Password reset successfully! Please log in.");
                    setIsLoading(false);
                    setOtp(["", "", "", "", "", ""]);
                    setEmail("");
                    setNewPassword("");
                    setIsEmailVerified(false);
                    setIsEmailPresent(false);
                    setShowPass(false);
                    setConfirmPassword("");
                    setShowConfirmPass(false);
                    navigate("/login");
                } else {
                    toast.error("Failed to reset password. Please try again.");
                    setIsLoading(false);
                }
            })
            .catch(() => {
                toast.error("Password reset error");
                setIsLoading(false);
            });
    };

    const currentStep = !isEmailPresent ? 1 : !isEmailVerified ? 2 : 3;

    return (
        <div className={Styles.container}>
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

            {!isEmailPresent && !isEmailVerified && (
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
                            onChange={(event) => setEmail(event.target.value)}
                            type="email"
                            name="email"
                            id="reset-email"
                            autoComplete="email"
                            value={email}
                            placeholder="name@example.com"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSubmit(); }}
                        />
                    </div>

                    <button className={Styles.btnPrimary} onClick={handleEmailSubmit} disabled={isLoading}>
                        {isLoading ? "Sending Code..." : "Send Verification Code"}
                    </button>

                    <div className={Styles.cardFooter}>
                        <Link to="/login" className={Styles.backLink}>
                            Remember your password? <strong>Log in</strong>
                        </Link>
                    </div>
                </div>
            )}

            {isEmailPresent && !isEmailVerified && (
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
                                onChange={(e) => handleOtpInput(index, e)}
                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                onPaste={(e) => handleOtpPaste(index, e)}
                            />
                        ))}
                    </div>

                    <button className={Styles.btnPrimary} onClick={handleOtpVerify} disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify OTP Code"}
                    </button>

                    <div className={Styles.cardFooter}>
                        <button
                            className={Styles.backLink}
                            onClick={() => {
                                setIsEmailPresent(false);
                                setOtp(["", "", "", "", "", ""]);
                            }}
                            disabled={isLoading}
                        >
                            ← Change email address
                        </button>
                    </div>
                </div>
            )}

            {isEmailPresent && isEmailVerified && (
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
                                onChange={(event) => setNewPassword(event.target.value)}
                                type={showPass ? "text" : "password"}
                                name="password"
                                id="newpass"
                                autoComplete="new-password"
                                placeholder="Minimum 6 characters"
                                value={newPassword}
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordReset(); }}
                            />
                            <i
                                className={`fa-solid ${showPass ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => setShowPass(!showPass)}
                                aria-label="Toggle password visibility"
                            />
                        </div>
                    </div>

                    <div className={Styles.inputGroup}>
                        <label className={Styles.inputLabel} htmlFor="confirmpass">Confirm New Password</label>
                        <div className={Styles.passdiv}>
                            <input
                                type={showConfirmPass ? "text" : "password"}
                                name="confirmpassword"
                                id="confirmpass"
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Re-enter new password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordReset(); }}
                            />
                            <i
                                className={`fa-solid ${showConfirmPass ? "fa-eye-slash" : "fa-eye"}`}
                                onClick={() => setShowConfirmPass(!showConfirmPass)}
                                aria-label="Toggle password visibility"
                            />
                        </div>
                    </div>

                    <button className={Styles.btnPrimary} onClick={handlePasswordReset} disabled={isLoading}>
                        {isLoading ? "Updating Password..." : "Update Password"}
                    </button>

                    <div className={Styles.cardFooter}>
                        <Link to="/login" className={Styles.backLink}>
                            Cancel and return to <strong>Log in</strong>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ForgotPassword;
