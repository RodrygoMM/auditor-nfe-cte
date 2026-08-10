const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

const statusEl = document.getElementById("status");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const clearSessionBtn = document.getElementById("clearSessionBtn");

function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.style.color = isError ? "#b91c1c" : "#111827";
}

function setStorage(items) {
    return new Promise((resolve) => {
        chrome.storage.local.set(items, () => resolve());
    });
}

function loadSavedEmail() {
    chrome.storage.local.get(["firebaseAuthEmail"], (result) => {
        if (result.firebaseAuthEmail) {
            emailInput.value = result.firebaseAuthEmail;
        }
    });
}

async function openExtensionPopup() {
    try {
        if (chrome.action && chrome.action.openPopup) {
            await chrome.action.openPopup();
            return;
        }
        if (chrome.browserAction && chrome.browserAction.openPopup) {
            await chrome.browserAction.openPopup();
            return;
        }
    } catch (error) {
        console.warn("Não foi possível abrir o popup automaticamente:", error);
    }

    if (chrome.tabs && chrome.tabs.create) {
        const url = chrome.runtime.getURL("popup.html");
        chrome.tabs.create({ url });
    }
}

function refreshPopupIfOpen() {
    const views = chrome.extension.getViews({ type: "popup" });
    if (views.length) {
        views.forEach((view) => {
            try {
                view.location.reload();
            } catch (error) {
                console.warn("Falha ao recarregar popup aberto:", error);
            }
        });
    }
}

async function signInTechnical() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password) {
        setStatus("Informe e-mail e senha técnica.", true);
        return;
    }

    setStatus("Autenticando...");
    try {
        const response = await fetch(AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Erro ao autenticar.");
        }

        await setStorage({ firebaseIdToken: data.idToken, firebaseRefreshToken: data.refreshToken, firebaseAuthEmail: email });
        setStatus("Sessão técnica salva. Abra a extensão principal.");
        passwordInput.value = "";
        refreshPopupIfOpen();
        openExtensionPopup();
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function clearSession() {
    await chrome.storage.local.remove(["firebaseIdToken", "firebaseRefreshToken", "firebaseAuthEmail"]);
    setStatus("Sessão técnica limpa.");
}

signInBtn.addEventListener("click", signInTechnical);
clearSessionBtn.addEventListener("click", clearSession);

loadSavedEmail();
