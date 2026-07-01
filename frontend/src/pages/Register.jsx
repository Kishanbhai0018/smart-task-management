import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertTriangle } from "react-icons/fi";
import api from "../api/axiosInstance";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      localStorage.setItem("tempEmail", form.email);
      navigate("/verify", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-blob auth-blob-1"></div>
      <div className="auth-blob auth-blob-2"></div>
      <div className="auth-card">
        <h2 className="auth-title text-center">Create Account</h2>
        <p className="auth-subtitle text-center">Join us and start organizing your tasks</p>
        
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
              placeholder="Full Name" 
              type="text" 
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
            />
            <FiUser className="auth-input-icon" />
          </div>

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

          <div className="auth-input-group">
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

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                <span>Creating account...</span>
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
