import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export function protegerRuta(rolEsperado, callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "./index.html";
      return;
    }

    const snap = await getDoc(doc(db, "usuarios", user.uid));
    if (!snap.exists()) {
      await signOut(auth);
      window.location.href = "./index.html";
      return;
    }

    const perfil = snap.data();
    if (perfil.rol !== rolEsperado) {
      window.location.href = "./index.html";
      return;
    }

    callback(user, perfil);
  });
}