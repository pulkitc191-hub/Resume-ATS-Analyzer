import Styles from "./home.module.css";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../appcontext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/* ── Inline SVG: Resume document illustration ── */
const ResumeIllustration = () => (
    <svg viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={Styles.resumeSvg}>
        <rect x="22" y="18" width="296" height="388" rx="16" fill="#e0e7ff" opacity="0.5" />
        <rect x="14" y="10" width="296" height="388" rx="16" fill="#ffffff" stroke="#e0e7ff" strokeWidth="1.5" />
        <rect x="14" y="10" width="296" height="90" rx="16" fill="url(#headerGrad)" />
        <rect x="14" y="70" width="296" height="30" fill="url(#headerGrad)" />
        <circle cx="60" cy="55" r="28" fill="white" opacity="0.25" />
        <circle cx="60" cy="55" r="20" fill="white" opacity="0.4" />
        <text x="60" y="61" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Inter, sans-serif">JD</text>
        <rect x="96" y="34" width="140" height="10" rx="5" fill="white" opacity="0.8" />
        <rect x="96" y="52" width="100" height="7" rx="3.5" fill="white" opacity="0.55" />
        <rect x="96" y="66" width="120" height="6" rx="3" fill="white" opacity="0.4" />
        <text x="30" y="120" fill="#6366f1" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="1">EXPERIENCE</text>
        <rect x="30" y="124" width="270" height="1" fill="#e0e7ff" />
        <rect x="30" y="132" width="180" height="7" rx="3.5" fill="#1e1b4b" opacity="0.7" />
        <rect x="30" y="144" width="120" height="6" rx="3" fill="#94a3b8" opacity="0.7" />
        <rect x="30" y="154" width="240" height="5" rx="2.5" fill="#cbd5e1" />
        <rect x="30" y="162" width="210" height="5" rx="2.5" fill="#cbd5e1" />
        <rect x="30" y="170" width="180" height="5" rx="2.5" fill="#cbd5e1" />
        <text x="30" y="194" fill="#6366f1" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="1">EDUCATION</text>
        <rect x="30" y="198" width="270" height="1" fill="#e0e7ff" />
        <rect x="30" y="206" width="160" height="7" rx="3.5" fill="#1e1b4b" opacity="0.7" />
        <rect x="30" y="218" width="100" height="6" rx="3" fill="#94a3b8" opacity="0.7" />
        <rect x="30" y="228" width="200" height="5" rx="2.5" fill="#cbd5e1" />
        <text x="30" y="254" fill="#6366f1" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="1">SKILLS</text>
        <rect x="30" y="258" width="270" height="1" fill="#e0e7ff" />
        <rect x="30" y="265" width="56" height="18" rx="9" fill="#ede9fe" />
        <text x="58" y="278" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">Python</text>
        <rect x="92" y="265" width="52" height="18" rx="9" fill="#dbeafe" />
        <text x="118" y="278" textAnchor="middle" fill="#1d4ed8" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">React</text>
        <rect x="150" y="265" width="48" height="18" rx="9" fill="#d1fae5" />
        <text x="174" y="278" textAnchor="middle" fill="#065f46" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">Node</text>
        <rect x="204" y="265" width="54" height="18" rx="9" fill="#fef3c7" />
        <text x="231" y="278" textAnchor="middle" fill="#92400e" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">SQL</text>
        <rect x="30" y="288" width="60" height="18" rx="9" fill="#fce7f3" />
        <text x="60" y="301" textAnchor="middle" fill="#9d174d" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">Docker</text>
        <rect x="96" y="288" width="46" height="18" rx="9" fill="#ede9fe" />
        <text x="119" y="301" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">AWS</text>
        <text x="30" y="326" fill="#6366f1" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif" letterSpacing="1">ACHIEVEMENTS</text>
        <rect x="30" y="330" width="270" height="1" fill="#e0e7ff" />
        <rect x="30" y="338" width="20" height="5" rx="2.5" fill="#6366f1" opacity="0.3" />
        <rect x="56" y="338" width="200" height="5" rx="2.5" fill="#cbd5e1" />
        <rect x="30" y="348" width="20" height="5" rx="2.5" fill="#6366f1" opacity="0.3" />
        <rect x="56" y="348" width="170" height="5" rx="2.5" fill="#cbd5e1" />
        <rect x="30" y="358" width="20" height="5" rx="2.5" fill="#6366f1" opacity="0.3" />
        <rect x="56" y="358" width="190" height="5" rx="2.5" fill="#cbd5e1" />
        <defs>
            <linearGradient id="headerGrad" x1="0" y1="0" x2="296" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
    </svg>
);

