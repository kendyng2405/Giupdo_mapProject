// controllers/HomeController.js
import { LocationModel } from "../models/LocationModel.js";
import { UserModel } from "../models/UserModel.js";
import { renderView } from "../views/ViewEngine.js";
import { Toast } from "../views/components/Toast.js";

let mapInstance = null;
let markersLayer = [];

export const HomeController = {
  async show({ user, userData }) {
    renderView("home", { user, userData });
    try {
      const [locations, leaderboard] = await Promise.all([
        LocationModel.findAll(true),
        UserModel.getLeaderboard(5),
      ]);
      _initFilterAndLocate();
      _initMapWhenReady(locations, user, userData);
    } catch (err) {
      console.error("HomeController error:", err);
      Toast.show("Lỗi tải dữ liệu bản đồ.", "error");
    }
  },
};

function _initFilterAndLocate() {
  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      if (!mapInstance) return;
      markersLayer.forEach(({ marker, loc }) => {
        const show = f === "all" || loc.urgency === f;
        show ? marker.addTo(mapInstance) : mapInstance.removeLayer(marker);
      });
    });
  });

  document.getElementById("locate-btn")?.addEventListener("click", () => {
    if (!navigator.geolocation) { Toast.show("Trình duyệt không hỗ trợ định vị.", "error"); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      if (!mapInstance) return;
      mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
      L.circle([pos.coords.latitude, pos.coords.longitude], { radius: 150, color: "#C0392B", fillOpacity: 0.15 }).addTo(mapInstance);
    }, () => Toast.show("Không thể lấy vị trí.", "error"));
  });
}

function _initMapWhenReady(locations, user, userData) {
  // Đợi DOM render xong
  requestAnimationFrame(() => {
    setTimeout(() => {
      const mapEl = document.getElementById("map");
      if (!mapEl) {
        // Thử lại lần nữa sau 200ms
        setTimeout(() => _initMapWhenReady(locations, user, userData), 200);
        return;
      }
      if (typeof L === "undefined") {
        Toast.show("Lỗi tải bản đồ. Vui lòng tải lại trang.", "error");
        return;
      }

      // Cleanup instance cũ
      if (mapInstance) {
        try { mapInstance.off(); mapInstance.remove(); } catch(e) {}
        mapInstance = null;
        markersLayer = [];
      }

      // Khởi tạo Leaflet
      mapInstance = L.map(mapEl, {
        center: [16.047079, 108.206230],
        zoom: 6,
        zoomControl: false,
        preferCanvas: true,
      });

      L.control.zoom({ position: "topright" }).addTo(mapInstance);

      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      L.tileLayer(
  isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }
).addTo(mapInstance);

      mapInstance.invalidateSize();

      // Vẽ markers
      markersLayer = [];
      _plotMarkers(locations, user, userData);

      // Cập nhật badge số địa điểm
      const badge = document.getElementById("map-count-badge");
      if (badge) badge.textContent = `${locations.length} địa điểm`;

      // Zoom về vùng có markers
      if (locations.length > 0 && markersLayer.length > 0) {
        try {
          const group = L.featureGroup(markersLayer.map(m => m.marker));
          if (group.getBounds().isValid()) mapInstance.fitBounds(group.getBounds().pad(0.3));
        } catch(e) {}
      }
    }, 100);
  });
}

function _plotMarkers(locations, user, userData) {
  if (!mapInstance) return;
  const urgencyColors = { normal: "#22C55E", urgent: "#EAB308", critical: "#EF4444" };
  const sidebar = document.getElementById("map-sidebar");

  locations.forEach(loc => {
    const color = urgencyColors[loc.urgency] || "#22C55E";
    const svg = `<svg width="34" height="42" viewBox="0 0 34 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 2C10.4 2 5 7.4 5 14c0 9.5 12 28 12 28s12-18.5 12-28C29 7.4 23.6 2 17 2z"
        fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="17" cy="14" r="5.5" fill="white" opacity="0.92"/>
      ${loc.urgency === "critical" ? `<circle cx="17" cy="14" r="2.5" fill="${color}"/>` : ""}
    </svg>`;
    const icon = L.divIcon({ html: svg, className: "", iconSize: [34, 42], iconAnchor: [17, 42] });
    const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(mapInstance);
    marker.on("click", e => {
      L.DomEvent.stopPropagation(e);
      _openSidebar(loc, user, userData, sidebar);
    });
    markersLayer.push({ marker, loc });
  });

  mapInstance.on("click", () => sidebar?.classList.remove("open"));
}

