const fileInput = document.getElementById("file-input");
const fileName = document.getElementById("file-name");
const form = document.getElementById("upload-form");
const statusEl = document.getElementById("status");
const extraFields = document.getElementById("xrechnung-fields");
const leitwegInput = document.getElementById("leitweg");
const supplierIdInput = document.getElementById("supplier-id");
const buyerEmailInput = document.getElementById("buyer-email");
const dropzone = document.querySelector(".dropzone");

// Zustand für den zweistufigen Ablauf
let currentXmlDoc = null;
let currentBaseName = null;
let upgradeNeeded = false;
let buyerEmailRequired = false;
let selectedFile = null;

function resetProcessingState() {
  currentXmlDoc = null;
  currentBaseName = null;
  upgradeNeeded = false;
  extraFields.style.display = "none";
  leitwegInput.value = "";
  supplierIdInput.value = "";
  buyerEmailRequired = false;

  if (buyerEmailInput) {
    buyerEmailInput.value = "";
    buyerEmailInput.required = false;
  }
}

if (dropzone) {
  // Standard-Browserverhalten (Datei im Tab öffnen) verhindern
  window.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  window.addEventListener("drop", (event) => {
    event.preventDefault();
  });

  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("dragend", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragover");

  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) {
    return;
  }

  // Zustand zurücksetzen, Auswahl beibehalten
  resetProcessingState();

  const file = files[0];

  // Nur PDFs akzeptieren
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    setStatus("Bitte eine PDF-Datei mit eingebetteter XML ablegen.", "error");
    return;
  }

  // Datei als aktuell ausgewählte Datei merken und UI aktualisieren
  selectedFile = file;
  fileName.textContent = file.name;
});
}

fileInput.addEventListener("change", () => {
  // Zustand zurücksetzen, neue Auswahl setzen
  resetProcessingState();

  if (fileInput.files && fileInput.files.length > 0) {
    selectedFile = fileInput.files[0];
    fileName.textContent = selectedFile.name;
  } else {
    selectedFile = null;
    fileName.textContent = "Noch keine Datei ausgewählt";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

    if (!selectedFile) {
    setStatus("Bitte zuerst eine PDF auswählen.", "error");
    return;
  }

  const file = selectedFile;

  // Phase 1: PDF prüfen und XML holen
  if (!currentXmlDoc) {
    setStatus("Analysiere PDF und extrahiere XML …", "info");

    try {
      const xmlText = await extractXmlFromPdf(file);

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "application/xml");

      // einfacher Check auf Parserfehler
      if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
        throw new Error("Die eingebettete XML konnte nicht geparst werden.");
      }

      currentXmlDoc = xmlDoc;
      currentBaseName = file.name.replace(/\.pdf$/i, "") || "xrechnung";

      const { isXRechnungAlready, guidelineValue } = inspectGuideline(xmlDoc);
      const { buyerEmailPresent } = inspectBuyerEmail(xmlDoc);

      if (isXRechnungAlready) {
        // bereits XRechnung, direkt ausgeben
        setStatus(
          "Die eingebettete XML ist bereits als XRechnung gekennzeichnet. Datei wird erzeugt …",
          "info"
        );
        const finalXml = serializeXml(xmlDoc);
        triggerDownload(finalXml, currentBaseName + "_xrechnung.xml");
        setStatus("XRechnung wurde lokal erzeugt und heruntergeladen.", "success");
        resetState();
        return;
      }

      // EN16931 / Factur-X ohne gesetzte XRechnung-Guideline
      upgradeNeeded = true;
      extraFields.style.display = "block";

      buyerEmailRequired = !buyerEmailPresent;
      if (buyerEmailInput) {
        buyerEmailInput.required = buyerEmailRequired;
      }

      if (buyerEmailRequired) {
        setStatus(
          "Die PDF enthält eine ZUGFeRD- bzw. Factur-X-Rechnung. Bitte ergänze jetzt falls nötig Leitweg-ID und Kundennummer und gib eine E-Mail-Adresse des Käufers an. Klicke danach erneut auf „In XRechnung umwandeln“.",
          "info"
        );
      } else {
        setStatus(
          "Die PDF enthält eine ZUGFeRD- bzw. Factur-X-Rechnung. Du kannst jetzt bei Bedarf Leitweg-ID und Kundennummer ergänzen und danach erneut auf „In XRechnung umwandeln“ klicken.",
          "info"
        );
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Fehler beim Verarbeiten der PDF.", "error");
      resetState();
    }

    return;
  }

  // Phase 2: vorhandene XML zur XRechnung ergänzen und laden
  if (!upgradeNeeded) {
    // Fallback: XML einfach ausgeben
    const xmlOut = serializeXml(currentXmlDoc);
    triggerDownload(xmlOut, (currentBaseName || "xrechnung") + "_xrechnung.xml");
    setStatus("XRechnung wurde lokal erzeugt und heruntergeladen.", "success");
    resetState();
    return;
  }

  if (buyerEmailRequired && (!buyerEmailInput || !buyerEmailInput.value.trim())) {
    setStatus(
      "Bitte die Käufer E-Mailadresse eingeben. Im Originaldokument ist keine elektronische Adresse vorhanden.",
      "error"
    );
    return;
  }

  try {
    setStatus("Erzeuge XRechnung mit ergänzten Angaben …", "info");
    const upgraded = upgradeToXRechnung(currentXmlDoc, {
      leitwegId: leitwegInput.value.trim(),
      supplierId: supplierIdInput.value.trim(),
      buyerEmail: buyerEmailInput ? buyerEmailInput.value.trim() : "",
    });

    const finalXml = serializeXml(upgraded);
    triggerDownload(finalXml, (currentBaseName || "xrechnung") + "_xrechnung.xml");
    setStatus("XRechnung wurde lokal erzeugt und heruntergeladen.", "success");
  } catch (err) {
    console.error(err);
    setStatus(err.message || "Fehler beim Erzeugen der XRechnung.", "error");
  } finally {
    resetState();
  }
});

