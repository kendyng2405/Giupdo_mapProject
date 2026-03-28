// app.js — MVC2 Entry Point: wires routes to controllers
import { router } from "./controllers/Router.js";
import { AuthController } from "./controllers/AuthController.js";
import { HomeController } from "./controllers/HomeController.js";
import { ProfileController } from "./controllers/ProfileController.js";
import { AdminController } from "./controllers/AdminController.js";

// Register all routes (Front Controller pattern)
router
  .register("/home",    (ctx) => HomeController.show(ctx))
  .register("/login",   (ctx) => AuthController.showLogin(ctx))
  .register("/register",(ctx) => AuthController.showRegister(ctx))
  .register("/forgot-password", (ctx) => AuthController.showForgotPassword(ctx))
  .register("/profile", router.requireAuth((ctx) => ProfileController.show(ctx)))
  .register("/admin/dashboard",          router.requireAdmin((ctx) => AdminController.dashboard(ctx)))
  .register("/admin/locations/new",      router.requireAdmin((ctx) => AdminController.showCreate(ctx)))
  .register("/admin/locations/:id/edit", router.requireAdmin((ctx) => AdminController.showEdit(ctx)));

// Logout handler (global)
document.addEventListener("click", (e) => {
  if (e.target.closest("#logout-btn")) {
    e.preventDefault();
    AuthController.logout();
  }
});

// Start router
router.init();
