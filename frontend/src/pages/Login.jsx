import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi";
import api from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";


const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      // Check if verified. If not verified, redirect to /verify!
      if (res.data.isVerified === false) {
        localStorage.setItem("tempEmail", form.email);
        navigate("/verify", { state: { email: form.email } });
        return;
      }
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/google", {
        credential: response.credential
      });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Google authentication failed.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load GIS script dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-div"),
          { theme: "outline", size: "large", width: 340 }
        );
      }
    };
    document.body.appendChild(script);

    return () => {
      // Clean up the script if component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-wrapper">
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-card">
        <h2 className="auth-title text-center">Welcome Back</h2>
        <p className="auth-subtitle text-center">Sign in to manage your tasks efficiently</p>
        
        {error && (
          <div className="auth-alert">
            <FiAlertTriangle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <input 
              className="auth-input" 
              placeholder="Email address" 
              type="email" 
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
            <FiMail className="auth-input-icon" />
          </div>

          <div className="auth-input-group mb-2">
            <input 
              className="auth-input" 
              placeholder="Password" 
              type={showPassword ? "text" : "password"} 
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
            <FiLock className="auth-input-icon" />
            <button 
              type="button" 
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <div className="text-end mb-3">
            <Link to="/forgot-password" style={{ fontSize: "0.82rem", textDecoration: "none" }} className="text-primary fw-semibold">
              Forgot Password?
            </Link>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" style={{ opacity: 0.15 }} />
          <span className="mx-2 text-muted small">or</span>
          <hr className="flex-grow-1" style={{ opacity: 0.15 }} />
        </div>

        <div className="w-100 d-flex justify-content-center mb-3">
          <div id="google-signin-div"></div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
