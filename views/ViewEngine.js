// views/ViewEngine.js
import { HELP_TYPES, URGENCY } from "../models/LocationModel.js";
import { RANKS } from "../models/UserModel.js";

const URGENCY_COLOR = { normal: "#22C55E", urgent: "#EAB308", critical: "#EF4444" };
const URGENCY_LABEL = { normal: "Bình thường", urgent: "Khẩn cấp", critical: "Rất khẩn" };
const HELP_LABEL = { food:"Thực phẩm", clothes:"Quần áo", money:"Tiền mặt", medical:"Y tế", shelter:"Chỗ ở", other:"Khác" };

export function renderView(name, data = {}) {
  const app = document.getElementById("app");
  if (!app) return;
  const html = views[name]?.(data) || `<div class="container pt-120"><h1>Không tìm thấy trang</h1></div>`;
  app.innerHTML = html;
}

const views = {
  // ---- TRANG CHỦ (BẢN ĐỒ) ----
  home: ({ user, userData }) => `
    <div class="map-wrap">
      ${!user ? `<div class="map-welcome" id="welcome-banner">
        <h2>Bản đồ từ thiện</h2>
        <p>Đăng nhập để hỗ trợ và tích lũy điểm</p>
        <a href="#/login" class="btn btn--primary btn--sm">Đăng nhập</a>
      </div>` : ""}
      <div class="map-controls">
        <button class="map-ctrl-btn" id="locate-btn" title="Vị trí của tôi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        </button>
      </div>
      <div id=""></div>
      <div class="map-filter-bar">
        <span class="map-count-badge" id="map-count-badge" style="position:static;background:transparent;border:none;box-shadow:none;padding:4px 6px;font-size:.78rem;color:var(--text-muted);white-space:nowrap;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:3px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span id="map-count-badge">0 địa điểm</span>
        </span>
        <div style="width:1px;height:16px;background:var(--border);margin:0 4px;"></div>
        <button class="filter-chip active" data-filter="all">Tất cả</button>
        <button class="filter-chip" data-filter="critical"><span class="dot" style="background:#EF4444"></span>Rất khẩn</button>
        <button class="filter-chip" data-filter="urgent"><span class="dot" style="background:#EAB308"></span>Khẩn cấp</button>
        <button class="filter-chip" data-filter="normal"><span class="dot" style="background:#22C55E"></span>Bình thường</button>
      </div>
      <div class="map-sidebar" id="map-sidebar"></div>
    </div>`,

  // ---- ĐĂNG NHẬP ----
  login: () => `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand-logo"></div>
          <div><div class="brand-name">Trái Tim Việt</div><div class="brand-sub">Bản đồ từ thiện</div></div>
        </div>
        <h1 class="auth-title">Đăng nhập</h1>
        <p class="auth-sub">Chào mừng trở lại. Tiếp tục hành trình yêu thương.</p>
        <form id="login-form" novalidate>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" class="form-control" placeholder="ten@email.com" required>
          </div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="input-pw-wrap">
              <input type="password" name="password" class="form-control" placeholder="Nhập mật khẩu" required>
              <button type="button" class="pw-toggle" onclick="const i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-footer-link"><a href="#/forgot-password">Quên mật khẩu?</a></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Đăng nhập</button>
        </form>
        <div class="auth-divider">hoặc</div>
        <div class="auth-switch">Chưa có tài khoản? <a href="#/register">Đăng ký ngay</a></div>
        <div class="auth-back"><a href="#/home">&larr; Quay lại bản đồ</a></div>
      </div>
    </div>`,

  // ---- ĐĂNG KÝ ----
  register: () => `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand-logo"></div>
          <div><div class="brand-name">Trái Tim Việt</div><div class="brand-sub">Bản đồ từ thiện</div></div>
        </div>
        <h1 class="auth-title">Tạo tài khoản</h1>
        <p class="auth-sub">Tham gia cộng đồng, bắt đầu hành trình giúp đỡ.</p>
        <form id="register-form" novalidate>
          <div class="form-row">
            <div class="form-group"><label>Họ và tên</label><input type="text" name="fullName" class="form-control" placeholder="Nguyễn Văn A" required></div>
            <div class="form-group"><label>Số điện thoại</label><input type="tel" name="phone" class="form-control" placeholder="0912 345 678" required></div>
          </div>
          <div class="form-group"><label>Email</label><input type="email" name="email" class="form-control" placeholder="ten@email.com" required></div>
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="input-pw-wrap">
              <input type="password" name="password" id="pw-reg" class="form-control" placeholder="Tối thiểu 6 ký tự" required>
              <button type="button" class="pw-toggle" onclick="const i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div style="height:4px;background:var(--border);border-radius:2px;margin-bottom:16px;overflow:hidden;">
            <div id="pwd-bar-fill" style="height:100%;width:0;transition:all .3s;"></div>
          </div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Tạo tài khoản</button>
        </form>
        <div class="auth-divider">đã có tài khoản?</div>
        <a href="#/login" class="btn btn--ghost btn--full">Đăng nhập</a>
        <div class="auth-back"><a href="#/home">&larr; Quay lại bản đồ</a></div>
      </div>
    </div>`,

  // ---- QUÊN MẬT KHẨU ----
  "forgot-password": () => `
    <div class="auth-page">
      <div class="auth-card">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(184,50,40,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 class="auth-title">Quên mật khẩu</h1>
          <p class="auth-sub">Nhập email và chúng tôi sẽ gửi link đặt lại mật khẩu.</p>
        </div>
        <form id="forgot-form">
          <div class="form-group"><label>Email đăng ký</label><input type="email" name="email" class="form-control" placeholder="ten@email.com" required></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Gửi email đặt lại</button>
        </form>
        <div class="auth-back" style="margin-top:20px;"><a href="#/login">&larr; Quay lại đăng nhập</a></div>
      </div>
    </div>`,

  // ---- HỒ SƠ ----
  profile: ({ user, userData, leaderboard, myRank, ranks }) => `
    <div class="container pt-120 pb-80">
      <div class="profile-grid">
        <div>
          <!-- Hero card -->
          <div class="profile-hero">
            <div class="profile-avatar">${(userData?.fullName||"U").charAt(0).toUpperCase()}</div>
            <h1>${userData?.fullName||"Người dùng"}</h1>
            <div class="profile-rank-name" style="color:${userData?.rank?.color||'#CD7F32'}">
              ${userData?.role === "admin" ? "Người Dẫn Lửa" : (userData?.rank?.name||"Đồng Lòng")}
            </div>
            <div class="profile-role">
              ${userData?.role === "admin" ? "Quản trị viên" : "Thành viên"}
              ${myRank && userData?.role !== "admin" ? `&nbsp;&middot;&nbsp; Hạng #${myRank}` : ""}
            </div>
          </div>

          <!-- Điểm & tiến trình (chỉ member) -->
          ${userData?.role !== "admin" ? `
          <div class="rank-card">
            <div class="rank-pts-row">
              <div><div class="rank-label">Tổng điểm</div><div class="rank-pts">${userData?.points||0}</div></div>
              <div><div class="rank-label">Cấp bậc</div><div class="rank-name-sm" style="color:${userData?.rank?.color||'#CD7F32'}">${userData?.rank?.name||"Đồng Lòng"}</div></div>
            </div>
            ${userData?.rank?.next ? `
              <div class="prog-info">Tiến trình lên <strong>${userData.rank.next.name}</strong> — ${userData.rank.progress}%</div>
              <div class="prog-bar"><div class="prog-fill" style="width:${userData.rank.progress}%"></div></div>
              <div class="prog-sub">Cần thêm ${userData.rank.pointsToNext} điểm</div>
            ` : `<div style="text-align:center;color:var(--accent-gold);font-weight:600;padding:10px 0;">Bạn đã đạt cấp bậc cao nhất!</div>`}
          </div>` : ""}

          <!-- Hành trình cấp bậc (cả admin và member đều thấy) -->
          <div class="card mb-24">
            <div class="card-header"><h3>Hệ thống cấp bậc thành viên</h3></div>
            <div class="card-body">
              ${ranks.map((r, i) => {
                const pts = userData?.points || 0;
                const achieved = userData?.role === "admin" || pts >= r.minPoints;
                const current = userData?.role !== "admin" && userData?.rank?.name === r.name;
                return `<div class="rank-journey-item">
                  <div class="rj-dot ${achieved?"achieved":""}" style="${achieved?`background:${r.color}`:""}">
                    ${achieved
                      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
                      : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`}
                  </div>
                  <div class="rj-info">
                    <div class="rj-name" style="color:${achieved?r.color:"var(--text-muted)"}">
                      ${r.name}
                      ${current ? `<span class="rj-current">Hiện tại</span>` : ""}
                      ${userData?.role === "admin" ? `<span class="rj-current" style="background:rgba(184,50,40,.15);color:var(--accent)">Admin</span>` : ""}
                    </div>
                    <div class="rj-pts">Từ ${r.minPoints} điểm · Hỗ trợ ${r.minPoints} địa điểm</div>
                  </div>
                  <div style="font-size:.75rem;font-weight:700;color:${r.color};background:${r.color}20;padding:3px 10px;border-radius:999px;">${r.name}</div>
                </div>`;
              }).join("")}
              <div style="margin-top:16px;padding:12px 14px;background:var(--bg2);border-radius:var(--radius);font-size:.8rem;color:var(--text-muted);line-height:1.6;">
                Mỗi lần xác nhận hỗ trợ tại địa điểm (trong vòng 500m) bạn nhận được <strong style="color:var(--text)">+1 điểm</strong>. Tích lũy điểm để lên hạng.
              </div>
            </div>
          </div>

          <!-- Form chỉnh sửa -->
          <div class="card">
            <div class="card-header"><h3>Chỉnh sửa hồ sơ</h3></div>
            <div class="card-body">
              <form id="profile-form">
                <div class="form-row">
                  <div class="form-group"><label>Họ và tên</label><input type="text" name="fullName" class="form-control" value="${userData?.fullName||""}" required></div>
                  <div class="form-group"><label>Số điện thoại</label><input type="tel" name="phone" class="form-control" value="${userData?.phone||""}" required></div>
                </div>
                <button type="submit" class="btn btn--primary">Lưu thay đổi</button>
              </form>
              <div class="divider">đổi email</div>
              <form id="email-form">
                <div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end;">
                  <div class="form-group" style="margin:0"><label>Email mới</label><input type="email" name="newEmail" class="form-control" placeholder="${userData?.email||""}" required></div>
                  <button type="submit" class="btn btn--ghost">Cập nhật</button>
                </div>
                <div class="form-hint">Email mới cần xác thực trước khi có hiệu lực.</div>
              </form>
            </div>
          </div>
        </div>

        <!-- Cột phải: Bảng xếp hạng + thông tin tài khoản -->
        <div>
          <div class="card sticky-top">
            <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
              <h3>Bảng xếp hạng</h3>
              <span class="text-muted text-xs">Top 10</span>
            </div>
            <div class="card-body" style="padding:8px 16px;">
              ${leaderboard.map((m, i) => `
                <div class="lb-item ${m.uid===user?.uid?"lb-item--me":""}">
                  <div class="lb-rank ${i===0?"lb-rank--top1":i===1?"lb-rank--top2":i===2?"lb-rank--top3":""}">${i+1}</div>
                  <div class="lb-avatar">${(m.fullName||"?").charAt(0).toUpperCase()}</div>
                  <div class="lb-info">
                    <div class="lb-name">${m.fullName||"Ẩn danh"}${m.uid===user?.uid?` <span style="font-size:.62rem;color:var(--accent)">(Bạn)</span>`:""}</div>
                    <div class="lb-meta">${m.rank?.name||"Đồng Lòng"}</div>
                  </div>
                  <div class="lb-pts">${m.points||0}</div>
                </div>`).join("") || `<p class="text-muted" style="padding:16px;font-size:.82rem;">Chưa có dữ liệu</p>`}
            </div>
          </div>
          <div class="card" style="margin-top:16px;">
            <div class="card-body">
              <div class="info-label">Thông tin tài khoản</div>
              <div class="info-row"><span>Email</span><strong>${userData?.email||""}</strong></div>
              <div class="info-row"><span>Vai trò</span><strong style="color:${userData?.role==="admin"?"var(--accent)":"var(--text)"}">${userData?.role==="admin"?"Người Dẫn Lửa":"Đồng Lòng"}</strong></div>
              ${userData?.role!=="admin"?`<div class="info-row"><span>Hỗ trợ</span><strong>${userData?.supportedLocations?.length||0} địa điểm</strong></div>`:""}
            </div>
          </div>
        </div>
      </div>
    </div>`,

  // ---- ADMIN DASHBOARD ----
  "admin-dashboard": ({ userData, locations, members, stats }) => `
    <div class="admin-layout">
      <aside class="admin-sidebar">${_adminNav("dashboard")}</aside>
      <main class="admin-main">
        <div class="admin-topbar">
          <div><h1>Bảng điều khiển</h1><p class="text-muted">Quản lý địa điểm và thành viên</p></div>
          <a href="#/admin/locations/new" class="btn btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm địa điểm
          </a>
        </div>
        <div class="stats-grid">
          ${[
            ["Tổng địa điểm", stats.total, "var(--accent)"],
            ["Đang hoạt động", stats.active, "#22C55E"],
            ["Rất khẩn", stats.critical, "#EF4444"],
            ["Thành viên", stats.members, "#FFD700"],
          ].map(([l,v,c]) => `
            <div class="stat-card"><div class="stat-val" style="color:${c}">${v}</div><div class="stat-label">${l}</div></div>
          `).join("")}
        </div>
        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <h3>Danh sách địa điểm</h3>
            <input id="loc-search" type="text" class="form-control" style="width:220px;" placeholder="Tìm kiếm...">
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead><tr><th>Tên</th><th>Mức độ</th><th>Người</th><th>Hỗ trợ</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody id="locations-tbody">
                ${locations.length === 0
                  ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px;">Chưa có địa điểm nào</td></tr>`
                  : locations.map(loc => `
                  <tr class="loc-row">
                    <td><div class="td-title"><a href="#/location/${loc.id}">${loc.title}</a></div><div class="td-sub">${(loc.address||"").substring(0,40)}</div></td>
                    <td><span class="badge" style="background:${URGENCY_COLOR[loc.urgency]}20;color:${URGENCY_COLOR[loc.urgency]}">${URGENCY_LABEL[loc.urgency]||""}</span></td>
                    <td>${loc.peopleCount||1}</td>
                    <td style="font-weight:700;color:var(--accent)">${loc.supportCount||0}</td>
                    <td><span style="font-size:.75rem;font-weight:600;color:${loc.isActive?"#22C55E":"var(--text-muted)"}">${loc.isActive?"Hoạt động":"Đã ẩn"}</span></td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <a href="#/admin/locations/${loc.id}/edit" class="btn btn--ghost btn--sm">Sửa</a>
                        <button class="btn btn--ghost btn--sm" data-action="toggle" data-id="${loc.id}">${loc.isActive?"Ẩn":"Hiện"}</button>
                        <button class="btn btn--danger btn--sm" data-action="delete" data-id="${loc.id}">Xóa</button>
                      </div>
                    </td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>`,

  // ---- ADMIN FORM ----
  "admin-location-form": ({ location, helpTypes, urgency }) => `
    <div class="admin-layout">
      <aside class="admin-sidebar">${_adminNav(location ? "edit" : "new")}</aside>
      <main class="admin-main">
        <div class="admin-topbar">
          <div>
            <a href="#/admin/dashboard" style="font-size:.82rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:6px;margin-bottom:8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Quay lại
            </a>
            <h1>${location ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}</h1>
          </div>
        </div>
        <form id="location-form">
          <div class="form-2col">
            <div>
              <div class="card mb-20">
                <div class="card-header"><h3>Thông tin cơ bản</h3></div>
                <div class="card-body">
                  <div class="form-group"><label>Tên địa điểm *</label><input type="text" name="title" class="form-control" value="${location?.title||""}" placeholder="VD: Khu vực cầu Thị Nghè" required></div>
                  <div class="form-group"><label>Mô tả</label><textarea name="description" class="form-control" rows="3" placeholder="Mô tả hoàn cảnh, nhu cầu...">${location?.description||""}</textarea></div>
                  <div class="form-group"><label>Ghi chú</label><textarea name="note" class="form-control" rows="2" placeholder="Thông tin lưu ý khi đến hỗ trợ...">${location?.note||""}</textarea></div>
                </div>
              </div>
              <div class="card mb-20">
                <div class="card-header"><h3>Loại hỗ trợ cần thiết</h3></div>
                <div class="card-body">
                  <div class="help-types-grid">
                    ${helpTypes.map(t => `
                      <label class="check-card ${location?.helpTypes?.includes(t.value)?"checked":""}">
                        <input type="checkbox" name="helpTypes" value="${t.value}" ${location?.helpTypes?.includes(t.value)?"checked":""}
                          onchange="this.closest('.check-card').classList.toggle('checked',this.checked)">
                        <span>${t.label}</span>
                      </label>`).join("")}
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-header"><h3>Hình ảnh</h3></div>
                <div class="card-body">
                  <div class="form-group">
                    <label>URL ảnh (không bắt buộc)</label>
                    <input type="text" name="imageUrl" id="image-url-input" class="form-control"
                      value="${location?.imageUrl||""}"
                      placeholder="https://i.imgur.com/abc.jpg">
                    <div class="form-hint">Dùng <a href="https://imgur.com" target="_blank">Imgur.com</a> để host ảnh miễn phí, copy Direct Link dán vào đây.</div>
                  </div>
                  <div id="img-preview-wrap" style="display:${location?.imageUrl?"block":"none"};">
                    <img id="img-preview" src="${location?.imageUrl||""}" style="width:100%;height:130px;object-fit:cover;border-radius:10px;border:1px solid var(--border);">
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="card mb-20">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                  <h3>Vị trí trên bản đồ *</h3>
                  <button type="button" id="picker-locate" class="btn btn--ghost btn--sm">Vị trí của tôi</button>
                </div>
                <div class="card-body">
                  <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px;">Bấm vào bản đồ để chọn vị trí</p>
                  <div id="map-picker" style="height:280px;border-radius:10px;overflow:hidden;border:1.5px solid var(--border);"></div>
                  <div class="form-row" style="margin-top:10px;">
                    <div class="form-group" style="margin:0"><label>Vĩ độ</label><input type="text" id="input-lat" name="lat" class="form-control" value="${location?.lat||""}" placeholder="10.7769" readonly required></div>
                    <div class="form-group" style="margin:0"><label>Kinh độ</label><input type="text" id="input-lng" name="lng" class="form-control" value="${location?.lng||""}" placeholder="106.7009" readonly required></div>
                  </div>
                </div>
              </div>
              <div class="card mb-20">
                <div class="card-header"><h3>Chi tiết</h3></div>
                <div class="card-body">
                  <div class="form-group"><label>Địa chỉ</label><input type="text" id="input-address" name="address" class="form-control" value="${location?.address||""}" placeholder="Tự động điền khi chọn trên bản đồ"></div>
                  <div class="form-row">
                    <div class="form-group"><label>Từ giờ</label><input type="text" name="timeFrom" class="form-control" value="${location?.timeFrom||""}" placeholder="18:00"></div>
                    <div class="form-group"><label>Đến giờ</label><input type="text" name="timeTo" class="form-control" value="${location?.timeTo||""}" placeholder="22:00"></div>
                  </div>
                  <div class="form-group"><label>Số người</label><input type="number" name="peopleCount" class="form-control" value="${location?.peopleCount||1}" min="1"></div>
                </div>
              </div>
              <div class="card mb-20">
                <div class="card-header"><h3>Mức độ khẩn cấp</h3></div>
                <div class="card-body">
                  ${urgency.map(u => `
                    <label class="radio-card ${(location?.urgency||"normal")===u.value?"checked":""}">
                      <input type="radio" name="urgency" value="${u.value}" ${(location?.urgency||"normal")===u.value?"checked":""}
                        onchange="document.querySelectorAll('.radio-card').forEach(c=>c.classList.remove('checked'));this.closest('.radio-card').classList.add('checked')">
                      <span class="radio-dot" style="background:${u.color}"></span>
                      <span>${u.label}</span>
                    </label>`).join("")}
                </div>
              </div>
              <div style="display:flex;gap:12px;">
                <button type="submit" class="btn btn--primary btn--lg" style="flex:1">${location?"Lưu thay đổi":"Thêm địa điểm"}</button>
                <a href="#/admin/dashboard" class="btn btn--ghost btn--lg">Hủy</a>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>`,
};

function _adminNav(active) {
  const items = [
    { id: "dashboard", href: "#/admin/dashboard", label: "Bảng điều khiển", icon: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>` },
    { id: "new", href: "#/admin/locations/new", label: "Thêm địa điểm", icon: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>` },
    { id: "home-link", href: "#/home", label: "Xem bản đồ", icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` },
    { id: "profile-link", href: "#/profile", label: "Hồ sơ", icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>` },
  ];
  return `<div class="admin-nav-label">Người Dẫn Lửa</div>` + items.map(item => `
    <a href="${item.href}" class="admin-nav-item ${active===item.id?"active":""}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
      ${item.label}
    </a>`).join("");
}
