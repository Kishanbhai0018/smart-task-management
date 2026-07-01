import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiCheckCircle, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Attempt to load email from route state, or temporary registration storage
    const stateEmail = location.state?.email || localStorage.getItem("tempEmail");
    if (stateEmail) {
      setEmail(stateEmail);
    }
  }, [location]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/auth/verify", { email, code });
      setSuccess("Email verified successfully! Redirecting...");
      setTimeout(() => {
        login(res.data);
        localStorage.removeItem("tempEmail");
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check the code.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please provide your email address first.");
      return;
    }

    try {
      await api.post("/auth/resend-verification", { email });
      setSuccess("A new verification code has been sent! Check your email/server console.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-card">
        <h2 className="auth-title text-center">Verify Email</h2>
        <p className="auth-subtitle text-center">
          Enter the 6-digit code sent to your registered email address
        </p>

        {error && (
          <div className="auth-alert bg-danger bg-opacity-10 text-danger border-0 p-3 rounded mb-3 d-flex align-items-center gap-2">
            <FiAlertTriangle />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert bg-success bg-opacity-10 text-success border-0 p-3 rounded mb-3 d-flex align-items-center gap-2">
            <FiCheckCircle />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="auth-input-group mb-3">
            <input
              className="auth-input"
              type="email"
              placeholder="Confirm Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FiMail className="auth-input-icon" />
          </div>

          <div className="auth-input-group mb-4">
            <input
              className="auth-input text-center fs-4 letter-spacing-lg"
              type="text"
              maxLength="6"
              placeholder="------"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ letterSpacing: "8px" }}
            />
          </div>

          <button className="auth-btn w-100 mb-3" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="text-center mb-3">
          <button onClick={handleResend} className="btn btn-link text-decoration-none text-primary small p-0 fw-semibold">
            Resend Verification Code
          </button>
        </div>

        <div className="auth-footer d-flex align-items-center justify-content-center gap-1">
          <button onClick={() => navigate("/login")} className="btn btn-link text-decoration-none text-muted small p-0 d-flex align-items-center gap-1">
            <FiArrowLeft size={14} /> Back to Login
          </button>
        </div>

        <div className="mt-4 p-3 bg-light rounded text-muted" style={{ fontSize: "0.78rem" }}>
          <strong>Note:</strong> If you are testing locally and do not have an SMTP server configured, please check the backend server logs/terminal in your workspace to copy the verification code.
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
