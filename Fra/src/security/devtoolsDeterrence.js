const DEFAULT_OPTIONS = {
  enabled: true,
  dimensionThreshold: 160,
  checkInterval: 1000,
  warningTitle: "Acceso restringido",
  warningMessage:
    "Por seguridad, la interfaz se pausa mientras las herramientas de desarrollo parecen estar abiertas.",
};

const blockedConsoleMessage =
  "El uso de la consola esta restringido en esta aplicacion.";

const blockedConsoleMethods = [
  "assert",
  "clear",
  "count",
  "debug",
  "dir",
  "dirxml",
  "error",
  "group",
  "groupCollapsed",
  "groupEnd",
  "info",
  "log",
  "profile",
  "profileEnd",
  "table",
  "time",
  "timeEnd",
  "timeLog",
  "trace",
  "warn",
];

function isBlockedShortcut(event) {
  const key = event.key.toLowerCase();
  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  return (
    key === "f12" ||
    (ctrlOrMeta && event.shiftKey && ["i", "j"].includes(key)) ||
    (ctrlOrMeta && key === "u")
  );
}

function hasDevtoolsLikeDimensions(threshold) {
  if (typeof window === "undefined") return false;

  const widthGap = Math.abs(window.outerWidth - window.innerWidth);
  const heightGap = Math.abs(window.outerHeight - window.innerHeight);

  return widthGap > threshold || heightGap > threshold;
}

function createWarningOverlay(options) {
  const overlay = document.createElement("div");
  overlay.className = "devtools-deterrence-overlay";
  overlay.setAttribute("role", "alert");
  overlay.setAttribute("aria-live", "assertive");
  overlay.innerHTML = `
    <div class="devtools-deterrence-dialog">
      <strong>${options.warningTitle}</strong>
      <span>${options.warningMessage}</span>
    </div>
  `;

  return overlay;
}

function injectStyles() {
  const style = document.createElement("style");
  style.dataset.devtoolsDeterrence = "true";
  style.textContent = `
    body.devtools-deterrence-paused {
      overflow: hidden;
      user-select: none;
    }

    body.devtools-deterrence-paused > #root {
      filter: blur(3px);
      pointer-events: none;
    }

    .devtools-deterrence-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      padding: 24px;
      background: rgba(4, 12, 24, 0.68);
      backdrop-filter: blur(4px);
    }

    .devtools-deterrence-dialog {
      width: min(420px, 100%);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 8px;
      padding: 20px 22px;
      color: #fff;
      background: #10243a;
      box-shadow: 0 18px 55px rgba(0, 0, 0, 0.25);
      text-align: center;
    }

    .devtools-deterrence-dialog strong {
      display: block;
      margin-bottom: 8px;
      font-size: 1.05rem;
    }

    .devtools-deterrence-dialog span {
      display: block;
      color: rgba(255, 255, 255, 0.82);
      line-height: 1.45;
    }
  `;

  document.head.appendChild(style);
  return style;
}

function interceptConsole() {
  const originalConsole = {};

  blockedConsoleMethods.forEach((method) => {
    if (typeof console[method] !== "function") return;

    originalConsole[method] = console[method];
    console[method] = (...args) => {
      if (method === "warn" || method === "error") {
        originalConsole[method].call(console, blockedConsoleMessage);
        return;
      }

      if (args.length > 0 && originalConsole.info) {
        originalConsole.info.call(console, blockedConsoleMessage);
      }
    };
  });

  return () => {
    Object.entries(originalConsole).forEach(([method, originalMethod]) => {
      console[method] = originalMethod;
    });
  };
}

export function setupDevtoolsDeterrence(options = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };

  if (!settings.enabled || typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const overlay = createWarningOverlay(settings);
  const style = injectStyles();
  const restoreConsole = interceptConsole();
  let overlayVisible = false;
  let checkTimer = null;

  const showWarning = () => {
    if (overlayVisible) return;

    document.body.classList.add("devtools-deterrence-paused");
    document.body.appendChild(overlay);
    overlayVisible = true;
  };

  const hideWarning = () => {
    if (!overlayVisible) return;

    document.body.classList.remove("devtools-deterrence-paused");
    overlay.remove();
    overlayVisible = false;
  };

  const evaluateWindow = () => {
    if (hasDevtoolsLikeDimensions(settings.dimensionThreshold)) {
      showWarning();
      return;
    }

    hideWarning();
  };

  const handleKeydown = (event) => {
    if (!isBlockedShortcut(event)) return;

    event.preventDefault();
    event.stopPropagation();
    showWarning();
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  document.addEventListener("keydown", handleKeydown, true);
  document.addEventListener("contextmenu", handleContextMenu, true);
  window.addEventListener("resize", evaluateWindow);
  checkTimer = window.setInterval(evaluateWindow, settings.checkInterval);
  evaluateWindow();

  return () => {
    document.removeEventListener("keydown", handleKeydown, true);
    document.removeEventListener("contextmenu", handleContextMenu, true);
    window.removeEventListener("resize", evaluateWindow);
    window.clearInterval(checkTimer);
    hideWarning();
    style.remove();
    restoreConsole();
  };
}
