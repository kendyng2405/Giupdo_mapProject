// controllers/AuthController.js
import { auth } from "../models/firebase.js";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail, sendEmailVerification, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { UserModel } from "../models/UserModel.js";
import { router } from "./Router.js";
import { renderView } from "../views/ViewEngine.js";
import { Toast } from "../views/components/Toast.js";

export const AuthController = {
  async showLogin({ user }) {
    if (user) { router.navigate("/home"); return; }
    renderView("login");
    document.getElementById("app").addEventListener("submit", async (e) => {
      if (e.target.id !== "login-form") return;
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const email = e.target.email.value;
      const password = e.target.password.value;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang đăng nhập...';
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.navigate("/home");
        Toast.show("Chào mừng trở lại!");
      } catch (err) {
        let msg = "Đăng nhập thất bại.";
        if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") msg = "Email hoặc mật khẩu không đúng.";
        if (err.code === "auth/too-many-requests") msg = "Quá nhiều lần thử. Vui lòng thử lại sau.";
        Toast.show(msg, "error");
        btn.disabled = false; btn.textContent = "Đăng nhập";
      }
    }, { once: true });
  },

  async showRegister({ user }) {
    if (user) { router.navigate("/home"); return; }
    renderView("register");
    document.getElementById("app").addEventListener("submit", async (e) => {
      if (e.target.id !== "register-form") return;
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const { email, password, fullName, phone } = Object.fromEntries(new FormData(e.target));
      if (password.length < 6) { Toast.show("Mật khẩu phải có ít nhất 6 ký tự.", "error"); return; }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang tạo tài khoản...';
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: fullName });
        await sendEmailVerification(cred.user);
        await UserModel.create(cred.user.uid, { email, fullName, phone });
        router.navigate("/home");
        Toast.show("Tạo tài khoản thành công! Vui lòng xác thực email.");
      } catch (err) {
        let msg = "Đăng ký thất bại.";
        if (err.code === "auth/email-already-in-use") msg = "Email đã được sử dụng.";
        Toast.show(msg, "error");
        btn.disabled = false; btn.textContent = "Tạo tài khoản";
      }
    }, { once: true });
  },

  async showForgotPassword() {
    renderView("forgot-password");
    document.getElementById("app").addEventListener("submit", async (e) => {
      if (e.target.id !== "forgot-form") return;
      e.preventDefault();
      const btn = e.target.querySelector("[type=submit]");
      const email = e.target.email.value;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Đang gửi...';
      try {
        await sendPasswordResetEmail(auth, email);
        Toast.show("Email đặt lại mật khẩu đã được gửi. Kiểm tra hộp thư của bạn.");
        e.target.reset();
      } catch {
        Toast.show("Không thể gửi email. Kiểm tra lại địa chỉ.", "error");
      } finally {
        btn.disabled = false; btn.textContent = "Gửi email đặt lại";
      }
    }, { once: true });
  },

  async logout() {
    await signOut(auth);
    router.navigate("/home");
    Toast.show("Đã đăng xuất.");
  },
};
