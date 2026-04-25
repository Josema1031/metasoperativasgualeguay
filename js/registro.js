import { db } from "./firebase-init.js";
import { protegerRuta } from "./guard.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const form = document.getElementById("formRegistro");
const msg = document.getElementById("msg");
const fechaInput = document.getElementById("fecha");
const btnVolver = document.getElementById("btnVolver");

fechaInput.value = new Date().toISOString().split("T")[0];

function getMesDesdeFecha(fecha) {
  return fecha.slice(0, 7);
}

function puntosPorTipo(tipo) {
  const mapa = {
    "Infracción CNRT": 1,
    "Artículo 24": 1,
    "Artículo 27": 1,
    "SENASA": 1,
    "Procedimiento de droga": 3,
    "Procedimiento de Arma": 3,
    "Procedimiento de documentacion adulterado/falsa": 3,
    "Solicitud de secuestro": 2,     
    "Solicitud de Captura": 2, 
    "Infracción ley de pesca": 1,
    "Infracción ley de caza": 1,
    " Citacion/notificacion": 1,
    "Acta de apertura de precinto": 1 
       
  };
  return mapa[tipo] || 1;
}

protegerRuta("personal", (user, perfil) => {
  btnVolver?.addEventListener("click", () => {
    window.location.href = "./dashboard-personal.html";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("fecha").value;
    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value;
    const detalle = document.getElementById("detalle").value.trim();

    if (!fecha || !tipo || !categoria) {
      msg.textContent = "Completá fecha, tipo y categoría.";
      return;
    }

    msg.textContent = "Guardando...";

    try {
      await addDoc(collection(db, "resultadosOperativos"), {
        uid: user.uid,
        nombre: perfil.nombre || "Sin nombre",
        dni: perfil.dni || "Sin DNI",
        seccion: perfil.seccion || "Gualeguay",
        mes: getMesDesdeFecha(fecha),
        fecha,
        tipo,
        categoria,
        detalle,
        puntos: puntosPorTipo(tipo),
        createdAt: serverTimestamp()
      });

      msg.textContent = "Resultado guardado correctamente.";
      form.reset();
      fechaInput.value = new Date().toISOString().split("T")[0];
    } catch (error) {
      console.error("Error al guardar resultado:", error);
      msg.textContent = "No se pudo guardar. Revisá reglas de Firestore o conexión.";
    }
  });
});
