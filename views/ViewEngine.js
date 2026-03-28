// -*- coding: utf-8 -*-
// views/ViewEngine.js — renders view templates into #app
import { HELP_TYPES, URGENCY } from "../models/LocationModel.js";
import { RANKS } from "../models/UserModel.js";

const URGENCY_COLOR = { normal: "#22C55E", urgent: "#EAB308", critical: "#EF4444" };
const URGENCY_LABEL = { normal: "Binh thuong", urgent: "Khan cap", critical: "Rat khan" };
const HELP_LABEL = { food:"Thuc pham", clothes:"Quan ao", money:"Tien mat", medical:"Y te", shelter:"Cho o", other:"Khac" };

export function renderView(name, data = {}) {
  const app = document.getElementById("app");
  if (!app) return;
  const html = views[name]?.(data) || `<div class="container pt-120"><h1>View not found: ${name}</h1></div>`;
  app.innerHTML = html;
}

const views = {
  home: ({ user, userData }) => `
    <div class="map-wrap">
      ${!user ? `<div class="map-welcome" id="welcome-banner">
        <h2>Ban do tu thien</h2>
        <p>Dang nhap de ho tro va tich luy diem</p>
        <a href="#/login" class="btn btn--primary btn--sm">Dang nhap</a>
      </div>` : ""}
      <div class="map-count-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        Dang tai...
      </div>
      <div class="map-controls">
        <button class="map-ctrl-btn" id="locate-btn" title="Vi tri cua toi">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        </button>
      </div>
      <div id="map"></div>
      <div class="map-filter-bar">
        <button class="filter-chip active" data-filter="all">Tat ca</button>
        <button class="filter-chip" data-filter="critical"><span class="dot" style="background:#EF4444"></span>Rat khan</button>
        <button class="filter-chip" data-filter="urgent"><span class="dot" style="background:#EAB308"></span>Khan cap</button>
        <button class="filter-chip" data-filter="normal"><span class="dot" style="background:#22C55E"></span>Binh thuong</button>
      </div>
      <div class="map-sidebar" id="map-sidebar"></div>
      <div class="map-leaderboard">
        <div class="lb-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Bang xep hang
        </div>
        <div id="leaderboard-list"></div>
      </div>
    </div>`,

  login: () => `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand-logo"></div>
          <div><div class="brand-name">Trai Tim Viet</div><div class="brand-sub">Ban do tu thien</div></div>
        </div>
        <h1 class="auth-title">Dang nhap</h1>
        <p class="auth-sub">Chao mung tro lai. Tiep tuc hanh trinh yeu thuong.</p>
        <form id="login-form" novalidate>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" class="form-control" placeholder="ten@email.com" required>
          </div>
          <div class="form-group">
            <label>Mat khau</label>
            <div class="input-pw-wrap">
              <input type="password" name="password" id="pw-input" class="form-control" placeholder="Nhap mat khau" required>
              <button type="button" class="pw-toggle" onclick="this.previousElementSibling.type=this.previousElementSibling.type==='password'?'text':'password'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-footer-link"><a href="#/forgot-password">Quen mat khau?</a></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Dang nhap</button>
        </form>
        <div class="auth-divider">hoac</div>
        <div class="auth-switch">Chua co tai khoan? <a href="#/register">Dang ky ngay</a></div>
        <div class="auth-back"><a href="#/home">&larr; Quay lai ban do</a></div>
      </div>
    </div>`,

  register: () => `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">
          <div class="brand-logo"></div>
          <div><div class="brand-name">Trai Tim Viet</div><div class="brand-sub">Ban do tu thien</div></div>
        </div>
        <h1 class="auth-title">Tao tai khoan</h1>
        <p class="auth-sub">Tham gia cong dong, bat dau hanh trinh giup do.</p>
        <form id="register-form" novalidate>
          <div class="form-row">
            <div class="form-group"><label>Ho va ten</label><input type="text" name="fullName" class="form-control" placeholder="Nguyen Van A" required></div>
            <div class="form-group"><label>So dien thoai</label><input type="tel" name="phone" class="form-control" placeholder="0912 345 678" required></div>
          </div>
          <div class="form-group"><label>Email</label><input type="email" name="email" class="form-control" placeholder="ten@email.com" required></div>
          <div class="form-group">
            <label>Mat khau</label>
            <div class="input-pw-wrap">
              <input type="password" name="password" id="pw-reg" class="form-control" placeholder="Toi thieu 6 ky tu" required>
              <button type="button" class="pw-toggle" onclick="const i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div id="pwd-strength-bar" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:16px;overflow:hidden;"><div id="pwd-bar-fill" style="height:100%;width:0;transition:all .3s;"></div></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Tao tai khoan</button>
        </form>
        <div class="auth-divider">da co tai khoan?</div>
        <a href="#/login" class="btn btn--ghost btn--full">Dang nhap</a>
        <div class="auth-back"><a href="#/home">&larr; Quay lai ban do</a></div>
      </div>
    </div>
    <script>
      document.getElementById('pw-reg')?.addEventListener('input',function(){
        const v=this.value,score=[v.length>=6,v.length>=10,/[A-Z]/.test(v),/[0-9]/.test(v),/[^a-zA-Z0-9]/.test(v)].filter(Boolean).length;
        const colors=['#EF4444','#F97316','#EAB308','#10B981','#22C55E'];
        const bar=document.getElementById('pwd-bar-fill');
        if(bar){bar.style.width=(score*20)+'%';bar.style.background=colors[score-1]||'transparent';}
      });
    </script>`,

  "forgot-password": () => `
    <div class="auth-page">
      <div class="auth-card">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(192,57,43,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 class="auth-title">Quen mat khau</h1>
          <p class="auth-sub">Nhap email va chung toi se gui link dat lai mat khau.</p>
        </div>
        <form id="forgot-form">
          <div class="form-group"><label>Email dang ky</label><input type="email" name="email" class="form-control" placeholder="ten@email.com" required></div>
          <button type="submit" class="btn btn--primary btn--full btn--lg">Gui email dat lai</button>
        </form>
        <div class="auth-back" style="margin-top:20px;"><a href="#/login">&larr; Quay lai dang nhap</a></div>
      </div>
    </div>`,

  profile: ({ user, userData, leaderboard, myRank, ranks }) => `
    <div class="container pt-120 pb-80">
      <div class="profile-grid">
        <div>
          <div class="profile-hero">
            <div class="profile-avatar">${(userData?.fullName||"U").charAt(0).toUpperCase()}</div>
            <h1>${userData?.fullName || "Nguoi dung"}</h1>
            <div class="profile-rank-name" style="color:${userData?.rank?.color||'#CD7F32'}">${userData?.rank?.name||"Dong Long"}</div>
            <div class="profile-role">${userData?.role === "admin" ? "Nguoi Dan Lua" : "Thanh vien"} ${myRank && userData?.role !== "admin" ? `· Hang #${myRank}` : ""}</div>
          </div>
          ${userData?.role !== "admin" ? `
          <div class="rank-card">
            <div class="rank-pts-row">
              <div><div class="rank-label">Tong diem</div><div class="rank-pts">${userData?.points||0}</div></div>
              <div><div class="rank-label">Cap bac</div><div class="rank-name-sm">${userData?.rank?.name||"Dong Long"}</div></div>
            </div>
            ${userData?.rank?.next ? `
              <div class="prog-info">Tien trinh len <strong>${userData.rank.next.name}</strong> — ${userData.rank.progress}%</div>
              <div class="prog-bar"><div class="prog-fill" style="width:${userData.rank.progress}%"></div></div>
              <div class="prog-sub">Can them ${userData.rank.pointsToNext} diem</div>
            ` : `<div style="text-align:center;color:var(--accent-gold);font-weight:600;padding:10px 0;">Ban da dat cap bac cao nhat!</div>`}
          </div>
          <div class="card mb-24">
            <div class="card-header"><h3>Hanh trinh cap bac</h3></div>
            <div class="card-body">
              ${ranks.map((r,i) => {
                const achieved = (userData?.points||0) >= r.minPoints;
                const current = userData?.rank?.name === r.name;
                return `<div class="rank-journey-item">
                  <div class="rj-dot ${achieved?'achieved':''}" style="${achieved?`background:${r.color}`:''}">
                    ${achieved?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>':'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}
                  </div>
                  <div class="rj-info">
                    <div class="rj-name" style="color:${achieved?r.color:'var(--text-muted)'}">${r.name}${current?'<span class="rj-current">Hien tai</span>':''}</div>
                    <div class="rj-pts">${r.minPoints} diem</div>
                  </div>
                </div>`;
              }).join("")}
            </div>
          </div>` : ""}
          <div class="card">
            <div class="card-header"><h3>Chinh sua ho so</h3></div>
            <div class="card-body">
              <form id="profile-form">
                <div class="form-row">
                  <div class="form-group"><label>Ho va ten</label><input type="text" name="fullName" class="form-control" value="${userData?.fullName||''}" required></div>
                  <div class="form-group"><label>So dien thoai</label><input type="tel" name="phone" class="form-control" value="${userData?.phone||''}" required></div>
                </div>
                <button type="submit" class="btn btn--primary">Luu thay doi</button>
              </form>
              <div class="divider">doi email</div>
              <form id="email-form">
                <div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:end;">
                  <div class="form-group" style="margin:0"><label>Email moi</label><input type="email" name="newEmail" class="form-control" placeholder="${userData?.email||''}" required></div>
                  <button type="submit" class="btn btn--ghost">Cap nhat</button>
                </div>
                <div class="form-hint">Email moi can xac thuc truoc khi co hieu luc.</div>
              </form>
            </div>
          </div>
        </div>
        <div>
          <div class="card sticky-top">
            <div class="card-header"><h3>Bang xep hang</h3><span class="text-muted text-xs">Top 10</span></div>
            <div class="card-body" style="padding:8px 16px;">
              ${leaderboard.map((m,i) => `
                <div class="lb-item ${m.uid === user?.uid ? 'lb-item--me' : ''}">
                  <div class="lb-rank ${i===0?'lb-rank--top1':i===1?'lb-rank--top2':i===2?'lb-rank--top3':''}">${i+1}</div>
                  <div class="lb-avatar">${(m.fullName||"?").charAt(0).toUpperCase()}</div>
                  <div class="lb-info">
                    <div class="lb-name">${m.fullName||"An danh"}${m.uid===user?.uid?' <span style="font-size:.65rem;color:var(--accent)">(Ban)</span>':''}</div>
                    <div class="lb-meta">${m.rank?.name||"Dong Long"}</div>
                  </div>
                  <div class="lb-pts">${m.points||0}</div>
                </div>`).join("") || "<p class='text-muted' style='padding:16px;'>Chua co du lieu</p>"}
            </div>
          </div>
          <div class="card" style="margin-top:16px;">
            <div class="card-body">
              <div class="info-label">Tai khoan</div>
              <div class="info-row"><span>Email</span><strong>${userData?.email||""}</strong></div>
              <div class="info-row"><span>Vai tro</span><strong>${userData?.role==="admin"?"Nguoi Dan Lua":"Dong Long"}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>`,

  "admin-dashboard": ({ userData, locations, members, stats }) => `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        ${_adminNav("dashboard")}
      </aside>
      <main class="admin-main">
        <div class="admin-topbar">
          <div><h1>Bang dieu khien</h1><p class="text-muted">Quan ly dia diem va thanh vien</p></div>
          <a href="#/admin/locations/new" class="btn btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Them dia diem
          </a>
        </div>
        <div class="stats-grid">
          ${[["Tong dia diem",stats.total,"var(--accent)"],["Dang hoat dong",stats.active,"#22C55E"],["Rat khan",stats.critical,"#EF4444"],["Thanh vien",stats.members,"#FFD700"]].map(([l,v,c])=>`
            <div class="stat-card"><div class="stat-val" style="color:${c}">${v}</div><div class="stat-label">${l}</div></div>`).join("")}
        </div>
        <div class="card">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <h3>Danh sach dia diem</h3>
            <input id="loc-search" type="text" class="form-control" style="width:220px;" placeholder="Tim kiem...">
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead><tr><th>Ten</th><th>Muc do</th><th>Nguoi</th><th>Ho tro</th><th>Trang thai</th><th>Thao tac</th></tr></thead>
              <tbody id="locations-tbody">
                ${locations.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:40px;">Chua co dia diem nao</td></tr>` :
                  locations.map(loc => `
                  <tr class="loc-row">
                    <td><div class="td-title"><a href="#/location/${loc.id}">${loc.title}</a></div><div class="td-sub">${loc.address?.substring(0,40)||""}</div></td>
                    <td><span class="badge" style="background:${URGENCY_COLOR[loc.urgency]}20;color:${URGENCY_COLOR[loc.urgency]}">${URGENCY_LABEL[loc.urgency]||""}</span></td>
                    <td>${loc.peopleCount||1}</td>
                    <td style="font-weight:700;color:var(--accent)">${loc.supportCount||0}</td>
                    <td><span style="font-size:.75rem;font-weight:600;color:${loc.isActive?"#22C55E":"var(--text-muted)"}">${loc.isActive?"Hoat dong":"An"}</span></td>
                    <td>
                      <div style="display:flex;gap:6px;flex-wrap:wrap;">
                        <a href="#/admin/locations/${loc.id}/edit" class="btn btn--ghost btn--sm">Sua</a>
                        <button class="btn btn--ghost btn--sm" data-action="toggle" data-id="${loc.id}">${loc.isActive?"An":"Hien"}</button>
                        <button class="btn btn--danger btn--sm" data-action="delete" data-id="${loc.id}">Xoa</button>
                      </div>
                    </td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>`,

  "admin-location-form": ({ location, helpTypes, urgency }) => `
    <div class="admin-layout">
      <aside class="admin-sidebar">${_adminNav(location ? "edit" : "new")}</aside>
      <main class="admin-main">
        <div class="admin-topbar">
          <div>
            <a href="#/admin/dashboard" style="font-size:.82rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:6px;margin-bottom:8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              Quay lai
            </a>
            <h1>${location ? "Chinh sua dia diem" : "Them dia diem moi"}</h1>
          </div>
        </div>
        <form id="location-form" enctype="multipart/form-data">
          <div class="form-2col">
            <div>
              <div class="card mb-20">
                <div class="card-header"><h3>Thong tin co ban</h3></div>
                <div class="card-body">
                  <div class="form-group"><label>Ten dia diem *</label><input type="text" name="title" class="form-control" value="${location?.title||""}" placeholder="VD: Khu vuc cau Thi Nghe" required></div>
                  <div class="form-group"><label>Mo ta</label><textarea name="description" class="form-control" rows="3" placeholder="Mo ta hoan canh, nhu cau...">${location?.description||""}</textarea></div>
                  <div class="form-group"><label>Ghi chu</label><textarea name="note" class="form-control" rows="2" placeholder="Thong tin luu y...">${location?.note||""}</textarea></div>
                </div>
              </div>
              <div class="card mb-20">
                <div class="card-header"><h3>Loai ho tro can thiet</h3></div>
                <div class="card-body">
                  <div class="help-types-grid">
                    ${helpTypes.map(t => `
                      <label class="check-card ${location?.helpTypes?.includes(t.value)?'checked':''}">
                        <input type="checkbox" name="helpTypes" value="${t.value}" ${location?.helpTypes?.includes(t.value)?"checked":""}
                          onchange="this.closest('.check-card').classList.toggle('checked',this.checked)">
                        <span>${t.label}</span>
                      </label>`).join("")}
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-header"><h3>Hinh anh</h3></div>
                <div class="card-body">
                  <div class="form-group" style="margin-bottom:10px;">
                    <label>URL anh (khong bat buoc)</label>
                    <input type="text" name="imageUrl" id="image-url-input" class="form-control"
                      value="${location?.imageUrl||''}"
                      placeholder="https://i.imgur.com/... hoac link Google Drive">
                    <div class="form-hint">Dan link anh truc tiep. Co the dung Imgur.com (mien phi) de host anh.</div>
                  </div>
                  <div id="img-preview-wrap" style="display:${location?.imageUrl?'block':'none'}">
                    <img id="img-preview" src="${location?.imageUrl||''}"
                      style="width:100%;height:130px;object-fit:cover;border-radius:10px;border:1px solid var(--border);">
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="card mb-20">
                <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
                  <h3>Vi tri tren ban do *</h3>
                  <button type="button" id="picker-locate" class="btn btn--ghost btn--sm">Vi tri cua toi</button>
                </div>
                <div class="card-body">
                  <p style="font-size:.78rem;color:var(--text-muted);margin-bottom:10px;">Bam vao ban do de chon vi tri</p>
                  <div id="map-picker" style="height:280px;border-radius:10px;overflow:hidden;border:1.5px solid var(--border);"></div>
                  <div class="form-row" style="margin-top:10px;">
                    <div class="form-group" style="margin:0"><label>Vi do</label><input type="text" id="input-lat" name="lat" class="form-control" value="${location?.lat||""}" placeholder="10.7769" readonly required></div>
                    <div class="form-group" style="margin:0"><label>Kinh do</label><input type="text" id="input-lng" name="lng" class="form-control" value="${location?.lng||""}" placeholder="106.7009" readonly required></div>
                  </div>
                </div>
              </div>
              <div class="card mb-20">
                <div class="card-header"><h3>Chi tiet</h3></div>
                <div class="card-body">
                  <div class="form-group"><label>Dia chi</label><input type="text" id="input-address" name="address" class="form-control" value="${location?.address||""}" placeholder="Tu dong dien khi chon tren ban do"></div>
                  <div class="form-row">
                    <div class="form-group"><label>Tu gio</label><input type="text" name="timeFrom" class="form-control" value="${location?.timeFrom||""}" placeholder="18:00"></div>
                    <div class="form-group"><label>Den gio</label><input type="text" name="timeTo" class="form-control" value="${location?.timeTo||""}" placeholder="22:00"></div>
                  </div>
                  <div class="form-group"><label>So nguoi</label><input type="number" name="peopleCount" class="form-control" value="${location?.peopleCount||1}" min="1"></div>
                </div>
              </div>
              <div class="card mb-20">
                <div class="card-header"><h3>Muc do khan cap</h3></div>
                <div class="card-body">
                  ${urgency.map(u => `
                    <label class="radio-card ${(location?.urgency||'normal')===u.value?'checked':''}">
                      <input type="radio" name="urgency" value="${u.value}" ${(location?.urgency||'normal')===u.value?"checked":""}
                        onchange="document.querySelectorAll('.radio-card').forEach(c=>c.classList.remove('checked'));this.closest('.radio-card').classList.add('checked')">
                      <span class="radio-dot" style="background:${u.color}"></span>
                      <span>${u.label}</span>
                    </label>`).join("")}
                </div>
              </div>
              <div style="display:flex;gap:12px;">
                <button type="submit" class="btn btn--primary btn--lg" style="flex:1">${location?"Luu thay doi":"Them dia diem"}</button>
                <a href="#/admin/dashboard" class="btn btn--ghost btn--lg">Huy</a>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>`,
};

function _adminNav(active) {
  const items = [
    { id: "dashboard", href: "#/admin/dashboard", label: "Bang dieu khien", icon: `<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>` },
    { id: "new", href: "#/admin/locations/new", label: "Them dia diem", icon: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>` },
    { id: "home-link", href: "#/home", label: "Xem ban do", icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` },
    { id: "profile-link", href: "#/profile", label: "Ho so", icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>` },
  ];
  return `<div class="admin-nav-label">Nguoi Dan Lua</div>` + items.map(item => `
    <a href="${item.href}" class="admin-nav-item ${active===item.id?'active':''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
      ${item.label}
    </a>`).join("");
}
