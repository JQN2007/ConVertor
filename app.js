// =============================================
// MAYÚSCULAS / MINÚSCULAS
// =============================================

function applyCase(text, mode) {
  switch (mode) {
    case "upper":    return text.toUpperCase();
    case "lower":    return text.toLowerCase();
    case "title":    return text.replace(/\b\w/g, c => c.toUpperCase());
    case "sentence": return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    default:         return text;
  }
}

// =============================================
// TRADUCCIÓN — MyMemory API (gratuita, sin registro)
// Límite: 5000 palabras por día
// =============================================

async function translateText(text, sourceLang, targetLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudo conectar con el servicio de traducción.");
  }

  const data = await response.json();

  if (data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Error en la traducción.");
  }

  return data.responseData.translatedText;
}

// =============================================
// SELECTOR DE CASO (botones activos)
// =============================================

let selectedCase = "none";

document.querySelectorAll(".case-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".case-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedCase = btn.dataset.case;
  });
});

// =============================================
// SLIDER DE TAMAÑO
// =============================================

const sizeRange = document.getElementById("sizeRange");
const sizeValue = document.getElementById("sizeValue");

sizeRange.addEventListener("input", () => {
  sizeValue.textContent = sizeRange.value;
});

// =============================================
// BOTÓN PRINCIPAL — APLICAR
// =============================================

document.getElementById("applyBtn").addEventListener("click", async () => {
  const input      = document.getElementById("inputText").value.trim();
  const font       = document.getElementById("fontSelect").value;
  const size       = sizeRange.value + "px";
  const targetLang = document.getElementById("langSelect").value;
  const sourceLang = document.getElementById("sourceLang").value; // idioma del texto que escribís
  const resultBox  = document.getElementById("resultBox");
  const loadingMsg = document.getElementById("loadingMsg");
  const errorMsg   = document.getElementById("errorMsg");

  if (!input) {
    errorMsg.textContent   = "Escribí algo primero.";
    errorMsg.style.display = "block";
    return;
  }

  errorMsg.style.display = "none";

  // 1. Aplicar mayús/minús
  let result = applyCase(input, selectedCase);

  // 2. Traducir si se eligió un idioma destino
  if (targetLang !== "none") {
    loadingMsg.style.display = "block";
    resultBox.textContent    = "";

    try {
      result = await translateText(result, sourceLang, targetLang);
    } catch (err) {
      errorMsg.textContent     = "Error: " + err.message;
      errorMsg.style.display   = "block";
      loadingMsg.style.display = "none";
      return;
    }

    loadingMsg.style.display = "none";
  }

  // 3. Mostrar resultado
  resultBox.style.fontFamily = font;
  resultBox.style.fontSize   = size;
  resultBox.textContent      = result;
});

// =============================================
// BOTÓN COPIAR
// =============================================

document.getElementById("copyBtn").addEventListener("click", () => {
  const text = document.getElementById("resultBox").textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn      = document.getElementById("copyBtn");
    const original = btn.textContent;
    btn.textContent = "¡Copiado!";
    setTimeout(() => btn.textContent = original, 1500);
  });
});