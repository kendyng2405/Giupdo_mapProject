// controllers/Router.js — MVC2 Front Controller: URL routing
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
    // Watch auth state
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        try { this.currentUserData = await UserModel.findById(user.uid); } catch(e) {}
      } else {
        this.currentUserData = null;
      }
      if (!this._authReady) {
        this._authReady = true;
        this._authReadyResolve();
      }
      // Re-render current route on auth change
      this._renderCurrent();
      // Update navbar
      this._updateNavbar();
    });

    // Hash-based routing
    window.addEventListener("hashchange", () => this._renderCurrent());
    window.addEventListener("popstate", () => this._renderCurrent());

    await this.authReady;
    this._renderCurrent();
  }

  navigate(path) {
    window.location.hash = path;
  }

  _getCurrentPath() {
    const hash = window.location.hash.replace("#", "") || "/home";
    return hash.startsWith("/") ? hash : "/" + hash;
  }

  async _renderCurrent() {
    const path = this._getCurrentPath();
    // Match exact or dynamic (e.g. /location/:id)
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

    if (!handler) handler = this.routes["/404"] || (() => {
      document.getElementById("app").innerHTML = `<div class="not-found"><h1>404</h1><p>Trang không tìm thấy</p><a href="#/home" class="btn btn--primary">Về trang chủ</a></div>`;
    });

    // Update active nav links
    document.querySelectorAll("[data-nav]").forEach(el => {
      el.classList.toggle("active", el.dataset.nav === path || (path === "/home" && el.dataset.nav === "/home"));
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
