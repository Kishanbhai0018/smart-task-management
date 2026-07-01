import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiCheckCircle, FiAlertTriangle, FiArrowLeft, FiKey } from "react-icons/fi";
import api from "../api/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [step, setStep] = useState(1); // 1 = Request code, 2 = Submit new password
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess("A reset code has been sent to your email. (Check server logs if local)");
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initiate password reset.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      setSuccess("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please verify the code.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-card">
        <h2 className="auth-title text-center">Reset Password</h2>
        <p className="auth-subtitle text-center">
          {step === 1 
            ? "Enter your email to receive a password reset code"
            : "Enter the reset code and choose your new password"}
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

        {step === 1 ? (
          <form onSubmit={handleRequestCode}>
            <div className="auth-input-group mb-4">
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <FiMail className="auth-input-icon" />
            </div>

            <button className="auth-btn w-100 mb-3" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Request Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="auth-input-group mb-3">
              <input
                className="auth-input text-center fs-5"
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit Code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ letterSpacing: "4px" }}
              />
              <FiKey className="auth-input-icon" />
            </div>

            <div className="auth-input-group mb-3">
              <input
                className="auth-input"
                type="password"
                placeholder="New Password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <FiLock className="auth-input-icon" />
            </div>

            <div className="auth-input-group mb-4">
              <input
                className="auth-input"
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <FiLock className="auth-input-icon" />
            </div>

            <button className="auth-btn w-100 mb-3" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Save Password"}
            </button>
          </form>
        )}

        <div className="auth-footer d-flex align-items-center justify-content-center">
          <button onClick={() => navigate("/login")} className="btn btn-link text-decoration-none text-muted small p-0 d-flex align-items-center gap-1">
            <FiArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
