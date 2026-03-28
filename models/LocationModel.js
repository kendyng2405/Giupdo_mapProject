// models/LocationModel.js — Model: Location data
import { db } from "./firebase.js";
import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const HELP_TYPES = [
  { value: "food",    label: "Thực phẩm",  color: "#F97316" },
  { value: "clothes", label: "Quần áo",    color: "#8B5CF6" },
  { value: "money",   label: "Tiền mặt",   color: "#10B981" },
  { value: "medical", label: "Y tế",        color: "#EF4444" },
  { value: "shelter", label: "Chỗ ở",       color: "#3B82F6" },
  { value: "other",   label: "Khác",        color: "#6B7280" },
];

export const URGENCY = [
  { value: "normal",   label: "Bình thường", color: "#22C55E" },
  { value: "urgent",   label: "Khẩn cấp",   color: "#EAB308" },
  { value: "critical", label: "Rất khẩn",   color: "#EF4444" },
];

export const LocationModel = {
  async create(data) {
    const imageUrl = data.imageUrl || null;
    const location = {
      title: data.title, description: data.description || "",
      lat: parseFloat(data.lat), lng: parseFloat(data.lng),
      address: data.address || "",
      helpTypes: data.helpTypes || [],
      urgency: data.urgency || "normal",
      peopleCount: parseInt(data.peopleCount) || 1,
      timeFrom: data.timeFrom || "", timeTo: data.timeTo || "",
      note: data.note || "", imageUrl,
      isActive: true, supportCount: 0,
      createdBy: data.createdBy,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "locations"), location);
    return { id: docRef.id, ...location };
  },

  async findAll(onlyActive = true) {
    // Simple query - no composite index needed. Filter isActive client-side.
    const q = query(collection(db, "locations"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (onlyActive) return all.filter(l => l.isActive !== false);
    return all;
  },

  async findById(id) {
    const snap = await getDoc(doc(db, "locations", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  async update(id, data) {
    const imageUrl = data.imageUrl || data.existingImageUrl || null;
    const update = {
      title: data.title, description: data.description || "",
      lat: parseFloat(data.lat), lng: parseFloat(data.lng),
      address: data.address || "", helpTypes: data.helpTypes || [],
      urgency: data.urgency || "normal",
      peopleCount: parseInt(data.peopleCount) || 1,
      timeFrom: data.timeFrom || "", timeTo: data.timeTo || "",
      note: data.note || "", imageUrl,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(doc(db, "locations", id), update);
    return { id, ...update };
  },

  async delete(id) {
    await deleteDoc(doc(db, "locations", id));
  },

  async toggleActive(id, isActive) {
    await updateDoc(doc(db, "locations", id), { isActive, updatedAt: serverTimestamp() });
  },

  async incrementSupport(id) {
    const snap = await getDoc(doc(db, "locations", id));
    if (!snap.exists()) return;
    await updateDoc(doc(db, "locations", id), {
      supportCount: (snap.data().supportCount || 0) + 1
    });
  },

  haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371, toR = d => d * Math.PI / 180;
    const dLat = toR(lat2 - lat1), dLng = toR(lng2 - lng1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toR(lat1))*Math.cos(toR(lat2))*Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  },
};
