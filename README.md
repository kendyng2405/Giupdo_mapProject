# Trai Tim Viet — Ban do tu thien

Ung dung web ket noi nguoi muon tu thien voi dia diem can ho tro.
**Pure frontend SPA** — deploy thang len **GitHub Pages**, khong can server.

## Cau truc du an (MVC2 pattern trong JavaScript)

```
trai-tim-viet/
├── index.html                  # Shell HTML + Navbar
├── app.js                      # Entry point — dang ky routes (Front Controller)
├── models/
│   ├── firebase.js             # M — Firebase init
│   ├── UserModel.js            # M — User CRUD + rank logic
│   └── LocationModel.js        # M — Location CRUD
├── controllers/
│   ├── Router.js               # Front Controller (MVC2)
│   ├── AuthController.js       # C — Auth logic
│   ├── HomeController.js       # C — Map logic
│   ├── ProfileController.js    # C — Profile logic
│   └── AdminController.js      # C — Admin CRUD
├── views/
│   ├── ViewEngine.js           # V — render HTML strings vao #app
│   └── components/
│       └── Toast.js            # Component notification
└── public/
    └── css/
        └── main.css            # Design system (dark/light mode)
```

## Deploy len GitHub Pages

### 1. Tao repo GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/trai-tim-viet.git
git push -u origin main
```

### 2. Bat GitHub Pages
- Vao repo GitHub → Settings → Pages
- Source: **Deploy from a branch**
- Branch: **main** / **(root)**
- Save → doi ~1 phut

### 3. Firebase setup
Da config san trong `models/firebase.js`. Chi can:

1. Vao **Firebase Console** → Authentication → Sign-in method → Bat **Email/Password**
2. Vao **Firestore Database** → Tao database
3. Set **Firestore Security Rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /locations/{id} {
      allow read: if true;
      allow write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{uid} {
      allow read: if true;
      allow create: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid;
    }
  }
}
```

4. **Firebase Storage Rules**:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /locations/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 4. Tao tai khoan admin
1. Dang ky tai khoan binh thuong qua giao dien
2. Vao **Firestore Console** → collection `users` → tim document cua ban
3. Doi field `role` tu `"member"` thanh `"admin"`

## URLs

| URL | Mo ta | Quyen |
|-----|-------|-------|
| `/#/home` | Ban do chinh | Tat ca |
| `/#/login` | Dang nhap | Guest |
| `/#/register` | Dang ky | Guest |
| `/#/forgot-password` | Quen mat khau | Guest |
| `/#/profile` | Ho so + diem | Member/Admin |
| `/#/admin/dashboard` | Bang dieu khien | Admin |
| `/#/admin/locations/new` | Them dia diem | Admin |
| `/#/admin/locations/:id/edit` | Sua dia diem | Admin |

## He thong cap bac

| Cap bac | Diem toi thieu |
|---------|---------------|
| Dong Long | 0 |
| Tam Long Bac | 5 |
| Vang Tam | 15 |
| Trai Tim Vang | 30 |

**Admin** = "Nguoi Dan Lua" — toan quyen.

## APIs su dung (tat ca mien phi)

| Service | Muc dich | Chi phi |
|---------|---------|---------|
| Firebase Auth | Dang nhap, reset password | Free |
| Firebase Firestore | Database | Free (1GB) |
| Firebase Storage | Luu anh | Free (5GB) |
| Leaflet.js | Thu vien ban do | Free/OSS |
| OpenStreetMap/CARTO | Tile ban do | Free/Unlimited |
| Nominatim | Reverse geocoding | Free |
| Browser Geolocation | Vi tri nguoi dung | Built-in |
| GitHub Pages | Hosting | Free |
