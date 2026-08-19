import { toast } from "react-toastify";
import Styles from "./upload.module.css";
import { useContext } from "react";
import { AppContext } from "../appcontext";
import { useNavigate, Link } from "react-router-dom";

function Upload() {
    const { serviceURL } = useContext(AppContext);
    const navigate = useNavigate();

    const handleFileChange = () => {
        const inp = document.getElementById("resume");
        const file = inp.files[0];
        const indication = document.getElementById("indication");
        if (!file) return;

        if (!['application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
            toast.error("Upload a resume in pdf/doc format ");
            inp.value = "";
            indication.textContent = "No file selected";
        }
        else if (file.size > 2 * 1024 * 1024) {
            toast.error("Upload a file less than 2MB");
            inp.value = "";
            indication.textContent = "No file selected";
        }
        else {
            const str = file.name;
            if (str.length <= 25) {
                indication.textContent = str;
            }
            else {
                indication.textContent = str.substring(0, 15) + "..." + str.substring(str.length - 7, str.length);
            }
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const uploadform = document.getElementById("upform");
        const formdata = new FormData(uploadform);
        if (formdata.get("roles").trim() === "") {
            toast.warn("Role must not be empty");
            return;
        }
        if (!formdata.get("file") || !formdata.get("file").name) {
            toast.warn("Please upload the resume");
            return;
        }
        
        document.getElementById("overlay").style.display = "flex";
        
        fetch(`${serviceURL}/extract`, { method: "post", body: formdata, credentials: "include" })
            .then(response => {
                if (response.ok) {
                    uploadform.reset();
                    document.getElementById("overlay").style.display = "none";
                    document.getElementById("indication").textContent = "No file selected";
                    navigate("/analysereport");
                }
                else {
                    uploadform.reset();
                    toast.error("Irrelevant resume or role");
                    document.getElementById("overlay").style.display = "none";
                    document.getElementById("indication").textContent = "No file selected";
                }
            })
            .catch(() => {
                toast.error("Network error");
                document.getElementById("overlay").style.display = "none";
            });
    };

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
                    <button className={Styles.btnGhost} onClick={() => navigate("/")}>Home</button>
                </div>
            </nav>

            {/* ═══ STATIC BACKGROUND ═══ */}
            <div className={Styles.blobA} aria-hidden="true" />
            <div className={Styles.blobB} aria-hidden="true" />
            <div className={Styles.blobC} aria-hidden="true" />
            <div className={Styles.gridBg} aria-hidden="true" />
            
            <img src="/bg-illustration.png" alt="Abstract Resume Illustration" className={Styles.bgImage} aria-hidden="true" />

            {/* ═══ UPLOAD CONTAINER ═══ */}
            <div className={Styles.mainContent}>
                <div className={Styles.uploadCard}>
                    <div className={Styles.cardHeader}>
                        <h2>Analyse Your Resume</h2>
                        <p>Upload your resume to get instant ATS optimization feedback.</p>
                    </div>

                    <form id="upform" encType="multipart/form-data" className={Styles.uploadForm}>
                        <div className={Styles.inputGroup}>
                            <label htmlFor="roles">Target Role</label>
                            <input type="text" autoComplete="off" placeholder="e.g. Software Engineer" name="roles" id="roles" className={Styles.textInput} />
                        </div>

                        <div className={Styles.inputGroup}>
                            <label>Resume Document</label>
                            <label htmlFor="resume" className={Styles.dropzone}>
                                <div className={Styles.dropIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </div>
                                <h4>Click to browse files</h4>
                                <p>PDF or DOCX (max 2MB)</p>
                                <span id="indication" className={Styles.fileIndication}>No file selected</span>
                            </label>
                            <input type="file" name="file" onChange={handleFileChange} id="resume" hidden accept=".pdf,.doc,.docx" />
                        </div>

                        <button onClick={handleSubmit} className={Styles.btnPrimary}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            Start Analysis
                        </button>
                    </form>
                </div>

                <div className={Styles.guidelinesCard}>
                    <h3>Upload Guidelines</h3>
                    <ul className={Styles.guideList}>
                        <li>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span><strong>Format:</strong> PDF or DOC/DOCX only</span>
                        </li>
                        <li>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span><strong>Size:</strong> Less than 2 MB</span>
                        </li>
                        <li>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span><strong>Language:</strong> English only</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ═══ LOADING OVERLAY ═══ */}
            <div className={Styles.overlay} id="overlay" style={{ display: 'none' }}>
                <div className={Styles.loaderBox}>
                    <div className={Styles.spinner}></div>
                    <h3>Analysing Resume</h3>
                    <p>Extracting keywords and formatting data...</p>
                </div>
            </div>
        </div>
    );
}

export default Upload;
