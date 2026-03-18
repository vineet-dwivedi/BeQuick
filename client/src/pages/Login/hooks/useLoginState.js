import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useAuth } from "../../../services/auth.jsx";
import { ADMIN_EMAIL } from "../state/loginConstants.js";

export const useLoginState = () => {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, requestOtp, logout } = useAuth();

  const [adminStep, setAdminStep] = useState("email");
  const [adminCode, setAdminCode] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminInfo, setAdminInfo] = useState("");

  const [userStep, setUserStep] = useState("email");
  const [userEmail, setUserEmail] = useState("");
  const [userCode, setUserCode] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userInfo, setUserInfo] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".login-panel", { y: 24, opacity: 0, duration: 0.7 });
      gsap.from(".login-card", { y: 30, opacity: 0, duration: 0.8, delay: 0.1, stagger: 0.1 });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const resetAdmin = () => {
    setAdminStep("email");
    setAdminCode("");
    setAdminError("");
    setAdminInfo("");
  };

  const resetUser = () => {
    setUserStep("email");
    setUserCode("");
    setUserError("");
    setUserInfo("");
  };

  const handleAdminRequestOtp = async () => {
    setAdminError("");
    setAdminInfo("");
    setAdminLoading(true);

    const result = await requestOtp(ADMIN_EMAIL);
    setAdminLoading(false);

    if (!result.ok) {
      setAdminError(result.error || "Failed to send OTP");
      return;
    }

    setAdminStep("code");
    setAdminInfo(result.cooldown ? "OTP already sent. Check your inbox." : result.message);
  };

  const handleAdminVerifyOtp = async () => {
    setAdminError("");
    setAdminInfo("");
    setAdminLoading(true);

    const result = await verifyOtp(ADMIN_EMAIL, adminCode);
    setAdminLoading(false);

    if (!result.ok) {
      setAdminError(result.error || "OTP verification failed");
      return;
    }

    if (result.user?.role !== "admin") {
      setAdminError("This email is not configured as admin.");
      await logout();
      return;
    }

    navigate("/admin", { replace: true });
  };

  const handleUserRequestOtp = async () => {
    const normalized = userEmail.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
      setUserError("Use the admin login section for this email.");
      return;
    }

    setUserError("");
    setUserInfo("");
    setUserLoading(true);

    const result = await requestOtp(userEmail);
    setUserLoading(false);

    if (!result.ok) {
      setUserError(result.error || "Failed to send OTP");
      return;
    }

    setUserStep("code");
    setUserInfo(result.cooldown ? "OTP already sent. Check your inbox." : result.message);
  };

  const handleUserVerifyOtp = async () => {
    const normalized = userEmail.trim().toLowerCase();
    if (normalized === ADMIN_EMAIL) {
      setUserError("Use the admin login section for this email.");
      return;
    }

    setUserError("");
    setUserInfo("");
    setUserLoading(true);

    const result = await verifyOtp(userEmail, userCode);
    setUserLoading(false);

    if (!result.ok) {
      setUserError(result.error || "OTP verification failed");
      return;
    }

    const fallback = result.user?.role === "admin" ? "/admin" : "/";
    const intended = location.state?.from?.pathname;
    const target = intended && intended !== "/login" ? intended : fallback;
    navigate(target, { replace: true });
  };

  return {
    pageRef,
    adminEmail: ADMIN_EMAIL,
    admin: {
      step: adminStep,
      code: adminCode,
      loading: adminLoading,
      error: adminError,
      info: adminInfo,
      setCode: setAdminCode,
      requestOtp: handleAdminRequestOtp,
      verifyOtp: handleAdminVerifyOtp,
      reset: resetAdmin
    },
    user: {
      step: userStep,
      email: userEmail,
      code: userCode,
      loading: userLoading,
      error: userError,
      info: userInfo,
      setEmail: setUserEmail,
      setCode: setUserCode,
      requestOtp: handleUserRequestOtp,
      verifyOtp: handleUserVerifyOtp,
      reset: resetUser
    }
  };
};
