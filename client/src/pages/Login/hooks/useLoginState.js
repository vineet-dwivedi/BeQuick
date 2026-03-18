import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../../../services/auth.jsx";

export const useLoginState = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, register, resendVerification } = useAuth();

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupInfo, setSignupInfo] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginInfo, setLoginInfo] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-panel", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".login-card", { y: 30, opacity: 0, duration: 0.8, delay: 0.1, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleSignup = async () => {
    setSignupError("");
    setSignupInfo("");
    setSignupLoading(true);

    const result = await register({
      user: signupName,
      email: signupEmail,
      password: signupPassword
    });

    setSignupLoading(false);

    if (!result.ok) {
      setSignupError(result.error || "Failed to create account");
      return;
    }

    const normalizedEmail = signupEmail.trim().toLowerCase();
    setSignupInfo(result.message);
    setLoginEmail(normalizedEmail);
    setLoginInfo("Verify your email first, then log in here.");
    setNeedsVerification(true);
    setSignupPassword("");
  };

  const handleLogin = async () => {
    setLoginError("");
    setLoginInfo("");
    setNeedsVerification(false);
    setLoginLoading(true);

    const result = await login({
      email: loginEmail,
      password: loginPassword
    });

    setLoginLoading(false);

    if (!result.ok) {
      setLoginError(result.error || "Login failed");
      setNeedsVerification(Boolean(result.requiresVerification));
      if (result.requiresVerification) {
        setLoginInfo("Open the verification link from your inbox, or resend it below.");
      }
      return;
    }

    const fallback = result.user?.role === "admin" ? "/admin" : "/";
    const intended = location.state?.from?.pathname;
    const target = intended && intended !== "/login" ? intended : fallback;
    navigate(target, { replace: true });
  };

  const handleResendVerification = async () => {
    const emailToUse = loginEmail || signupEmail;
    setLoginError("");
    setLoginInfo("");
    setResendLoading(true);

    const result = await resendVerification(emailToUse);
    setResendLoading(false);

    if (!result.ok) {
      setLoginError(result.error || "Failed to resend verification email");
      return;
    }

    setLoginInfo(result.message);
  };

  const handleResetLogin = async () => {
    setLoginPassword("");
    setLoginError("");
    setLoginInfo("");
    setNeedsVerification(false);
    await logout();
  };

  return {
    pageRef,
    signup: {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      loading: signupLoading,
      error: signupError,
      info: signupInfo,
      setName: setSignupName,
      setEmail: setSignupEmail,
      setPassword: setSignupPassword,
      submit: handleSignup
    },
    signin: {
      email: loginEmail,
      password: loginPassword,
      loading: loginLoading,
      error: loginError,
      info: loginInfo,
      needsVerification,
      resendLoading,
      setEmail: setLoginEmail,
      setPassword: setLoginPassword,
      submit: handleLogin,
      resendVerification: handleResendVerification,
      reset: handleResetLogin
    }
  };
};