/* ── SVG: Circular ATS Score Ring ── */
const ScoreRing = ({ score = 94 }) => {
    const r = 36;
    const circ = 2 * Math.PI * r;
    const pct = (score / 100) * circ;
    return (
        <svg viewBox="0 0 96 96" className={Styles.scoreRing}>
            <circle cx="48" cy="48" r={r} stroke="#e0e7ff" strokeWidth="8" fill="none" />
            <circle cx="48" cy="48" r={r} stroke="url(#ringGrad)" strokeWidth="8" fill="none"
                strokeLinecap="round"
                strokeDasharray={`${pct} ${circ}`}
                strokeDashoffset={circ * 0.25}
                transform="rotate(-90 48 48)"
            />
            <text x="48" y="44" textAnchor="middle" fill="#1e1b4b" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif">{score}</text>
            <text x="48" y="58" textAnchor="middle" fill="#6b7280" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">ATS Score</text>
            <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
            </defs>
        </svg>
    );
};

/* ── SVG: Upward career trend line ── */
const TrendLine = () => (
    <svg viewBox="0 0 120 60" className={Styles.trendLine} fill="none">
        <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
        </defs>
        <path d="M 0 50 Q 30 45 50 30 T 120 5" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 0 50 Q 30 45 50 30 T 120 5 L 120 60 L 0 60 Z" fill="url(#trendFill)" />
        <circle cx="120" cy="5" r="4" fill="#6366f1" />
        <circle cx="50" cy="30" r="3" fill="#8b5cf6" />
        <circle cx="0" cy="50" r="3" fill="#a78bfa" />
    </svg>
);

/* ── SVG: Checkmark badge ── */
const CheckBadge = () => (
    <svg viewBox="0 0 32 32" className={Styles.checkBadge} fill="none">
        <circle cx="16" cy="16" r="16" fill="#d1fae5" />
        <path d="M9 16.5l5 5 9-9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ════════════════════════════════════════════════ */

function Home() {
    const navigate = useNavigate();
    const { isLoggedIn, userName, hasPreviousReport, serviceURL, setUserName, setIsLoggedIn, setHasPreviousReport } = useContext(AppContext);
    const [isShow, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [delLoading, setDelLoading] = useState(false);

    useEffect(() => {
        const func = (event) => {
            if (event.target.id !== "menu") setShow(false);
        };
        window.addEventListener("click", func);
        return () => window.removeEventListener("click", func);
    }, []);

    const logout = () => {
        setIsLoading(true);
        fetch(`${serviceURL}/logout`, { method: "post", credentials: "include" })
            .then(r => {
                if (r.ok) {
                    setUserName(""); setIsLoggedIn(false); setHasPreviousReport(false);
                    toast.success("Logged out successfully");
                    setIsLoading(false); navigate("/login");
                } else { toast.error("Unauthorised"); setIsLoading(false); }
            })
            .catch(() => { toast.error("Logout failed"); setIsLoading(false); });
    };

    const confirmAgain = () => { document.getElementById("confirmdivdel").style.display = "flex"; };
    const closeDelDiv = () => { document.getElementById("confirmdivdel").style.display = "none"; };

    const delAccount = () => {
        setDelLoading(true);
        fetch(`${serviceURL}/deleteAccount`, { method: "post", credentials: "include" })
            .then(r => {
                if (r.ok) {
                    setIsLoggedIn(false);
                    document.getElementById("confirmdivdel").style.display = "none";
                    setDelLoading(false); setUserName(""); setHasPreviousReport(false);
                    navigate("/login"); toast.success("Account deleted");
                } else { toast.error("Couldn't delete, try again!"); setDelLoading(false); }
            })
            .catch(() => { toast.error("Network Error"); setDelLoading(false); });
    };

    const upnavigate = () => navigate(isLoggedIn ? "/upload" : "/login");

    return (
        <div className={Styles.page}>

            {/* ═══ NAVBAR ═══ */}
            <nav className={Styles.nav}>
                <div className={Styles.navBrand}>
                    <div className={Styles.logoMark}>
                        <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                            <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
                            <path d="M7 9h14M7 13h10M7 17h12M7 21h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                                    <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className={Styles.brandName}>ResumeAI</span>
                </div>

                <div className={Styles.navActions}>
                    {!isLoggedIn ? (
                        <>
                            <Link to="/login"><button className={Styles.btnGhost}>Log in</button></Link>
                            <button className={Styles.btnFill} onClick={upnavigate}>
                                Analyse Free <span>→</span>
                            </button>
                        </>
                    ) : (
                        <div className={Styles.profileWrap}>
                            <h3 id="menu" onClick={() => setShow(p => !p)} className={Styles.avatar}>
                                {userName && userName.length > 0 ? userName[0].toUpperCase() : "U"}
                            </h3>
                        </div>
                    )}
                </div>
            </nav>

            {/* ─ profile dropdown ─ */}
            {isShow && isLoggedIn && (
                <div id="menu" className={Styles.dropdown}>
                    <div id="menu" className={Styles.dropHead}>
                        <span id="menu" className={Styles.dropName}>{userName}</span>
                        <span id="menu" className={Styles.dropTag}>Free plan</span>
                    </div>
                    <hr id="menu" className={Styles.dropDivider} />
                    <button id="menu" className={Styles.dropItem} onClick={logout} disabled={isLoading}>
                        <i id="menu" className="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                    <button id="menu" className={`${Styles.dropItem} ${Styles.dropDanger}`} onClick={confirmAgain} disabled={isLoading}>
                        <i id="menu" className="fa-solid fa-trash-can"></i> Delete account
                    </button>
                </div>
            )}

            {/* ═══ STATIC BACKGROUND ═══ */}
            <div className={Styles.blobA} aria-hidden="true" />
            <div className={Styles.blobB} aria-hidden="true" />
            <div className={Styles.blobC} aria-hidden="true" />
            <div className={Styles.gridBg} aria-hidden="true" />

            {/* ═══ HERO ═══ */}
            <section className={Styles.hero}>

                {/* LEFT */}
                <div className={Styles.heroText}>
                    <div className={Styles.pill}>
                        <span className={Styles.pillDot} />
                        AI-Powered · ATS-Optimised · Free to Start
                    </div>

                    <h1 className={Styles.heading}>
                        Your Resume,<br />
                        <span className={Styles.gradText}>Supercharged</span><br />
                        by AI.
                    </h1>

                    <p className={Styles.subheading}>
                        Upload your resume and get a deep-dive ATS score, keyword gaps,
                        formatting feedback, and actionable suggestions — in seconds.
                    </p>

                    <div className={Styles.stats}>
                        <div className={Styles.statItem}>
                            <span className={Styles.statBig}>50K+</span>
                            <span className={Styles.statSmall}>Resumes analysed</span>
                        </div>
                        <div className={Styles.statDivider} />
                        <div className={Styles.statItem}>
                            <span className={Styles.statBig}>3×</span>
                            <span className={Styles.statSmall}>More interviews</span>
                        </div>
                        <div className={Styles.statDivider} />
                        <div className={Styles.statItem}>
                            <span className={Styles.statBig}>98%</span>
                            <span className={Styles.statSmall}>Accuracy rate</span>
                        </div>
                    </div>

                    <div className={Styles.heroCtas}>
                        <button className={Styles.ctaPrimary} disabled={isLoading} onClick={upnavigate}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Analyse My Resume
                        </button>
                        {hasPreviousReport && (
                            <button className={Styles.ctaSecondary} disabled={isLoading} onClick={() => navigate("/analysereport")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                View Last Report
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT — illustration */}
                <div className={Styles.heroVisual}>
                    <div className={Styles.visualFrame}>
                        <ResumeIllustration />

                        {/* Score badge */}
                        <div className={Styles.scoreBadge}>
                            <ScoreRing score={94} />
                        </div>

                        {/* Keyword tag */}
                        <div className={Styles.floatTag} style={{ top: "12%", right: "-18%" }}>
                            <span className={Styles.tagDot} style={{ background: "#6366f1" }} />
                            28 keywords matched
                        </div>

                        {/* Check badge — below achievements, in document white space */}
                        <div className={Styles.floatTag} style={{ bottom: "10%", right: "53%" }}>
                            <CheckBadge />
                            Format: Excellent
                        </div>

                        {/* Trend card */}
                        <div className={Styles.trendCard}>
                            <span className={Styles.trendLabel}>Interview calls</span>
                            <TrendLine />
                            <span className={Styles.trendUp}>↑ 3× increase</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ DELETE ACCOUNT MODAL ═══ */}
            <div className={Styles.modalOverlay} id="confirmdivdel">
                <div className={Styles.modalCard}>
                    <div className={Styles.modalIcon}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h3>Delete your account?</h3>
                    <p>This permanently removes all your data and analysis history. This action cannot be undone.</p>
                    <div className={Styles.modalBtns}>
                        <button className={Styles.modalDel} disabled={delLoading} onClick={delAccount}>
                            {delLoading ? "Deleting…" : "Yes, Delete"}
                        </button>
                        <button className={Styles.modalCancel} disabled={delLoading} onClick={closeDelDiv}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Home;
