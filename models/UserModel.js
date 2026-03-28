// models/UserModel.js — Model: User data & rank logic
import { db, auth } from "./firebase.js";
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, orderBy, limit, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  updateProfile, updateEmail, sendEmailVerification,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export const RANKS = [
  { name: "Đồng Lòng",     minPoints: 0,  color: "#CD7F32", next: 5  },
  { name: "Tấm Lòng Bạc",  minPoints: 5,  color: "#A8B8C8", next: 15 },
  { name: "Vàng Tâm",      minPoints: 15, color: "#FFD700", next: 30 },
  { name: "Trái Tim Vàng", minPoints: 30, color: "#FF8C00", next: null },
];

export function getRankByPoints(points) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (points >= r.minPoints) rank = r;
  }
  const idx = RANKS.indexOf(rank);
  const next = RANKS[idx + 1] || null;
  const progress = next
    ? Math.min(100, Math.round(((points - rank.minPoints) / (next.minPoints - rank.minPoints)) * 100))
    : 100;
  return { ...rank, idx, next, progress, pointsToNext: next ? next.minPoints - points : 0 };
}

export const UserModel = {
  async create(uid, data) {
    const user = {
      uid, email: data.email, fullName: data.fullName,
      phone: data.phone || "", role: "member",
      points: 0, supportedLocations: [],
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", uid), user);
    return user;
  },

  async findById(uid) {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return { ...data, rank: getRankByPoints(data.points || 0) };
  },

  async update(uid, data) {
    await updateDoc(doc(db, "users", uid), { ...data, updatedAt: new Date().toISOString() });
  },

  async addSupportedLocation(uid, locationId) {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const user = snap.data();
    const supported = user.supportedLocations || [];
    if (supported.includes(locationId)) return { alreadySupported: true };
    const newPoints = (user.points || 0) + 1;
    await updateDoc(doc(db, "users", uid), {
      supportedLocations: [...supported, locationId],
      points: newPoints,
      updatedAt: new Date().toISOString(),
    });
    return { points: newPoints, rank: getRankByPoints(newPoints) };
  },

  async getLeaderboard(n = 10) {
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(n));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { ...data, rank: getRankByPoints(data.points || 0) };
    });
  },

  async updateProfile(uid, { fullName, phone }) {
    await updateDoc(doc(db, "users", uid), { fullName, phone, updatedAt: new Date().toISOString() });
    if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: fullName });
  },

  async changeEmail(newEmail) {
    if (auth.currentUser) {
      await updateEmail(auth.currentUser, newEmail);
      await sendEmailVerification(auth.currentUser);
    }
  },

  async sendPasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
  },
};
