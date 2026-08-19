import Home from "./Home/Home.jsx";
import Login from "./login/login.jsx";
import "./App.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "./AppContext.jsx";
import ForgotPassword from "./ForgotPassword/ForgotPassword.jsx";
import Upload from "./upload/upload.jsx";
import AnalysisReport from "./AnalysisReport/AnalysisReport.jsx";
import Styles from "./LoadingSpinner.module.css";

function App() {

  const { isAuthChecked } = useContext(AppContext);
  return (isAuthChecked ?
    <>
      <ToastContainer theme="dark" stacked autoClose={1500} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/analysereport" element={<AnalysisReport />} />
        </Routes>
      </BrowserRouter>
    </> : 
    <div className={Styles.loadani} id="animate">
      <div className={Styles.loadanimation}>
        <div className={Styles.capstart}></div>
        <div className={Styles.loadblock}></div>
      </div>
    </div>

  )
}

export default App