function resetState() {
  // internen Zustand leeren
  resetProcessingState();

  // Dateiauswahl zurücksetzen
  selectedFile = null;
  if (fileInput) {
    fileInput.value = "";
  }
  if (fileName) {
    fileName.textContent = "Noch keine Datei ausgewählt";
  }
}

function setStatus(message, type) {
  statusEl.textContent = message;
  // Grundstil setzen
  statusEl.className = "status-pill";

  if (type === "error") {
    statusEl.classList.add("warn");
  } else if (type === "success") {
    statusEl.classList.add("ok");
  }
  // "info" bleibt neutral
}

/**
 * Liest die PDF und gibt die eingebettete XML als String zurück.
 */
async function extractXmlFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // einfache Suche nach einer ASCII-Sequenz
  function indexOfPattern(haystack, patternStr, from = 0) {
    const enc = new TextEncoder();
    const pattern = enc.encode(patternStr);
    outer: for (let i = from; i <= haystack.length - pattern.length; i++) {
      for (let j = 0; j < pattern.length; j++) {
        if (haystack[i + j] !== pattern[j]) continue outer;
      }
      return i;
    }
    return -1;
  }

  // 1. EmbeddedFile-Definition suchen
  const embeddedIdx = indexOfPattern(bytes, "/EmbeddedFile");
  if (embeddedIdx === -1) {
    throw new Error(
      "In der PDF wurde keine /EmbeddedFile-Sektion gefunden. Ist es wirklich eine ZUGFeRD-/Factur-X-PDF?"
    );
  }

  // 2. zugehörigen Stream nach /EmbeddedFile finden
  const streamIdx = indexOfPattern(bytes, "stream", embeddedIdx);
  if (streamIdx === -1) {
    throw new Error("Kein 'stream' für das EmbeddedFile gefunden.");
  }

  const endstreamIdx = indexOfPattern(bytes, "endstream", streamIdx);
  if (endstreamIdx === -1) {
    throw new Error("Kein 'endstream' für das EmbeddedFile gefunden.");
  }

  // 3. Rohdaten des EmbeddedFile-Streams ausschneiden
  let dataStart = streamIdx + "stream".length;

  // Zeilenende hinter "stream" überspringen (\r\n oder \n)
  if (bytes[dataStart] === 0x0d && bytes[dataStart + 1] === 0x0a) {
    dataStart += 2;
  } else if (bytes[dataStart] === 0x0a) {
    dataStart += 1;
  }

  let dataEnd = endstreamIdx;
  // Evtl. trailing \r, \n oder Leerzeichen vor endstream entfernen
  while (
    dataEnd > dataStart &&
    (bytes[dataEnd - 1] === 0x0d ||
      bytes[dataEnd - 1] === 0x0a ||
      bytes[dataEnd - 1] === 0x20)
  ) {
    dataEnd--;
  }

  if (dataEnd <= dataStart) {
    throw new Error("Der EmbeddedFile-Stream ist leer oder beschädigt.");
  }

  const streamBytes = bytes.slice(dataStart, dataEnd);

  const decoder = new TextDecoder("utf-8");
  let xmlText = "";

  // 4. Versuch: Stream direkt als UTF-8-XML lesen
  const preview = decoder.decode(streamBytes.slice(0, 200)).trimStart();
  const looksLikeXml =
    preview.startsWith("<?xml") ||
    preview.startsWith("<rsm:") ||
    preview.startsWith("<CrossIndustryInvoice") ||
    preview.startsWith("<rsm:CrossIndustryInvoice");

  if (looksLikeXml) {
    xmlText = decoder.decode(streamBytes);
  } else {
    // 5. Fallback: deflate-komprimierte XML dekomprimieren
    if (!window.pako) {
      throw new Error(
        "Der EmbeddedFile-Stream ist nicht direkt als XML lesbar und pako (Zlib) ist nicht geladen."
      );
    }

    try {
      const xmlBytes = window.pako.inflate(streamBytes);
      xmlText = decoder.decode(xmlBytes);
    } catch (e) {
      console.error(e);
      throw new Error(
        "Dekomprimierung des EmbeddedFile-Streams ist fehlgeschlagen. Möglicherweise kein unterstütztes ZUGFeRD-Format."
      );
    }
  }

  if (!xmlText || !xmlText.trim()) {
    throw new Error("Die extrahierte XML-Datei ist leer.");
  }

  return xmlText;
}

