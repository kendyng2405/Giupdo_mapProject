// controllers/Router.js — MVC2 Front Controller
import { auth } from "../models/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { UserModel } from "../models/UserModel.js";

class Router {
  constructor() {
    this.routes = {};
    this.currentUser = null;
    this.currentUserData = null;
    this._authReady = false;
    this._authReadyResolve = null;
    this.authReady = new Promise(r => this._authReadyResolve = r);
  }

  register(path, handler) {
    this.routes[path] = handler;
    return this;
  }

  async init() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        try {
          this.currentUserData = await UserModel.findById(user.uid);
        } catch(e) {
          this.currentUserData = null;
        }
      } else {
        this.currentUserData = null;
      }
      this._updateNavbar();
      if (!this._authReady) {
        this._authReady = true;
        this._authReadyResolve();
      } else {
        this._renderCurrent();
      }
    });

    window.addEventListener("hashchange", () => this._renderCurrent());

    await this.authReady;
    this._updateNavbar();
    this._renderCurrent();
  }

  navigate(path) {
    if (window.location.hash === "#" + path) {
      this._renderCurrent();
    } else {
      window.location.hash = path;
    }
  }

  _getCurrentPath() {
    const hash = window.location.hash.replace("#", "") || "/home";
    return hash.startsWith("/") ? hash : "/" + hash;
  }

  async _renderCurrent() {
    const path = this._getCurrentPath();
    let handler = this.routes[path];
    let params = {};

    if (!handler) {
      for (const [route, h] of Object.entries(this.routes)) {
        if (route.includes(":")) {
          const regex = new RegExp("^" + route.replace(/:[^/]+/g, "([^/]+)") + "$");
          const match = path.match(regex);
          if (match) {
            handler = h;
            const keys = [...route.matchAll(/:([^/]+)/g)].map(m => m[1]);
            keys.forEach((k, i) => params[k] = match[i + 1]);
            break;
          }
        }
      }
    }

    if (!handler) {
      const app = document.getElementById("app");
      if (app) app.innerHTML = `<div style="text-align:center;padding:120px 24px;">
        <h1 style="font-family:'Playfair Display',serif;font-size:5rem;color:var(--border);">404</h1>
        <p style="margin-bottom:24px;color:var(--text-muted);">Trang khong tim thay</p>
        <a href="#/home" class="btn btn--primary">Ve ban do</a>
      </div>`;
      return;
    }

    document.querySelectorAll("[data-nav]").forEach(el => {
      el.classList.toggle("active", el.dataset.nav === path);
    });

    await handler({ user: this.currentUser, userData: this.currentUserData, params });
  }

  _updateNavbar() {
    if (typeof window._updateNavbarUser === "function") {
      window._updateNavbarUser(this.currentUserData);
    }
  }

  requireAuth(handler) {
    return async (ctx) => {
      if (!ctx.user) { this.navigate("/login"); return; }
      await handler(ctx);
    };
  }

  requireAdmin(handler) {
    return async (ctx) => {
      if (!ctx.user) { this.navigate("/login"); return; }
      if (ctx.userData?.role !== "admin") { this.navigate("/home"); return; }
      await handler(ctx);
    };
  }
}

export const router = new Router();
