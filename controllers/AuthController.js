// controllers/AuthController.js
import { auth } from "../models/firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { UserModel } from "../models/UserModel.js";
import { router } from "./Router.js";
import { renderView } from "../views/ViewEngine.js";
import { Toast } from "../views/components/Toast.js";

export const AuthController = {
  async showLogin({ user }) {
    if (user) { router.navigate("/home"); return; }
    renderView("login");
    await _nextTick();
    const form = document.getElementById("login-form");
    if (!form) { console.error("login-form not found"); return; }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const email = form.querySelector("[name=email]")?.value?.trim();
      const password = form.querySelector("[name=password]")?.value;
      if (!email || !password) { Toast.show("Vui long dien day du thong tin.", "error"); return; }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Dang dang nhap...';
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.navigate("/home");
        Toast.show("Chao mung tro lai!");
      } catch (err) {
        console.error("Login error:", err.code, err.message);
        let msg = "Dang nhap that bai.";
        if (["auth/wrong-password","auth/user-not-found","auth/invalid-credential","auth/invalid-email"].includes(err.code))
          msg = "Email hoac mat khau khong dung.";
        else if (err.code === "auth/too-many-requests") msg = "Qua nhieu lan thu. Thu lai sau.";
        else if (err.code === "auth/network-request-failed") msg = "Loi mang. Kiem tra ket noi.";
        Toast.show(msg, "error");
        btn.disabled = false; btn.textContent = "Dang nhap";
      }
    });
  },

  async showRegister({ user }) {
    if (user) { router.navigate("/home"); return; }
    renderView("register");
    await _nextTick();
    const form = document.getElementById("register-form");
    if (!form) { console.error("register-form not found"); return; }
    form.querySelector("[name=password]")?.addEventListener("input", function() {
      const v = this.value;
      const score = [v.length>=6,v.length>=10,/[A-Z]/.test(v),/[0-9]/.test(v),/[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;
      const fill = document.getElementById("pwd-bar-fill");
      const colors = ["#EF4444","#F97316","#EAB308","#10B981","#22C55E"];
      if (fill) { fill.style.width=(score*20)+"%"; fill.style.background=colors[score-1]||"transparent"; }
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const fullName = form.querySelector("[name=fullName]")?.value?.trim();
      const phone    = form.querySelector("[name=phone]")?.value?.trim();
      const email    = form.querySelector("[name=email]")?.value?.trim();
      const password = form.querySelector("[name=password]")?.value;
      if (!fullName || !phone || !email || !password) { Toast.show("Vui long dien day du thong tin.", "error"); return; }
      if (password.length < 6) { Toast.show("Mat khau phai co it nhat 6 ky tu.", "error"); return; }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Dang tao tai khoan...';
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: fullName });
        await UserModel.create(cred.user.uid, { email, fullName, phone });
        sendEmailVerification(cred.user).catch(() => {});
        router.navigate("/home");
        Toast.show("Tao tai khoan thanh cong!");
      } catch (err) {
        console.error("Register error:", err.code, err.message);
        let msg = "Dang ky that bai.";
        if (err.code === "auth/email-already-in-use") msg = "Email nay da duoc su dung.";
        else if (err.code === "auth/invalid-email")   msg = "Email khong hop le.";
        else if (err.code === "auth/weak-password")   msg = "Mat khau qua yeu.";
        else if (err.code === "auth/network-request-failed") msg = "Loi mang.";
        Toast.show(msg, "error");
        btn.disabled = false; btn.textContent = "Tao tai khoan";
      }
    });
  },

  async showForgotPassword({ user }) {
    if (user) { router.navigate("/home"); return; }
    renderView("forgot-password");
    await _nextTick();
    const form = document.getElementById("forgot-form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("[type=submit]");
      const email = form.querySelector("[name=email]")?.value?.trim();
      if (!email) { Toast.show("Vui long nhap email.", "error"); return; }
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Dang gui...';
      try {
        await sendPasswordResetEmail(auth, email);
        Toast.show("Email dat lai mat khau da duoc gui!");
        form.reset();
      } catch (err) {
        Toast.show("Khong the gui email. Kiem tra lai dia chi.", "error");
      } finally {
        btn.disabled = false; btn.textContent = "Gui email dat lai";
      }
    });
  },

  async logout() {
    await signOut(auth).catch(console.error);
    router.navigate("/home");
    Toast.show("Da dang xuat.");
  },
};

function _nextTick() {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
}
