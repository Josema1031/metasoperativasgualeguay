import { auth, db } from "./firebase-init.js";
import { protegerRuta } from "./guard.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const bienvenida = document.getElementById("bienvenida");
const metaTotal = document.getElementById("metaTotal");
const resultadosTotal = document.getElementById("resultadosTotal");
const cumplimiento = document.getElementById("cumplimiento");
const listaResultados = document.getElementById("listaResultados");
const btnSalir = document.getElementById("btnSalir");

function getMesActual() {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

protegerRuta("personal", async (user, perfil) => {
  const mes = getMesActual();
  bienvenida.textContent = `${perfil.nombre || "Personal"} | ${perfil.seccion || "Gualeguay"}`;

  try {
    const metaId = `${mes}_${user.uid}`;
    const metaSnap = await getDoc(doc(db, "metasMensuales", metaId));
    const meta = metaSnap.exists() ? metaSnap.data() : null;

    const q = query(
      collection(db, "resultadosOperativos"),
      where("uid", "==", user.uid),
      where("mes", "==", mes),
      orderBy("fecha", "desc")
    );

    const resSnap = await getDocs(q);
    const resultados = [];
    resSnap.forEach((d) => resultados.push({ id: d.id, ...d.data() }));

    const objetivo = meta?.objetivoMinimo || 17;
    const total = resultados.length;
    const porcentaje = objetivo > 0 ? Math.min(100, Math.round((total / objetivo) * 100)) : 0;

    metaTotal.textContent = objetivo;
    resultadosTotal.textContent = total;
    cumplimiento.textContent = `${porcentaje}%`;

    listaResultados.innerHTML = resultados.length
      ? resultados.map((item) => `
        <div class="item-simple">
          <div class="item-head">
            <strong>${item.tipo}</strong>
            <span class="badge">${item.categoria}</span>
          </div>
          <span>${item.fecha} | ${item.puntos || 1} punto/s</span>
          <p>${item.detalle || "Sin detalle"}</p>
        </div>
      `).join("")
      : `<p class="muted">Aún no registraste resultados este mes.</p>`;
  } catch (error) {
    console.error("Error al cargar panel personal:", error);
    listaResultados.innerHTML = `<p class="msg error">No se pudo cargar tu información. Revisá reglas o índices de Firestore.</p>`;
  }

  btnSalir?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "./index.html";
  });
});