function _openSidebar(loc, user, userData, sidebar) {
  if (!sidebar) return;

  const HL = {
    food: "Thực phẩm", clothes: "Quần áo", money: "Tiền mặt",
    medical: "Y tế", shelter: "Chỗ ở", other: "Khác",
  };
  const UL = { normal: "Bình thường", urgent: "Khẩn cấp", critical: "Rất khẩn" };
  const uc = { normal: "#22C55E", urgent: "#EAB308", critical: "#EF4444" }[loc.urgency] || "#22C55E";

  const actionBtn = user && userData?.role === "member"
    ? `<button class="btn btn--primary btn--full" id="checkin-btn" data-id="${loc.id}">Xác nhận hỗ trợ tại đây</button>`
    : user && userData?.role === "admin"
    ? `<a href="#/admin/locations/${loc.id}/edit" class="btn btn--ghost btn--full">Chỉnh sửa địa điểm</a>`
    : `<a href="#/login" class="btn btn--primary btn--full">Đăng nhập để hỗ trợ</a>`;

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h3 class="sidebar-title">Chi tiết địa điểm</h3>
      <button class="sidebar-close" id="sidebar-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="urgency-strip" style="background:${uc}"></div>
    ${loc.imageUrl
      ? `<img src="${loc.imageUrl}" class="sidebar-img" alt="${loc.title}" loading="lazy">`
      : `<div class="sidebar-img-placeholder">Chưa có ảnh</div>`}
    <h2 class="sidebar-loc-title">${loc.title}</h2>
    <div class="sidebar-badges">
      <span class="badge" style="background:${uc}20;color:${uc};">${UL[loc.urgency] || ""}</span>
      <span class="badge badge--muted">${loc.peopleCount || 1} người</span>
    </div>
    <div class="sidebar-help-types">
      ${(loc.helpTypes || []).map(t => `<span class="chip">${HL[t] || t}</span>`).join("")}
    </div>
    ${loc.description ? `<p class="sidebar-desc">${loc.description}</p>` : ""}
    <div class="sidebar-meta-grid">
      <div class="meta-box">
        <div class="meta-label">Thời gian</div>
        <div class="meta-val">${loc.timeFrom || "?"} — ${loc.timeTo || "?"}</div>
      </div>
      <div class="meta-box">
        <div class="meta-label">Hỗ trợ</div>
        <div class="meta-val" style="color:var(--accent)">${loc.supportCount || 0} lượt</div>
      </div>
    </div>
    ${loc.address ? `
    <div class="sidebar-address">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      ${loc.address}
    </div>` : ""}
    ${loc.note ? `<div class="sidebar-note">${loc.note}</div>` : ""}
    <div class="sidebar-actions">
      ${actionBtn}
      <a href="#/location/${loc.id}" class="btn btn--ghost btn--full">Xem chi tiết</a>
    </div>`;

  sidebar.classList.add("open");
  document.getElementById("sidebar-close")?.addEventListener("click", () => sidebar.classList.remove("open"));

  document.getElementById("checkin-btn")?.addEventListener("click", async e => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Đang lấy vị trí...';

    if (!navigator.geolocation) {
      Toast.show("Trình duyệt không hỗ trợ định vị.", "error");
      btn.disabled = false; btn.textContent = "Xác nhận hỗ trợ tại đây";
      return;
    }

    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const dist = LocationModel.haversineKm(pos.coords.latitude, pos.coords.longitude, loc.lat, loc.lng);
        if (dist > 0.5) {
          Toast.show(`Bạn cách ${Math.round(dist * 1000)}m. Cần đến gần hơn (trong 500m).`, "error");
          btn.disabled = false; btn.textContent = "Xác nhận hỗ trợ tại đây";
          return;
        }
        const result = await UserModel.addSupportedLocation(user.uid, loc.id);
        if (result?.alreadySupported) {
          Toast.show("Bạn đã hỗ trợ địa điểm này rồi!");
          btn.disabled = false; return;
        }
        await LocationModel.incrementSupport(loc.id);
        Toast.show(`Cảm ơn bạn! +1 điểm — Tổng: ${result.points} điểm`);
        btn.textContent = "Đã hỗ trợ";
        btn.style.opacity = "0.6";
      } catch(err) {
        console.error(err);
        Toast.show("Lỗi ghi nhận hỗ trợ.", "error");
        btn.disabled = false; btn.textContent = "Xác nhận hỗ trợ tại đây";
      }
    }, () => {
      Toast.show("Không thể lấy vị trí. Hãy cho phép truy cập vị trí.", "error");
      btn.disabled = false; btn.textContent = "Xác nhận hỗ trợ tại đây";
    });
  });
}
