import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Shield, ArrowRight, Circle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(username, password);
            if (result.success) {
                const user = JSON.parse(localStorage.getItem('user'));
                toast.success(`Welcome back, ${user.username}!`);
                setTimeout(() => {
                    if (user.role === 'admin') navigate('/admin');
                    else navigate('/dashboard');
                }, 500);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="login-card-minimal"
            >
                <div className="login-form-section">
                    <div className="login-brand">
                        <div className="brand-logo">
                            <Shield size={22} />
                        </div>
                        <h1 className="brand-name">EMS PRO</h1>
                    </div>

                    <div className="login-intro">
                        <h2>Welcome back</h2>
                        <p>Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="minimal-form">
                        <div className="form-group-rounded">
                            <label>Username</label>
                            <div className="input-with-icon">
                                <User className="icon-left" size={18} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-rounded">
                            <label>Password</label>
                            <div className="input-with-icon">
                                <Lock className="icon-left" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="icon-right-toggle"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-actions-minimal">
                            <label className="checkbox-custom">
                                <input type="checkbox" />
                                <span>Stay logged in</span>
                            </label>
                            <a href="#" className="link-minimal">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className={`btn-minimal ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-small"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-help">
                        <span>Need help?</span>
                        <a href="#">Contact Support</a>
                    </div>
                </div>

                <div className="login-visual-section">
                    <div className="visual-content">
                        <h3>Powering Team Operations</h3>
                        <p>Streamline attendance, leaves, and employee directory in one unified management ecosystem.</p>

                        <div className="visual-features">
                            <div className="v-feature">
                                <div className="v-icon"><Circle size={8} fill="currentColor" /></div>
                                <span>Real-time tracking</span>
                            </div>
                            <div className="v-feature">
                                <div className="v-icon"><Circle size={8} fill="currentColor" /></div>
                                <span>Policy management</span>
                            </div>
                        </div>
                    </div>

                    <div className="visual-image-container">
                        <img src="/src/assets/team-visual.png" alt="Team working" className="team-image" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;

