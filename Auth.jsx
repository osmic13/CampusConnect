import { useEffect, useState } from "react";
import {
    Lock,
    Mail,
    User,
    Eye,
    EyeOff,
    ArrowRight,
    RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DEFAULT_PASSWORD = "Geu2026";
const DEMO_COLLEGE_ID = "123456";
const API_URL = "http://localhost:5000/api";

function getStoredPassword() {
    return localStorage.getItem("cc_password") || DEFAULT_PASSWORD;
}

function getStoredId() {
    return localStorage.getItem("cc_college_id") || DEMO_COLLEGE_ID;
}

export default function Auth({ initialMode = "login" }) {
    const navigate = useNavigate();

    const [mode, setMode] = useState(initialMode);
    const [collegeId, setCollegeId] = useState(
        () => localStorage.getItem("cc_remembered_id") || ""
    );
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [resetToken, setResetToken] = useState("");

    useEffect(() => {
        setMode(initialMode);
        setError("");
        setMessage("");
    }, [initialMode]);

    const goHome = () => {
        const user = JSON.parse(
            localStorage.getItem("cc_user")
        );

        if (user?.role === "ADMIN") {
            navigate("/admin/dashboard", {
                replace: true
            });
        } else {
            navigate("/home", {
                replace: true
            });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!collegeId.trim()) {
            setError("College ID can't be empty");
            return;
        }

        if (!/^\d+$/.test(collegeId)) {
            setError("College ID must contain numbers only");
            return;
        }

        if (!password) {
            setError("Password can't be empty");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        collegeId,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            }

            localStorage.setItem(
                "cc_token",
                data.token
            );

            localStorage.setItem(
                "cc_user",
                JSON.stringify(data.user)
            );

            if (remember) {
                localStorage.setItem(
                    "cc_remembered_id",
                    collegeId
                );
            } else {
                localStorage.removeItem(
                    "cc_remembered_id"
                );
            }

            if (data.user.firstLogin) {
                setMode("change");
                setPassword("");
                return;
            }

            goHome();

        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to CampusConnect server"
            );
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!newPassword) {
            setError("New password can't be empty");
            return;
        }

        if (!confirmPassword) {
            setError("Confirm password can't be empty");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const token = localStorage.getItem(
                "cc_token"
            );

            const response = await fetch(
                `${API_URL}/auth/change-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        newPassword,
                        confirmPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Password change failed"
                );
                return;
            }

            setNewPassword("");
            setConfirmPassword("");

            setMessage(
                "Password changed successfully"
            );

            setTimeout(() => {
                goHome();
            }, 500);

        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to CampusConnect server"
            );
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!collegeId.trim()) {
            setError("College ID can't be empty");
            return;
        }

        if (!/^\d+$/.test(collegeId)) {
            setError("College ID must contain numbers only");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        collegeId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Unable to send OTP"
                );
                return;
            }

            setOtpSent(true);
            setOtp("");

            setMessage(
                "An OTP has been sent to your registered college email"
            );

        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to CampusConnect server"
            );
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!otp) {
            setError("OTP can't be empty");
            return;
        }

        if (!/^\d{5}$/.test(otp)) {
            setError("OTP must be 5 digits");
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/auth/verify-otp`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        collegeId,
                        otp
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "OTP verification failed"
                );
                return;
            }

            setResetToken(data.resetToken);

            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage("");

            setMode("reset");

        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to CampusConnect server"
            );
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        const formData = new FormData(
            e.currentTarget
        );

        console.log("FORM DATA:");

        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const newPasswordValue =
            formData.get("newPassword")?.toString() ||
            "";

        const confirmPasswordValue =
            formData.get("confirmPassword")?.toString() ||
            "";

        if (!newPasswordValue) {
            setError("New password is required");
            return;
        }

        if (!confirmPasswordValue) {
            setError(
                "Confirm password is required"
            );
            return;
        }

        if (
            newPasswordValue !==
            confirmPasswordValue
        ) {
            setError("Passwords do not match");
            return;
        }

        if (!resetToken) {
            setError(
                "Password reset session has expired"
            );
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        resetToken,
                        newPassword: newPasswordValue,
                        confirmPassword:
                            confirmPasswordValue
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                        "Password reset failed"
                );
                return;
            }

            setNewPassword("");
            setConfirmPassword("");
            setResetToken("");

            setMessage(
                "Password reset successfully"
            );

            setTimeout(() => {
                setMode("login");
                setMessage("");
                setCollegeId("");
            }, 1000);

        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to CampusConnect server"
            );
        }
    };

    const resendOtp = () => {
        setError("");
        setOtp("");
        setOtpSent(true);

        setMessage(
            "A new OTP has been sent to your registered college email"
        );
    };

    return (
        <div className="auth-screen">
            <div className="auth-image">
                <div className="auth-image-overlay" />

                <div className="auth-branding">
                    <div className="auth-brand-title">
                        CampusConnect
                    </div>

                    <div className="auth-brand-tagline">
                        YOUR CAMPUS. ONE PLACE.
                    </div>
                </div>

                <div className="auth-image-footer">
                    <span>
                        LEARN&nbsp;&nbsp;|&nbsp;&nbsp;CONNECT&nbsp;&nbsp;|&nbsp;&nbsp;GROW
                    </span>
                </div>
            </div>

            <div className="auth-panel">
                <div className="auth-form-wrap">

                    {mode === "login" && (
                        <LoginForm
                            collegeId={collegeId}
                            setCollegeId={setCollegeId}
                            password={password}
                            setPassword={setPassword}
                            showPassword={showPassword}
                            setShowPassword={
                                setShowPassword
                            }
                            remember={remember}
                            setRemember={setRemember}
                            error={error}
                            onSubmit={handleLogin}
                            onForgot={() => {
                                setMode("forgot");
                                setError("");
                                setMessage("");
                            }}
                        />
                    )}

                    {mode === "forgot" && (
                        <OtpForm
                            collegeId={collegeId}
                            setCollegeId={setCollegeId}
                            otp={otp}
                            setOtp={setOtp}
                            otpSent={otpSent}
                            message={message}
                            error={error}
                            onSend={handleForgot}
                            onVerify={handleVerifyOtp}
                            onResend={resendOtp}
                            onBack={() => {
                                setMode("login");
                                setError("");
                                setMessage("");
                            }}
                        />
                    )}

                    {mode === "change" && (
                        <ChangePasswordForm
                            newPassword={newPassword}
                            setNewPassword={
                                setNewPassword
                            }
                            confirmPassword={
                                confirmPassword
                            }
                            setConfirmPassword={
                                setConfirmPassword
                            }
                            showNewPassword={
                                showNewPassword
                            }
                            setShowNewPassword={
                                setShowNewPassword
                            }
                            showConfirmPassword={
                                showConfirmPassword
                            }
                            setShowConfirmPassword={
                                setShowConfirmPassword
                            }
                            error={error}
                            message={message}
                            onSubmit={
                                handleChangePassword
                            }
                        />
                    )}

                    {mode === "reset" && (
                        <ResetPasswordForm
                            showNewPassword={
                                showNewPassword
                            }
                            setShowNewPassword={
                                setShowNewPassword
                            }
                            showConfirmPassword={
                                showConfirmPassword
                            }
                            setShowConfirmPassword={
                                setShowConfirmPassword
                            }
                            error={error}
                            message={message}
                            onSubmit={
                                handleResetPassword
                            }
                        />
                    )}

                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    icon: Icon,
    type = "text",
    value,
    onChange,
    placeholder,
    right,
    inputMode,
    maxLength,
    name
}) {
    return (
        <label className="auth-field">
            <span>{label}</span>

            <div className="auth-input-wrap">
                <Icon size={19} />

                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="off"
                    inputMode={inputMode}
                    maxLength={maxLength}
                />

                {right}
            </div>
        </label>
    );
}