/**
 * Liest die Guideline-ID aus und prüft, ob bereits XRechnung gesetzt ist.
 */
function inspectGuideline(xmlDoc) {
  const NS_RAM =
    "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100";
  const NS_RSM =
    "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100";

  const ctxList = xmlDoc.getElementsByTagNameNS(
    NS_RSM,
    "GuidelineSpecifiedDocumentContextParameter"
  );
  if (!ctxList || ctxList.length === 0) {
    return { isXRechnungAlready: false, guidelineValue: null };
  }

  const param = ctxList[0];
  const ids = param.getElementsByTagNameNS(NS_RAM, "ID");
  if (!ids || ids.length === 0) {
    return { isXRechnungAlready: false, guidelineValue: null };
  }

  const value = (ids[0].textContent || "").trim();
  const lc = value.toLowerCase();
  const isX = lc.includes("xrechnung"); // einfacher Check auf XRechnung

  return { isXRechnungAlready: isX, guidelineValue: value };
}

function inspectBuyerEmail(xmlDoc) {
  const NS_RAM =
    "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100";

  const buyerList = xmlDoc.getElementsByTagNameNS(NS_RAM, "BuyerTradeParty");
  if (!buyerList || buyerList.length === 0) {
    return { buyerEmailPresent: false };
  }

  const buyer = buyerList[0];
  let commList = buyer.getElementsByTagNameNS(NS_RAM, "EndPointURIUniversalCommunication");
  if (!commList || commList.length === 0) {
    // Fallback für Varianten ohne EndPointURIUniversalCommunication
    commList = buyer.getElementsByTagNameNS(NS_RAM, "URIUniversalCommunication");
  }
  if (!commList || commList.length === 0) {
    return { buyerEmailPresent: false };
  }

  const uriList = commList[0].getElementsByTagNameNS(NS_RAM, "URIID");
  if (!uriList || uriList.length === 0) {
    return { buyerEmailPresent: false };
  }

  const value = (uriList[0].textContent || "").trim();
  return { buyerEmailPresent: !!value };
}

