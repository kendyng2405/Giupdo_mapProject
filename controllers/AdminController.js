// controllers/AdminController.js
import { LocationModel, HELP_TYPES, URGENCY } from "../models/LocationModel.js";
import { UserModel } from "../models/UserModel.js";
import { renderView } from "../views/ViewEngine.js";
import { Toast } from "../views/components/Toast.js";
import { router } from "./Router.js";

export const AdminController = {
  async dashboard({ userData }) {
    const [locations, members] = await Promise.all([
      LocationModel.findAll(false),
      UserModel.getLeaderboard(50),
    ]);
    renderView("admin-dashboard", {
      userData, locations, members,
      stats: {
        total: locations.length,
        active: locations.filter(l => l.isActive).length,
        critical: locations.filter(l => l.urgency === "critical").length,
        members: members.length,
      }
    });
    _initDashboardEvents(locations);
  },

  async showCreate({ userData }) {
    renderView("admin-location-form", { userData, location: null, helpTypes: HELP_TYPES, urgency: URGENCY });
    await _nextTick();
    _initMapPicker(null, null);
    _initLocationForm(null, userData);
  },

  async showEdit({ userData, params }) {
    const location = await LocationModel.findById(params.id);
    if (!location) {
      Toast.show("Không tìm thấy địa điểm.", "error");
      router.navigate("/admin/dashboard");
      return;
    }
    renderView("admin-location-form", { userData, location, helpTypes: HELP_TYPES, urgency: URGENCY });
    await _nextTick();
    _initMapPicker(location.lat, location.lng);
    _initLocationForm(location, userData);
  },
};

function _initDashboardEvents(locations) {
  document.getElementById("loc-search")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".loc-row").forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  document.getElementById("locations-tbody")?.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "toggle") {
      const loc = locations.find(l => l.id === id);
      if (!loc) return;
      await LocationModel.toggleActive(id, !loc.isActive);
      Toast.show(`Đã ${loc.isActive ? "ẩn" : "hiện"} địa điểm.`);
      router.navigate("/admin/dashboard");
    }

    if (action === "delete") {
      if (!confirm("Xác nhận xóa địa điểm này?")) return;
      await LocationModel.delete(id);
      Toast.show("Đã xóa địa điểm.");
      router.navigate("/admin/dashboard");
    }
  });
}

let pickerMap = null, pickerMarker = null;

function _initMapPicker(lat, lng) {
  const el = document.getElementById("map-picker");
  if (!el) return;

  if (pickerMap) {
    try { pickerMap.off(); pickerMap.remove(); } catch(e) {}
    pickerMap = null;
    pickerMarker = null;
  }

  pickerMap = L.map("map-picker", {
    center: [lat || 16.047, lng || 108.206],
    zoom: lat ? 15 : 6,
  });

  L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
  attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
  maxZoom: 20,
}).addTo(pickerMap);

  if (lat && lng) _placePickerMarker(lat, lng);

  pickerMap.on("click", e => {
    _placePickerMarker(e.latlng.lat, e.latlng.lng);
    _reverseGeocode(e.latlng.lat, e.latlng.lng);
  });

  document.getElementById("picker-locate")?.addEventListener("click", () => {
    if (!navigator.geolocation) { Toast.show("Trình duyệt không hỗ trợ định vị.", "error"); return; }
    navigator.geolocation.getCurrentPosition(pos => {
      pickerMap.setView([pos.coords.latitude, pos.coords.longitude], 16);
      _placePickerMarker(pos.coords.latitude, pos.coords.longitude);
      _reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    }, () => Toast.show("Không thể lấy vị trí.", "error"));
  });
}

function _placePickerMarker(lat, lng) {
  if (pickerMarker) pickerMap.removeLayer(pickerMarker);
  pickerMarker = L.marker([lat, lng]).addTo(pickerMap);
  const latEl = document.getElementById("input-lat");
  const lngEl = document.getElementById("input-lng");
  if (latEl) latEl.value = lat.toFixed(7);
  if (lngEl) lngEl.value = lng.toFixed(7);
}

async function _reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`,
      { headers: { "Accept-Language": "vi" } }
    );
    const data = await res.json();
    const el = document.getElementById("input-address");
    if (el && data.display_name) el.value = data.display_name;
  } catch(e) {}
}

function _initLocationForm(location, userData) {
  document.getElementById("location-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("[type=submit]");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Đang lưu...';
    try {
      const fd = new FormData(e.target);
      const data = {
        title: fd.get("title"),
        description: fd.get("description"),
        lat: fd.get("lat"),
        lng: fd.get("lng"),
        address: fd.get("address"),
        note: fd.get("note"),
        helpTypes: fd.getAll("helpTypes"),
        urgency: fd.get("urgency"),
        peopleCount: fd.get("peopleCount"),
        timeFrom: fd.get("timeFrom"),
        timeTo: fd.get("timeTo"),
        imageUrl: fd.get("imageUrl") || location?.imageUrl || null,
        createdBy: userData?.uid,
      };

      if (!data.lat || !data.lng) {
        Toast.show("Vui lòng chọn vị trí trên bản đồ.", "error");
        btn.disabled = false;
        btn.textContent = location ? "Lưu thay đổi" : "Thêm địa điểm";
        return;
      }

      if (location) {
        await LocationModel.update(location.id, data);
        Toast.show("Đã cập nhật địa điểm!");
      } else {
        await LocationModel.create(data);
        Toast.show("Đã thêm địa điểm mới!");
      }
      router.navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      Toast.show("Lỗi lưu địa điểm.", "error");
      btn.disabled = false;
      btn.textContent = location ? "Lưu thay đổi" : "Thêm địa điểm";
    }
  });

  // Image URL live preview
  document.getElementById("image-url-input")?.addEventListener("input", function() {
    const url = this.value.trim();
    const wrap = document.getElementById("img-preview-wrap");
    const prev = document.getElementById("img-preview");
    if (url && wrap && prev) {
      prev.src = url;
      wrap.style.display = "block";
      prev.onerror = () => { wrap.style.display = "none"; };
      prev.onload  = () => { wrap.style.display = "block"; };
    } else if (wrap) {
      wrap.style.display = "none";
    }
  });
}

function _nextTick() {
  return new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 50)));
}