function PasswordField({
    label,
    name,
    value,
    onChange,
    show,
    setShow,
    placeholder
}) {
    return (
        <Field
            label={label}
            name={name}
            icon={Lock}
            type={show ? "text" : "password"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            right={
                <button
                    type="button"
                    className="input-action"
                    onClick={() =>
                        setShow(!show)
                    }
                    aria-label={
                        show
                            ? "Hide password"
                            : "Show password"
                    }
                >
                    {show ? (
                        <EyeOff size={19} />
                    ) : (
                        <Eye size={19} />
                    )}
                </button>
            }
        />
    );
}

function FormStatus({ error, message }) {
    if (!error && !message) {
        return null;
    }

    return (
        <div
            className={
                error
                    ? "form-status error"
                    : "form-status success"
            }
        >
            {error || message}
        </div>
    );
}

function LoginForm({
    collegeId,
    setCollegeId,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    remember,
    setRemember,
    error,
    onSubmit,
    onForgot
}) {
    return (
        <form onSubmit={onSubmit}>
            <div className="auth-heading">
                <h1>Welcome back</h1>
                <p>Sign in to CampusConnect</p>
                <small>Your campus. One place.</small>
            </div>

            <Field
                label="College ID"
                icon={User}
                value={collegeId}
                onChange={(e) =>
                    setCollegeId(
                        e.target.value.replace(
                            /\D/g,
                            ""
                        )
                    )
                }
                placeholder="Enter your college ID"
                inputMode="numeric"
            />

            <PasswordField
                label="Password"
                value={password}
                onChange={(e) =>
                    setPassword(e.target.value)
                }
                show={showPassword}
                setShow={setShowPassword}
                placeholder="Enter your password"
            />

            <FormStatus error={error} />

            <div className="auth-options">
                <label className="remember">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) =>
                            setRemember(
                                e.target.checked
                            )
                        }
                    />

                    <span>Remember me</span>
                </label>

                <button
                    type="button"
                    className="text-button"
                    onClick={onForgot}
                >
                    Forgot password?
                </button>
            </div>

            <button
                className="auth-button"
                type="submit"
            >
                Sign In
                <ArrowRight size={19} />
            </button>
        </form>
    );
}