function upgradeToXRechnung(xmlDoc, { leitwegId, supplierId, buyerEmail }) {
  const NS_RAM =
    "urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100";
  const NS_RSM =
    "urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100";

  // 1. Guideline-ID auf XRechnung setzen
  const ctxList = xmlDoc.getElementsByTagNameNS(
    NS_RSM,
    "GuidelineSpecifiedDocumentContextParameter"
  );
  if (ctxList && ctxList.length > 0) {
    const ids = ctxList[0].getElementsByTagNameNS(NS_RAM, "ID");
    if (ids && ids.length > 0) {
      ids[0].textContent =
        "urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0";
    }
  }

  // 2. Leitweg-ID als BuyerReference (BT-10)
  const agrList = xmlDoc.getElementsByTagNameNS(
    NS_RAM,
    "ApplicableHeaderTradeAgreement"
  );
  if (agrList && agrList.length > 0) {
    const agr = agrList[0];
    const buyerRefs = agr.getElementsByTagNameNS(NS_RAM, "BuyerReference");

    if (leitwegId) {
      let buyerRefNode = null;
      if (buyerRefs && buyerRefs.length > 0) {
        buyerRefNode = buyerRefs[0];
      } else {
        buyerRefNode = xmlDoc.createElementNS(NS_RAM, "ram:BuyerReference");
        agr.insertBefore(buyerRefNode, agr.firstChild);
      }
      buyerRefNode.textContent = leitwegId;
    } else {
      // keine Leitweg-ID: leere BuyerReference-Elemente entfernen
      if (buyerRefs && buyerRefs.length > 0) {
        for (let i = buyerRefs.length - 1; i >= 0; i--) {
          const node = buyerRefs[i];
          if (!node.textContent || !node.textContent.trim()) {
            agr.removeChild(node);
          }
        }
      }
    }
  }

  // 3. Lieferantennummer beim Kunden als BuyerTradeParty/ID (BT-46)
  if (supplierId) {
    const buyerList = xmlDoc.getElementsByTagNameNS(NS_RAM, "BuyerTradeParty");
    if (buyerList && buyerList.length > 0) {
      const buyer = buyerList[0];

      let idNode = null;
      const existingIds = buyer.getElementsByTagNameNS(NS_RAM, "ID");
      if (existingIds && existingIds.length > 0) {
        idNode = existingIds[0];
      } else {
        idNode = xmlDoc.createElementNS(NS_RAM, "ram:ID");
        buyer.insertBefore(idNode, buyer.firstChild);
      }
      idNode.textContent = supplierId;
    }
  }

  // 4. Leere ID im SellerTradeParty entfernen (falls vorhanden)
  const sellerList = xmlDoc.getElementsByTagNameNS(NS_RAM, "SellerTradeParty");
  if (sellerList && sellerList.length > 0) {
    const seller = sellerList[0];
    const sellerIds = seller.getElementsByTagNameNS(NS_RAM, "ID");
    for (let i = sellerIds.length - 1; i >= 0; i--) {
      const idNode = sellerIds[i];
      if (idNode.parentNode === seller) {
        const text = (idNode.textContent || "").trim();
        if (!text) {
          seller.removeChild(idNode);
        }
      }
    }
  }

  // buyerEmail wird hier nicht in die XML übernommen,
  // damit die Struktur strikt im Schema bleibt.

  return xmlDoc;
}

function serializeXml(xmlDoc) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

// Hilfsfunktion für den XML-Download im Browser
function triggerDownload(text, filename) {
  const blob = new Blob([text], { type: "application/xml" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "xrechnung.xml";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);

  resetState();
}