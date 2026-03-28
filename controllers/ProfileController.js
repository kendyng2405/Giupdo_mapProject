// controllers/ProfileController.js
import { UserModel, RANKS } from "../models/UserModel.js";
import { renderView } from "../views/ViewEngine.js";
import { Toast } from "../views/components/Toast.js";
import { router } from "./Router.js";

export const ProfileController = {
  async show({ user, userData }) {
    if (!user) { router.navigate("/login"); return; }
    const leaderboard = await UserModel.getLeaderboard(10);
    const myRank = leaderboard.findIndex(u => u.uid === user.uid) + 1;
    renderView("profile", { user, userData, leaderboard, myRank, ranks: RANKS });
    _initProfileForm(user, userData);
  },
};

function _initProfileForm(user, userData) {
  // Update profile
  document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("[type=submit]");
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
    try {
      const fullName = e.target.fullName.value;
      const phone = e.target.phone.value;
      await UserModel.updateProfile(user.uid, { fullName, phone });
      Toast.show("Da cap nhat ho so!");
      router.navigate("/profile");
    } catch { Toast.show("Loi cap nhat.", "error"); }
    finally { btn.disabled = false; btn.textContent = "Luu thay doi"; }
  });

  // Change email
  document.getElementById("email-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("[type=submit]");
    btn.disabled = true;
    try {
      const newEmail = e.target.newEmail.value;
      await UserModel.changeEmail(newEmail);
      await UserModel.update(user.uid, { email: newEmail });
      Toast.show("Email da cap nhat. Vui long xac thuc email moi.");
    } catch (err) {
      let msg = "Loi doi email.";
      if (err.code === "auth/email-already-in-use") msg = "Email nay da duoc su dung.";
      if (err.code === "auth/requires-recent-login") msg = "Can dang nhap lai de doi email.";
      Toast.show(msg, "error");
    }
    finally { btn.disabled = false; btn.textContent = "Cap nhat email"; }
  });
}