function ChangePasswordForm({
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    message,
    onSubmit
}) {
    return (
        <form onSubmit={onSubmit}>
            <div className="auth-heading">
                <h1>Change your password</h1>
                <p>
                    Create a new password to continue.
                </p>
            </div>

            <PasswordField
                label="New Password"
                value={newPassword}
                onChange={(e) =>
                    setNewPassword(e.target.value)
                }
                show={showNewPassword}
                setShow={setShowNewPassword}
                placeholder="Enter new password"
            />

            <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) =>
                    setConfirmPassword(
                        e.target.value
                    )
                }
                show={showConfirmPassword}
                setShow={setShowConfirmPassword}
                placeholder="Confirm your password"
            />

            <FormStatus
                error={error}
                message={message}
            />

            <button
                className="auth-button"
                type="submit"
            >
                Change Password
                <ArrowRight size={19} />
            </button>
        </form>
    );
}

function ResetPasswordForm({
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    error,
    message,
    onSubmit
}) {
    return (
        <form onSubmit={onSubmit}>
            <div className="auth-heading">
                <h1>Reset your password</h1>
                <p>
                    Create a new password for your
                    account.
                </p>
            </div>

            <label className="auth-field">
                <span>New Password</span>

                <div className="auth-input-wrap">
                    <Lock size={19} />

                    <input
                        type={
                            showNewPassword
                                ? "text"
                                : "password"
                        }
                        name="newPassword"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                    />

                    <button
                        type="button"
                        className="input-action"
                        onClick={() =>
                            setShowNewPassword(
                                !showNewPassword
                            )
                        }
                    >
                        {showNewPassword ? (
                            <EyeOff size={19} />
                        ) : (
                            <Eye size={19} />
                        )}
                    </button>
                </div>
            </label>

            <label className="auth-field">
                <span>Confirm Password</span>

                <div className="auth-input-wrap">
                    <Lock size={19} />

                    <input
                        type={
                            showConfirmPassword
                                ? "text"
                                : "password"
                        }
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                    />

                    <button
                        type="button"
                        className="input-action"
                        onClick={() =>
                            setShowConfirmPassword(
                                !showConfirmPassword
                            )
                        }
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={19} />
                        ) : (
                            <Eye size={19} />
                        )}
                    </button>
                </div>
            </label>

            <FormStatus
                error={error}
                message={message}
            />

            <button
                className="auth-button"
                type="submit"
            >
                Reset Password
                <ArrowRight size={19} />
            </button>
        </form>
    );
}

function OtpForm({
    collegeId,
    setCollegeId,
    otp,
    setOtp,
    otpSent,
    message,
    error,
    onSend,
    onVerify,
    onResend,
    onBack
}) {
    return (
        <form onSubmit={otpSent ? onVerify : onSend}>
            <div className="auth-heading">
                <h1>Forgot password?</h1>
                <p>
                    Verify your college account to
                    continue.
                </p>
            </div>

            <Field
                label="College ID"
                icon={User}
                value={collegeId}
                onChange={(e) =>
                    setCollegeId(
                        e.target.value.replace(
                            /\D/g,
                            ""
                        )
                    )
                }
                placeholder="Enter your college ID"
                inputMode="numeric"
            />

            {!otpSent ? (
                <>
                    <p className="otp-note">
                        We'll send a 5-digit OTP to
                        your registered college email
                        address.
                    </p>

                    <FormStatus error={error} />

                    <button
                        className="auth-button"
                        type="submit"
                    >
                        Send OTP
                        <ArrowRight size={19} />
                    </button>
                </>
            ) : (
                <>
                    <div className="otp-message">
                        <Mail size={18} />

                        <span>
                            {message ||
                                "An OTP has been sent to your registered college email"}
                        </span>
                    </div>

                    <label className="auth-field otp-field">
                        <span>5-Digit OTP</span>

                        <div className="auth-input-wrap otp-input-wrap">
                            <input
                                autoFocus
                                type="text"
                                value={otp}
                                onChange={(e) =>
                                    setOtp(
                                        e.target.value
                                            .replace(
                                                /\D/g,
                                                ""
                                            )
                                            .slice(
                                                0,
                                                5
                                            )
                                    )
                                }
                                placeholder="Enter 5-digit OTP"
                                inputMode="numeric"
                                maxLength={5}
                            />
                        </div>
                    </label>

                    <FormStatus error={error} />

                    <button
                        className="auth-button"
                        type="submit"
                    >
                        Verify
                        <ArrowRight size={19} />
                    </button>

                    <button
                        type="button"
                        className="resend-button"
                        onClick={onResend}
                    >
                        <RotateCcw size={15} />
                        Resend OTP
                    </button>
                </>
            )}

            <button
                type="button"
                className="back-button"
                onClick={onBack}
            >
                ← Back to sign in
            </button>
        </form>
    );
}