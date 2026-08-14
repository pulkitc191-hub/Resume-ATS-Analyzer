import { useContext, useEffect, useState } from "react";
import Styles from "./analyse.module.css";
import { Flat } from "@alptugidin/react-circular-progress-bar";
import { usercontext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";

function Analyse() {
    const navigate = useNavigate();
    const [score, setscore] = useState(0);
    const [atsscore, setatsscore] = useState(0);
    const [pros, setpros] = useState([]);
    const [cons, setcons] = useState([]);
    const [sug, setsug] = useState([]);
    const [jobs, setjobs] = useState([]);
    const { serviceURL } = useContext(usercontext);
    const [isfetched, setisfetched] = useState(false);
    const [iserror, setiserror] = useState(false);

    // Accordion: track which panel is open (null = none, "strengths" | "improvements" | "tips")
    const [openPanel, setOpenPanel] = useState("strengths");

    const togglePanel = (panel) => {
        setOpenPanel(prev => prev === panel ? null : panel);
    };

    useEffect(() => {
        document.getElementById("overlay").style.display = "flex";
        fetch(`${serviceURL}/lastReport`, { credentials: "include" })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    setiserror(true);
                    document.getElementById("overlay").style.display = "none";
                    throw new Error("Failed to fetch");
                }
            })
            .then(data => {
                if (data != null) {
                    setscore(data.score);
                    setatsscore(data.atsoptimizationscore);
                    setpros(data.pros);
                    setcons(data.cons);
                    setsug(data.suggestions);
                    setjobs(data.jobs);
                    setisfetched(true);
                    document.getElementById("overlay").style.display = "none";
                }
            })
            .catch(error => {
                console.log(error);
                setiserror(true);
                document.getElementById("overlay").style.display = "none";
            });
    }, []);

    const flatSx = {
        strokeColor: '#6366f1',
        bgStrokeColor: '#e0e7ff',
        bgColor: { value: '#ffffff', transparency: '00' },
        barWidth: 10,
        strokeLinecap: 'round',
        valueSize: 22,
        valueWeight: 'bold',
        valueColor: '#1e1b4b',
        valueFamily: 'Verdana',
        textSize: 11,
        textWeight: 'bold',
        textColor: '#64748b',
        textFamily: 'Verdana',
        loadingTime: 1200,
        valueAnimation: true,
        showMiniCircle: false,
    };

    const panels = [
        {
            id: "strengths",
            label: "Strengths",
            emoji: "✓",
            colorClass: Styles.panelGreen,
            iconClass: Styles.iconGreen,
            items: pros,
            empty: "No specific strengths found.",
        },
        {
            id: "improvements",
            label: "Improvements",
            emoji: "!",
            colorClass: Styles.panelAmber,
            iconClass: Styles.iconAmber,
            items: cons,
            empty: "No improvements needed.",
        },
        {
            id: "tips",
            label: "Tips to Enhance",
            emoji: "💡",
            colorClass: Styles.panelPurple,
            iconClass: Styles.iconPurple,
            items: sug,
            empty: "No additional tips.",
        },
    ];

    return (
        <div className={Styles.page}>
            {/* ═══ NAVBAR ═══ */}
            <nav className={Styles.nav}>
                <Link to="/" className={Styles.navBrand}>
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
                </Link>

                <div className={Styles.navActions}>
                    <button className={Styles.btnGhost} onClick={() => navigate("/uploaddoc")}>Analyse Another</button>
                    <button className={Styles.btnGhost} onClick={() => navigate("/")}>Home</button>
                </div>
            </nav>

            {/* ═══ BACKGROUND ═══ */}
            <div className={Styles.blobA} aria-hidden="true" />
            <div className={Styles.blobB} aria-hidden="true" />
            <div className={Styles.blobC} aria-hidden="true" />
            <div className={Styles.gridBg} aria-hidden="true" />

            {/* ═══ MAIN CONTENT ═══ */}
            <main className={Styles.mainContent}>
                <div className={Styles.pageTitle}>
                    <h1>Analysis Report</h1>
                    <p>Your detailed resume feedback and tailored job suggestions.</p>
                </div>

                {isfetched && !iserror && (
                    <>
                        {/* ── TWO-COLUMN LAYOUT ── */}
                        <div className={Styles.reportLayout}>

                            {/* LEFT SIDEBAR — Scores */}
                            <aside className={Styles.scoreSidebar}>
                                <p className={Styles.sidebarLabel}>Your Scores</p>

                                <div className={Styles.scoreItem}>
                                    {/* Explicit px size so Heat SVG renders correctly */}
                                    <div className={Styles.scoreRing} style={{ width: '160px', height: '160px' }}>
                                        <Flat
                                            progress={score}
                                            range={{ from: 0, to: 100 }}
                                            sign={{ value: '%', position: 'end' }}
                                            showValue={true}
                                            showMiniCircle={false}
                                            text={'Overall'}
                                            sx={flatSx}
                                        />
                                    </div>
                                </div>

                                <div className={Styles.scoreDivider} />

                                <div className={Styles.scoreItem}>
                                    <div className={Styles.scoreRing} style={{ width: '160px', height: '160px' }}>
                                        <Flat
                                            progress={atsscore}
                                            range={{ from: 0, to: 100 }}
                                            sign={{ value: '%', position: 'end' }}
                                            showValue={true}
                                            showMiniCircle={false}
                                            text={'ATS Score'}
                                            sx={flatSx}
                                        />
                                    </div>
                                </div>

                                <div className={Styles.scoreBadge}>
                                    {score >= 70 ? '🟢 Strong Resume' : score >= 40 ? '🟡 Needs Work' : '🔴 Needs Attention'}
                                </div>
                            </aside>

                            {/* RIGHT — Accordion Panels */}
                            <section className={Styles.accordionSection}>
                                {panels.map(panel => (
                                    <div
                                        key={panel.id}
                                        className={`${Styles.accordionItem} ${panel.colorClass} ${openPanel === panel.id ? Styles.accordionOpen : ''}`}
                                    >
                                        {/* Accordion Header */}
                                        <button
                                            className={Styles.accordionHeader}
                                            onClick={() => togglePanel(panel.id)}
                                            aria-expanded={openPanel === panel.id}
                                        >
                                            <span className={`${Styles.accIcon} ${panel.iconClass}`}>{panel.emoji}</span>
                                            <span className={Styles.accLabel}>{panel.label}</span>
                                            <span className={Styles.accCount}>{panel.items.length}</span>
                                            <svg
                                                className={`${Styles.accChevron} ${openPanel === panel.id ? Styles.chevronOpen : ''}`}
                                                width="18" height="18" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </button>

                                        {/* Accordion Body */}
                                        <div className={Styles.accordionBody}>
                                            <ul className={Styles.accList}>
                                                {panel.items.length > 0
                                                    ? panel.items.map((item, i) => (
                                                        <li key={i} className={Styles.accListItem}>
                                                            <span className={Styles.accBullet} />
                                                            {item}
                                                        </li>
                                                    ))
                                                    : <li className={Styles.accListItem}><span className={Styles.accBullet} />{panel.empty}</li>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>

                        {/* ── SUGGESTED JOBS ── */}
                        {jobs.length > 0 && (
                            <div className={Styles.jobsSection}>
                                <h2>Suggested Roles</h2>
                                <div className={Styles.jobsGrid}>
                                    {jobs.map((item, index) => (
                                        <div className={Styles.jobCard} key={index}>
                                            <div className={Styles.jobHeader}>
                                                <h3 className={Styles.jobTitle}>{item.title}</h3>
                                                <span className={Styles.jobCategory}>{item.category?.label?.trim() || "Uncategorized"}</span>
                                            </div>
                                            <div className={Styles.jobDetails}>
                                                <p><strong>🏢 Company:</strong> {item.company?.display_name?.trim() || "Not specified"}</p>
                                                <p><strong>📍 Location:</strong> {item.location?.display_name?.trim() || "Not specified"}</p>
                                            </div>
                                            <p className={Styles.jobDesc}>{item.description}</p>
                                            <a className={Styles.jobAction} href={item.redirect_url} target="_blank" rel="noreferrer">
                                                Apply Now
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {iserror && (
                    <div className={Styles.errorCard}>
                        <h2>Something went wrong</h2>
                        <p>We couldn't fetch your report. Please try analyzing your resume again.</p>
                        <button className={Styles.btnPrimary} onClick={() => navigate("/uploaddoc")}>Try Again</button>
                    </div>
                )}
            </main>

            {/* ═══ LOADING OVERLAY ═══ */}
            <div className={Styles.overlay} id="overlay" style={{ display: 'none' }}>
                <div className={Styles.loaderBox}>
                    <div className={Styles.spinner}></div>
                    <h3>Preparing Report</h3>
                    <p>Scoring your resume against industry standards...</p>
                </div>
            </div>
        </div>
    );
}

export default Analyse;