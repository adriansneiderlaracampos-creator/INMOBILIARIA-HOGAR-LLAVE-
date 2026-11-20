const API_URL = "http://127.0.0.1:8000/api/propiedades";
const IMAGEN_DEFECTO = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80";

let propiedadesCache = [];
let filtroActual = "todos";

const cardsGrid = document.getElementById("cards-grid");
const contadorTotal = document.getElementById("contador-total");
const formInmueble = document.getElementById("form-inmueble");
const tituloVista = document.getElementById("titulo-vista");
const navButtons = document.querySelectorAll(".nav-btn");

function formatearPesos(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(valor);
}

async function cargarPropiedades() {
    try {
        const respuesta = await fetch(API_URL);
        if (!respuesta.ok) throw new Error("Error al consultar inmuebles");

        propiedadesCache = await respuesta.json();
        contadorTotal.textContent = propiedadesCache.length;
        renderizarTarjetas();
    } catch (error) {
        console.error("Error:", error);
        cardsGrid.innerHTML = `<p>No se pudo conectar con el servidor FastAPI.</p>`;
    }
}

function renderizarTarjetas() {
    let listaFiltrada = propiedadesCache;

    if (filtroActual === "disponibles") {
        listaFiltrada = propiedadesCache.filter(item => item.disponible === true);
        tituloVista.textContent = "Inmuebles Disponibles para Arriendo";
    } else if (filtroActual === "arrendados") {
        listaFiltrada = propiedadesCache.filter(item => item.disponible === false);
        tituloVista.textContent = "Inmuebles Arrendados";
    } else {
        tituloVista.textContent = "Portafolio Completo de Propiedades";
    }

    cardsGrid.innerHTML = "";

    if (listaFiltrada.length === 0) {
        cardsGrid.innerHTML = `<p>No hay inmuebles registrados en esta categoría.</p>`;
        return;
    }

    listaFiltrada.forEach(inmueble => {
        const card = document.createElement("article");
        card.className = "card";

        const badgeClase = inmueble.disponible ? "badge-disponible" : "badge-arrendado";
        const badgeTexto = inmueble.disponible ? "Disponible" : "Arrendado";
        const botonEstadoClase = inmueble.disponible ? "btn-estado-arrendar" : "btn-estado-liberar";
        const botonEstadoTexto = inmueble.disponible ? "✓ Arrendar" : "↺ Liberar";
        const imagenSrc = inmueble.imagen_url || IMAGEN_DEFECTO;

        card.innerHTML = `
            <img
                src="${imagenSrc}"
                alt="${inmueble.titulo_anuncio}"
                class="card-img"
                onerror="this.onerror=null; this.src='${IMAGEN_DEFECTO}';"
            >
            <div class="card-body">
                <div class="card-top">
                    <h3 class="card-title">${inmueble.titulo_anuncio}</h3>
                    <span class="badge ${badgeClase}">${badgeTexto}</span>
                </div>
                <p class="card-zona">
                    <i class="fa-solid fa-location-dot"></i> ${inmueble.zona_ciudad}
                </p>
                <p class="card-precio">
                    ${formatearPesos(inmueble.canon_arriendo)} <span>/ mes</span>
                </p>
                <div class="card-actions">
                    <button class="btn-card ${botonEstadoClase}" onclick="cambiarEstado('${inmueble._id}', ${inmueble.disponible})">
                        ${botonEstadoTexto}
                    </button>
                    <button class="btn-card btn-eliminar" onclick="eliminarInmueble('${inmueble._id}')">
                        <i class="fa-solid fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;

        cardsGrid.appendChild(card);
    });
}

formInmueble.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoInmueble = {
        titulo_anuncio: document.getElementById("titulo_anuncio").value.trim(),
        zona_ciudad: document.getElementById("zona_ciudad").value.trim(),
        canon_arriendo: parseFloat(document.getElementById("canon_arriendo").value),
        imagen_url: document.getElementById("imagen_url").value.trim(),
        disponible: document.getElementById("disponible").value === "true"
    };

    try {
        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoInmueble)
        });

        if (!respuesta.ok) throw new Error("Error al guardar el inmueble");

        formInmueble.reset();
        await cargarPropiedades();
    } catch (error) {
        console.error("Error al crear:", error);
        alert("Hubo un error al publicar el inmueble.");
    }
});

async function cambiarEstado(id, estadoActual) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ disponible: !estadoActual })
        });

        if (!respuesta.ok) throw new Error("Error al actualizar estado");
        await cargarPropiedades();
    } catch (error) {
        console.error("Error al actualizar:", error);
    }
}

async function eliminarInmueble(id) {
    if (!confirm("¿Seguro que deseas eliminar este inmueble del portafolio?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!respuesta.ok) throw new Error("Error al eliminar inmueble");
        await cargarPropiedades();
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

navButtons.forEach(boton => {
    boton.addEventListener("click", () => {
        navButtons.forEach(btn => btn.classList.remove("active"));
        boton.classList.add("active");
        filtroActual = boton.getAttribute("data-filtro");
        renderizarTarjetas();
    });
});

document.addEventListener("DOMContentLoaded", cargarPropiedades);