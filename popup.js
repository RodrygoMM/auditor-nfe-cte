const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const REFRESH_URL = `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`;

const statusEl = document.getElementById("status");
const technicalPanel = document.getElementById("technicalPanel");
const mainPanel = document.getElementById("mainPanel");
const searchPanel = document.getElementById("searchPanel");
const adminAuthPanel = document.getElementById("adminAuthPanel");
const adminDashboardPanel = document.getElementById("adminDashboardPanel");
const adminUserPanel = document.getElementById("adminUserPanel");
const adminPlatePanel = document.getElementById("adminPlatePanel");
const usuarioSelect = document.getElementById("usuario");
const saveBtn = document.getElementById("saveBtn");
const searchBtn = document.getElementById("searchBtn");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBtn = document.getElementById("signInBtn");
const clearSessionBtn = document.getElementById("clearSessionBtn");
const searchResult = document.getElementById("searchResult");
const searchUsuarioSelect = document.getElementById("searchUsuario");
const searchDataInput = document.getElementById("searchData");
const openExtractBtn = document.getElementById("openExtractBtn");
const openSearchBtn = document.getElementById("openSearchBtn");
const extractPanel = document.getElementById("extractPanel");
const searchBackBtn = document.getElementById("searchBackBtn");
const extractDailyBtn = document.getElementById("extractDailyBtn");
const extractBackBtn = document.getElementById("extractBackBtn");
const extractDayDate = document.getElementById("extractDayDate");
const searchPlacaSelect = document.getElementById("searchPlaca");
const extractResult = document.getElementById("extractResult");
const editEventPanel = document.getElementById("editEventPanel");
const editEventPlaca = document.getElementById("editEventPlaca");
const editEventUsuario = document.getElementById("editEventUsuario");
const editEventCliente = document.getElementById("editEventCliente");
const saveEventEditBtn = document.getElementById("saveEventEditBtn");
const cancelEventEditBtn = document.getElementById("cancelEventEditBtn");
const editEventBtn = document.getElementById("editEventBtn");
const auditPanel = document.getElementById("auditPanel");
const auditPlacaSelect = document.getElementById("auditPlaca");
const auditStartDate = document.getElementById("auditStartDate");
const auditEndDate = document.getElementById("auditEndDate");
const auditSearchBtn = document.getElementById("auditSearchBtn");
const auditBackBtn = document.getElementById("auditBackBtn");
const auditResult = document.getElementById("auditResult");
const productivityPanel = document.getElementById("productivityPanel");
const openProductivityBtn = document.getElementById("openProductivityBtn");
const productivityDate = document.getElementById("productivityDate");
const productivitySearchBtn = document.getElementById("productivitySearchBtn");
const productivityBackBtn = document.getElementById("productivityBackBtn");
const productivityResult = document.getElementById("productivityResult");
const adminAccessBtn = document.getElementById("adminAccessBtn");
const adminScreenPanel = document.getElementById("adminScreenPanel");
const adminPinInput = document.getElementById("adminPin");
const adminPinConfirmBtn = document.getElementById("adminPinConfirmBtn");
const adminPinCancelBtn = document.getElementById("adminPinCancelBtn");
const adminUsersBtn = document.getElementById("adminUsersBtn");
const adminPlatesBtn = document.getElementById("adminPlatesBtn");
const adminEditEventBtn = document.getElementById("adminEditEventBtn");
const adminAuditBtn = document.getElementById("adminAuditBtn");

const adminUserSelect = document.getElementById("adminUserSelect");
const adminPlateSelect = document.getElementById("adminPlateSelect");

const userNameInput = document.getElementById("userName");
const userPasswordInput = document.getElementById("userPassword");
const userPasswordRow = document.getElementById("userPasswordRow");

const PREFERRED_USER_KEY = "preferredUsuario";
const userLiderCheckbox = document.getElementById("userLider");
const userAtivoCheckbox = document.getElementById("userAtivo");
const saveUserBtn = document.getElementById("saveUserBtn");
const deleteUserBtn = document.getElementById("deleteUserBtn");
const clearUserBtn = document.getElementById("clearUserBtn");

const placaInput = document.getElementById("placaInput");
const placaDropdown = document.getElementById("placaDropdown");
const plateNameInput = document.getElementById("plateName");
const plateAtivoCheckbox = document.getElementById("plateAtivo");
const savePlateBtn = document.getElementById("savePlateBtn");
const deletePlateBtn = document.getElementById("deletePlateBtn");
const clearPlateBtn = document.getElementById("clearPlateBtn");
const closePlatePanelBtn = document.getElementById("closePlatePanelBtn");

let idToken = null;
let refreshToken = null;
let usuarios = [];
let firestoreUsuarios = [];
let placas = [];
let allPlacasOptions = [];
let editingUserId = null;
let editingPlateId = null;
let editingEventDoc = null;
let adminContext = "admin";
let currentAdminLeaderName = null;
let adminSearchMode = false;

function safeSetInnerHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

function setStatus(message, isError = false) {
    if (!statusEl) return;

    statusEl.textContent = message || "";
    statusEl.classList.remove("status-success", "status-error", "status-info");

    if (!message) {
        statusEl.classList.add("hidden");
        return;
    }

    statusEl.classList.remove("hidden");

    if (isError) {
        statusEl.classList.add("status-error");
    } else {
        statusEl.classList.add("status-success");
    }

    clearTimeout(statusEl._hideTimeout);
    statusEl._hideTimeout = setTimeout(() => {
        statusEl.textContent = "";
        statusEl.classList.remove("status-success", "status-error", "status-info");
        statusEl.classList.add("hidden");
    }, 3000);
}

async function refreshSession() {
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(REFRESH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
        });
        const data = await response.json();
        if (!response.ok) {
            return false;
        }

        idToken = data.id_token;
        refreshToken = data.refresh_token;
        await chrome.storage.local.set({ firebaseIdToken: idToken, firebaseRefreshToken: refreshToken });
        return true;
    } catch (error) {
        return false;
    }
}

function padBase64(base64) {
    const padding = base64.length % 4;
    if (padding === 2) return `${base64}==`;
    if (padding === 3) return `${base64}=`;
    if (padding === 1) return `${base64}===`;
    return base64;
}

function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = token.split(".")[1];
        if (!payload) return true;
        const decoded = JSON.parse(atob(padBase64(payload.replace(/-/g, "+").replace(/_/g, "/"))));
        return typeof decoded.exp !== "number" || decoded.exp * 1000 <= Date.now();
    } catch (error) {
        return true;
    }
}

async function loadSession() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["firebaseIdToken", "firebaseRefreshToken"], async (result) => {
            idToken = result.firebaseIdToken || null;
            refreshToken = result.firebaseRefreshToken || null;

            const storedState = {
                idTokenSaved: !!idToken,
                refreshTokenSaved: !!refreshToken,
                idTokenExpired: idToken ? isTokenExpired(idToken) : true,
            };
            console.log("Sessão técnica armazenada:", storedState);

            if (idToken && !isTokenExpired(idToken)) {
                resolve(true);
                return;
            }

            if (refreshToken) {
                const refreshed = await refreshSession();
                if (refreshed) {
                    resolve(true);
                    return;
                }
            }

            resolve(false);
        });
    });
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

function loadPreferredUsuario() {
    return new Promise((resolve) => {
        chrome.storage.local.get([PREFERRED_USER_KEY], (result) => {
            resolve(result[PREFERRED_USER_KEY] || null);
        });
    });
}

function savePreferredUsuario(usuario) {
    if (!usuario) {
        return Promise.resolve();
    }
    return setStorage({ [PREFERRED_USER_KEY]: usuario });
}

async function loadLocalAccessLists() {
    try {
        const response = await fetch(chrome.runtime.getURL("usuarios_placas.json"));
        if (!response.ok) {
            throw new Error(`Falha ao carregar lista local: ${response.status}`);
        }

        const data = await response.json();
        const usuariosLocais = Array.isArray(data.usuarios)
            ? data.usuarios
                .filter((nome) => String(nome || "").trim())
                .map((nome, index) => ({
                    id: `local-user-${index + 1}`,
                    nome: String(nome).trim(),
                    lider: false,
                    ativo: true,
                    password: "",
                }))
            : [];

        const placasLocais = Array.isArray(data.placas)
            ? data.placas
                .filter((placa) => String(placa || "").trim())
                .map((placa, index) => ({
                    id: `local-plate-${index + 1}`,
                    placa: String(placa).trim().toUpperCase(),
                    ativo: true,
                }))
            : [];

        return { usuarios: usuariosLocais, placas: placasLocais };
    } catch (error) {
        console.warn("Não foi possível carregar a lista local de usuários/placas:", error);
        return { usuarios: [], placas: [] };
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
        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Erro ao autenticar.");
        }

        await setStorage({
            firebaseIdToken: data.idToken,
            firebaseRefreshToken: data.refreshToken,
            firebaseAuthEmail: email,
        });

        setStatus("Sessão técnica salva. Recargando... ");
        passwordInput.value = "";
        await init();
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function clearSession() {
    await chrome.storage.local.remove(["firebaseIdToken", "firebaseRefreshToken", "firebaseAuthEmail"]);
    setStatus("Sessão técnica limpa.");
    technicalPanel.classList.remove("hidden");
    mainPanel.classList.add("hidden");
    searchPanel.classList.add("hidden");
}

function getFirestoreStringValue(field) {
    if (field === undefined || field === null) return "";
    if (typeof field === "string" || typeof field === "number" || typeof field === "boolean") return String(field);
    if (field.stringValue !== undefined) return field.stringValue;
    if (field.integerValue !== undefined) return String(field.integerValue);
    if (field.doubleValue !== undefined) return String(field.doubleValue);
    if (field.booleanValue !== undefined) return String(field.booleanValue);
    if (field.nullValue !== undefined) return "";
    return "";
}

function getFirestoreBooleanValue(field) {
    if (field === undefined || field === null) return false;
    if (typeof field === "boolean") return field;
    if (field.booleanValue !== undefined) return field.booleanValue;
    if (field.integerValue !== undefined) return String(field.integerValue).trim() === "1";
    const str = getFirestoreStringValue(field).trim().toLowerCase();
    if (str === "true" || str === "1") return true;
    if (str === "false" || str === "0") return false;
    return false;
}

function formatDateTime(timestamp) {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month} ${hours}:${minutes}`;
}

function buildFirestoreDocument(fields) {
    return { fields };
}

async function parseResponseBody(response) {
    const text = await response.text();
    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return { rawText: text };
    }
}

async function fetchWithAuth(url, options = {}) {
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${idToken}`,
    };

    let response = await fetch(url, { ...options, headers });
    if ((response.status === 401 || response.status === 403) && refreshToken) {
        const refreshed = await refreshSession();
        if (refreshed) {
            const retryHeaders = {
                ...options.headers,
                Authorization: `Bearer ${idToken}`,
            };
            response = await fetch(url, { ...options, headers: retryHeaders });
        }
    }
    return response;
}

async function createDocument(collection, fields, documentId) {
    const docPath = documentId
        ? `${FIRESTORE_URL}/${collection}?documentId=${encodeURIComponent(documentId)}`
        : `${FIRESTORE_URL}/${collection}`;
    const response = await fetchWithAuth(docPath, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buildFirestoreDocument(fields)),
    });
    const data = await parseResponseBody(response);
    if (!response.ok) {
        const message = data?.error?.message || data?.rawText || `Falha ao criar documento em ${collection}`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
    }
    return data || {};
}

async function ensureFirestoreCollections() {
    // O arquivo local continua sendo a fonte de verdade para usuários/placas.
    // O Firestore é usado apenas para registrar os eventos, então não bloqueamos o fluxo se não estiver disponível.
    return;
}

async function patchDocument(documentName, fields) {
    const fieldPaths = Object.keys(fields)
        .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
        .join("&");
    const url = `https://firestore.googleapis.com/v1/${documentName}?${fieldPaths}`;
    const response = await fetchWithAuth(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(buildFirestoreDocument(fields)),
    });
    const data = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(data?.error?.message || data?.rawText || "Falha ao atualizar documento.");
    }
    return data || {};
}

async function fetchFirestoreUsuarios() {
    const url = `${FIRESTORE_URL}/usuarios?pageSize=200`;
    const response = await fetchWithAuth(url, {
        headers: { "Content-Type": "application/json" },
    });
    const data = await parseResponseBody(response);
    if (!response.ok) {
        throw new Error(data?.error?.message || data?.rawText || "Falha ao carregar usuários do Firestore.");
    }
    return Array.isArray(data?.documents) ? data.documents : [];
}

async function loadFirestoreUsuarios() {
    try {
        const docs = await fetchFirestoreUsuarios();
        firestoreUsuarios = docs
            .map((doc) => {
                const fields = doc.fields || {};
                return {
                    id: doc.name,
                    nome: getFirestoreStringValue(fields.nome),
                    lider: getFirestoreBooleanValue(fields.lider),
                    ativo: fields.ativo !== undefined ? getFirestoreBooleanValue(fields.ativo) : true,
                    password: getFirestoreStringValue(fields.password),
                };
            })
            .filter((user) => user.nome);
        return firestoreUsuarios;
    } catch (error) {
        setStatus("Erro ao carregar usuários do Firestore.", true);
        return [];
    }
}

function toggleUserPasswordField() {
    if (!userLiderCheckbox || !userPasswordRow || !userPasswordInput) {
        return;
    }

    if (userLiderCheckbox.checked) {
        userPasswordRow.classList.remove("hidden");
        userPasswordInput.setAttribute("maxlength", "4");
        userPasswordInput.setAttribute("inputmode", "numeric");
    } else {
        userPasswordRow.classList.add("hidden");
        userPasswordInput.value = "";
    }
}

function normalizePasswordValue(value) {
    return String(value || "").trim();
}

function isPasswordDuplicate(password, ignoreUserId = null) {
    const normalizedPassword = normalizePasswordValue(password);
    if (!normalizedPassword) {
        return false;
    }

    return firestoreUsuarios.some((user) => {
        if (ignoreUserId && user.id === ignoreUserId) {
            return false;
        }
        return normalizePasswordValue(user.password) === normalizedPassword;
    });
}

function setUserForm(user) {
    editingUserId = user.id;
    if (userNameInput) userNameInput.value = user.nome;
    if (userPasswordInput) userPasswordInput.value = "";
    if (userLiderCheckbox) userLiderCheckbox.checked = user.lider;
    if (userAtivoCheckbox) userAtivoCheckbox.checked = user.ativo;
    toggleUserPasswordField();
    setStatus(`Editando usuário ${user.nome}`);
}

function clearUserForm() {
    editingUserId = null;
    if (adminUserSelect) adminUserSelect.value = "";
    if (userNameInput) userNameInput.value = "";
    if (userPasswordInput) userPasswordInput.value = "";
    if (userLiderCheckbox) userLiderCheckbox.checked = false;
    if (userAtivoCheckbox) userAtivoCheckbox.checked = true;
    toggleUserPasswordField();
    setStatus("Formulário de usuário limpo.");
}

function setPlateForm(plate) {
    editingPlateId = plate.id;
    if (plateNameInput) plateNameInput.value = plate.placa;
    if (plateAtivoCheckbox) plateAtivoCheckbox.checked = plate.ativo;
    setStatus(`Editando placa ${plate.placa}`);
}

function clearPlateForm() {
    editingPlateId = null;
    if (adminPlateSelect) adminPlateSelect.value = "";
    if (plateNameInput) plateNameInput.value = "";
    if (plateAtivoCheckbox) plateAtivoCheckbox.checked = true;
    setStatus("Formulário de placa limpo.");
}

async function loadUsuarios() {
    try {
        const { usuarios: usuariosLocais } = await loadLocalAccessLists();
        usuarios = usuariosLocais;

        if (usuarioSelect) {
            safeSetInnerHTML(usuarioSelect, "");
        }

        let activeUserCount = 0;

        const preferredUser = await loadPreferredUsuario();

        usuarios.forEach((user) => {
            if (!user.ativo) return;
            activeUserCount += 1;
            if (usuarioSelect) {
                const item = document.createElement("option");
                item.value = user.nome;
                item.textContent = user.nome === preferredUser ? `★ ${user.nome}` : user.nome;
                usuarioSelect.appendChild(item);
            }
        });

        if (usuarioSelect) {
            if (activeUserCount === 0) {
                safeSetInnerHTML(usuarioSelect, "<option value=\"\">Nenhum usuário ativo</option>");
            } else if (preferredUser && Array.from(usuarioSelect.options).some((opt) => opt.value === preferredUser)) {
                usuarioSelect.value = preferredUser;
            }
        }

        if (adminUserSelect) {
            safeSetInnerHTML(adminUserSelect, "<option value=\"\">Selecione um usuário...</option>");
            usuarios.forEach((user) => {
                const userOption = document.createElement("option");
                userOption.value = user.id;
                userOption.textContent = user.ativo ? user.nome : `${user.nome} (Inativo)`;
                adminUserSelect.appendChild(userOption);
            });
        }

        setStatus("Usuários carregados do arquivo local.");
    } catch (error) {
        setStatus("Erro ao carregar usuários.", true);
        throw error;
    }
}

async function loadPlates() {
    try {
        const { placas: placasLocais } = await loadLocalAccessLists();
        placas = placasLocais;
        allPlacasOptions = [];

        const sortedPlates = [...placas].sort((a, b) => a.placa.localeCompare(b.placa));
        if (adminPlateSelect) {
            safeSetInnerHTML(adminPlateSelect, "<option value=\"\">Selecione uma placa...</option>");
        }
        if (searchPlacaSelect) {
            safeSetInnerHTML(searchPlacaSelect, "<option value=\"\">Selecione uma placa...</option>");
        }
        if (auditPlacaSelect) {
            safeSetInnerHTML(auditPlacaSelect, "<option value=\"\">Selecione uma placa...</option>");
        }
        sortedPlates.forEach((plate) => {
            if (adminPlateSelect) {
                const plateOption = document.createElement("option");
                plateOption.value = plate.id;
                plateOption.textContent = plate.ativo ? plate.placa : `${plate.placa} (Inativa)`;
                adminPlateSelect.appendChild(plateOption);
            }

            if (plate.ativo) {
                allPlacasOptions.push(plate.placa);
            }
        });

        renderPlacaDropdown("");

        await populateSearchPlacaSelectFromEvents();

        if (allPlacasOptions.length === 0) {
            if (placaInput) {
                placaInput.placeholder = "Nenhuma placa ativa disponível";
                placaInput.disabled = true;
            }
        } else if (placaInput) {
            placaInput.disabled = false;
            placaInput.placeholder = "Selecione uma placa...";
        }

        if (placaInput && placaDropdown) {
            placaInput.addEventListener("input", (e) => {
                const v = String(placaInput.value || "").trim().toLowerCase();
                renderPlacaDropdown(v);
                showPlacaDropdown();
            });

            placaInput.addEventListener("focus", () => {
                renderPlacaDropdown(placaInput.value.trim().toLowerCase());
                showPlacaDropdown();
            });

            placaInput.addEventListener("keydown", (e) => {
                if (e.key === "ArrowDown") {
                    const first = placaDropdown.querySelector(".dropdown-item");
                    if (first) first.focus();
                    e.preventDefault();
                    return;
                }
                if (e.key === "Escape") {
                    hidePlacaDropdown();
                    placaInput.select();
                    return;
                }
            });

            document.addEventListener("click", (ev) => {
                if (!placaInput.contains(ev.target) && !placaDropdown.contains(ev.target)) {
                    hidePlacaDropdown();
                }
            });
        }

        function showPlacaDropdown() {
            if (!placaDropdown) return;
            placaDropdown.classList.remove("hidden");
            if (placaInput) placaInput.setAttribute("aria-expanded", "true");
        }

        function hidePlacaDropdown() {
            if (!placaDropdown) return;
            placaDropdown.classList.add("hidden");
            if (placaInput) placaInput.setAttribute("aria-expanded", "false");
        }

        function renderPlacaDropdown(filter) {
            if (!placaDropdown) return;
            safeSetInnerHTML(placaDropdown, "");
            const normalized = String(filter || "").toLowerCase();
            const matches = normalized ? allPlacasOptions.filter((p) => p.toLowerCase().startsWith(normalized)) : allPlacasOptions.slice();

            matches.forEach((p) => {
                const item = document.createElement("div");
                item.tabIndex = 0;
                item.className = "dropdown-item";
                item.setAttribute("role", "option");
                item.setAttribute("aria-selected", "false");
                item.textContent = p;
                item.addEventListener("click", () => {
                    placaInput.value = p;
                    hidePlacaDropdown();
                });
                item.addEventListener("focus", () => {
                    Array.from(placaDropdown.children).forEach((c) => c.setAttribute("aria-selected", "false"));
                    item.setAttribute("aria-selected", "true");
                });
                item.addEventListener("keydown", (ev) => {
                    if (ev.key === "Enter") {
                        placaInput.value = p;
                        hidePlacaDropdown();
                    } else if (ev.key === "ArrowDown") {
                        const next = item.nextElementSibling;
                        if (next) next.focus();
                        ev.preventDefault();
                    } else if (ev.key === "ArrowUp") {
                        const prev = item.previousElementSibling;
                        if (prev) prev.focus();
                        else placaInput.focus();
                        ev.preventDefault();
                    }
                });
                placaDropdown.appendChild(item);
            });

            placaDropdown.style.maxHeight = "180px";
            placaDropdown.style.overflowY = "auto";
        }

        if (searchUsuarioSelect) {
            populateSearchUsuarioSelect();
        }

        if (auditPlacaSelect) {
            await populateAuditPlacaSelectFromAudit();
        }

        setStatus("Placas carregadas do arquivo local.");
    } catch (error) {
        setStatus("Erro ao carregar placas.", true);
    }
}

function isEventToday(timestamp) {
    if (!timestamp) return false;
    const eventDate = new Date(timestamp);
    if (Number.isNaN(eventDate.getTime())) return false;

    const today = new Date();
    return (
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate()
    );
}

async function loadEventPlates() {
    try {
        const docs = await fetchEventDocuments();
        const plates = new Set();
        docs.forEach((doc) => {
            const fields = doc.fields || {};
            if (!isEventToday(fields.dataHora?.timestampValue)) return;
            const placa = getFirestoreStringValue(fields.placa).trim();
            if (placa) {
                plates.add(placa.toUpperCase());
            }
        });
        return [...plates];
    } catch (error) {
        return [];
    }
}

async function loadAuditPlates() {
    try {
        const url = `${FIRESTORE_URL}/auditoria?pageSize=1000`;
        const response = await fetchWithAuth(url, {
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Falha ao carregar auditoria.");
        }

        const plates = new Set();
        if (Array.isArray(data.documents)) {
            data.documents.forEach((doc) => {
                const fields = doc.fields || {};
                const placa = getFirestoreStringValue(fields.placa || fields.eventoPlaca).trim();
                if (placa) plates.add(placa.toUpperCase());
            });
        }

        return [...plates];
    } catch (error) {
        return [];
    }
}

async function populateAuditPlacaSelectFromAudit() {
    if (!auditPlacaSelect) return;
    safeSetInnerHTML(auditPlacaSelect, "<option value=\"\">Todas as placas</option>");

    const auditPlates = await loadAuditPlates();
    if (auditPlates.length === 0) {
        safeSetInnerHTML(auditPlacaSelect, "<option value=\"\">Nenhuma placa na auditoria</option>");
        return;
    }

    auditPlates.sort((a, b) => a.localeCompare(b)).forEach((placa) => {
        const option = document.createElement("option");
        option.value = placa;
        option.textContent = placa;
        auditPlacaSelect.appendChild(option);
    });
}

async function loadEventUsuarios() {
    try {
        const docs = await fetchEventDocuments();
        const users = new Set();
        docs.forEach((doc) => {
            const fields = doc.fields || {};
            if (!isEventToday(fields.dataHora?.timestampValue)) return;
            const usuario = getFirestoreStringValue(fields.usuario).trim();
            if (usuario) {
                users.add(usuario);
            }
        });
        return [...users];
    } catch (error) {
        return [];
    }
}

async function populateSearchUsuarioSelect() {
    if (!searchUsuarioSelect) return;

    const eventUsers = await loadEventUsuarios();
    if (eventUsers.length === 0) {
        safeSetInnerHTML(searchUsuarioSelect, "<option value=\"\">Nenhum usuário com evento hoje</option>");
        return;
    }

    const sortedUsers = [...new Set(eventUsers)].sort((a, b) => a.localeCompare(b));

    safeSetInnerHTML(searchUsuarioSelect, "<option value=\"\">Todos os usuários</option>");
    sortedUsers.forEach((nome) => {
        const option = document.createElement("option");
        option.value = nome;
        option.textContent = nome;
        searchUsuarioSelect.appendChild(option);
    });
}

async function populateSearchPlacaSelectFromEvents() {
    if (!searchPlacaSelect) return;
    safeSetInnerHTML(searchPlacaSelect, "<option value=\"\">Todas as placas</option>");

    const eventPlates = await loadEventPlates();
    if (eventPlates.length === 0) {
        safeSetInnerHTML(searchPlacaSelect, "<option value=\"\">Nenhuma placa com evento disponível</option>");
        return;
    }

    eventPlates.sort((a, b) => a.localeCompare(b)).forEach((placa) => {
        const option = document.createElement("option");
        option.value = placa;
        option.textContent = placa;
        searchPlacaSelect.appendChild(option);
    });
}



async function saveUser() {
    const nome = userNameInput.value.trim();
    const password = normalizePasswordValue(userPasswordInput.value);
    const lider = userLiderCheckbox.checked;
    const ativo = userAtivoCheckbox.checked;

    if (!nome) {
        setStatus("Nome do usuário é obrigatório.", true);
        return;
    }

    if (lider) {
        if (!password) {
            setStatus("Líder precisa de PIN.", true);
            return;
        }
        if (password.length > 4) {
            setStatus("O PIN deve ter no máximo 4 dígitos.", true);
            return;
        }
        if (isPasswordDuplicate(password, editingUserId)) {
            setStatus("Já existe outro usuário com este PIN. Escolha outro.", true);
            return;
        }
    }

    const fields = {
        nome: { stringValue: nome },
        lider: { booleanValue: lider },
        ativo: { booleanValue: ativo },
    };
    if (lider) {
        fields.password = { stringValue: password };
    }

    try {
        if (editingUserId) {
            await patchDocument(editingUserId, fields);
            setStatus(`Usuário ${nome} atualizado na coleção usuarios do Firestore.`);
        } else {
            await createDocument("usuarios", fields);
            setStatus(`Usuário ${nome} cadastrado na coleção usuarios do Firestore.`);
        }

        await loadFirestoreUsuarios();
        if (adminUserSelect) {
            safeSetInnerHTML(adminUserSelect, "<option value=\"\">Selecione um usuário...</option>");
            firestoreUsuarios.forEach((user) => {
                const userOption = document.createElement("option");
                userOption.value = user.id;
                userOption.textContent = user.ativo ? user.nome : `${user.nome} (Inativo)`;
                adminUserSelect.appendChild(userOption);
            });
        }

        clearUserForm();
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function savePlate() {
    const placa = plateNameInput.value.trim().toUpperCase();
    const ativo = plateAtivoCheckbox.checked;

    if (!placa) {
        setStatus("Placa é obrigatória.", true);
        return;
    }

    const fields = {
        placa: { stringValue: placa },
        ativo: { booleanValue: ativo },
    };

    try {
        if (editingPlateId) {
            await patchDocument(editingPlateId, fields);
            setStatus(`Placa ${placa} atualizada com sucesso.`);
        } else {
            await createDocument("placas", fields);
            setStatus(`Placa ${placa} cadastrada com sucesso.`);
        }
        await loadPlates();
        clearPlateForm();
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function deleteUser() {
    const userId = editingUserId || adminUserSelect.value;
    if (!userId) {
        setStatus("Selecione um usuário para excluir.", true);
        return;
    }

    try {
        await patchDocument(userId, { ativo: { booleanValue: false } });
        await loadFirestoreUsuarios();
        if (adminUserSelect) {
            safeSetInnerHTML(adminUserSelect, "<option value=\"\">Selecione um usuário...</option>");
            firestoreUsuarios.forEach((user) => {
                const userOption = document.createElement("option");
                userOption.value = user.id;
                userOption.textContent = user.ativo ? user.nome : `${user.nome} (Inativo)`;
                adminUserSelect.appendChild(userOption);
            });
        }
        clearUserForm();
        setStatus("Usuário desativado na coleção usuarios do Firestore.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function deletePlate() {
    const plateId = editingPlateId || adminPlateSelect.value;
    if (!plateId) {
        setStatus("Selecione uma placa para excluir.", true);
        return;
    }

    try {
        await patchDocument(plateId, { ativo: { booleanValue: false } });
        await loadPlates();
        clearPlateForm();
        setStatus("Placa excluída com sucesso. Os eventos permanecem intactos.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function toggleUserActive(userId, ativo) {
    try {
        await patchDocument(userId, { ativo: { booleanValue: ativo } });
        await loadUsuarios();
        setStatus(`Usuário ${ativo ? "ativado" : "inativado"} com sucesso.`);
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function togglePlateActive(plateId, ativo) {
    try {
        await patchDocument(plateId, { ativo: { booleanValue: ativo } });
        await loadPlates();
        setStatus(`Placa ${ativo ? "ativada" : "inativada"} com sucesso.`);
    } catch (error) {
        setStatus(error.message, true);
    }
}

function enforceUserPasswordInputLimit() {
    if (!userPasswordInput) return;
    userPasswordInput.addEventListener("input", () => {
        if (userPasswordInput.value.length > 4) {
            userPasswordInput.value = userPasswordInput.value.slice(0, 4);
        }
    });
}

async function saveEvento() {
    const placa = placaInput.value.trim();
    const cliente = document.getElementById("cliente").value.trim();
    const usuario = usuarioSelect.value;

    if (!placa) {
        setStatus("Selecione a placa.", true);
        return;
    }
    if (!usuario) {
        setStatus("Selecione um usuário.", true);
        return;
    }

    await savePreferredUsuario(usuario);
    setStatus("Registrando conferência...");

    const docPath = `${FIRESTORE_URL}/eventos`;
    const now = new Date().toISOString();
    const fields = {
        placa: { stringValue: placa.toUpperCase() },
        cliente: { stringValue: cliente || "" },
        usuario: { stringValue: usuario },
        status: { stringValue: "conferido" },
        dataHora: { timestampValue: now },
    };

    try {
        const response = await fetchWithAuth(docPath, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(buildFirestoreDocument(fields)),
        });
        const data = await parseResponseBody(response);
        if (!response.ok) {
            throw new Error(data?.error?.message || data?.rawText || "Falha ao registrar evento.");
        }
        setStatus("Conferência registrada com sucesso.");
        placaInput.value = "";
        document.getElementById("cliente").value = "";
    } catch (error) {
        setStatus(error.message, true);
    }
}

function getTodayLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function searchPlaca() {
    if (!searchPlacaSelect) {
        setStatus("Campo de busca de placa ausente.", true);
        return;
    }

    const placa = searchPlacaSelect.value.trim().toUpperCase();
    const usuario = searchUsuarioSelect?.value.trim();
    const dataValue = searchDataInput?.value || getTodayLocalDate();

    setStatus("Buscando registro...");
    searchResult.textContent = "";
    editingEventDoc = null;
    if (editEventBtn) {
        editEventBtn.classList.add("hidden");
    }

    const startDate = parseDateInput(dataValue);
    const endDate = parseDateInput(dataValue, true);

    try {
        const docs = await fetchEventDocuments();
        let eventDocs = docs.filter((doc) => {
            const fields = doc.fields || {};
            const placaValue = getFirestoreStringValue(fields.placa).toUpperCase();
            const usuarioValue = getFirestoreStringValue(fields.usuario).trim();
            const timestamp = fields.dataHora?.timestampValue;
            const eventDate = timestamp ? new Date(timestamp) : null;

            if (!eventDate || Number.isNaN(eventDate.getTime())) {
                return false;
            }
            if (placa && placaValue !== placa) {
                return false;
            }
            if (usuario && usuarioValue !== usuario) {
                return false;
            }
            if (startDate && eventDate < startDate) {
                return false;
            }
            if (endDate && eventDate > endDate) {
                return false;
            }
            return true;
        });

        if (eventDocs.length === 0) {
            searchResult.textContent = "Nenhum registro encontrado para os filtros selecionados.";
            setStatus("Busca concluída.");
            return;
        }

        eventDocs.sort((a, b) => {
            const aTime = a.fields?.dataHora?.timestampValue || "";
            const bTime = b.fields?.dataHora?.timestampValue || "";
            return bTime.localeCompare(aTime);
        });

        renderSearchResults(eventDocs);
        setStatus("Busca concluída.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

function renderSearchResults(eventDocs) {
    if (!searchResult) return;
    searchResult.textContent = "";
    safeSetInnerHTML(searchResult, "");
    if (editEventBtn) {
        editEventBtn.classList.add("hidden");
    }

    eventDocs.forEach((doc, index) => {
        const fields = doc.fields || {};
        const card = document.createElement("div");
        card.className = "result-card";
        const placa = getFirestoreStringValue(fields.placa).toUpperCase();
        const usuario = getFirestoreStringValue(fields.usuario);
        const cliente = getFirestoreStringValue(fields.cliente) || "-";
        const status = getFirestoreStringValue(fields.status) || "-";
        const dataHora = formatDateTime(fields.dataHora?.timestampValue);

        const details = document.createElement("div");
        details.className = "result-card-details";

        const line1 = document.createElement("div");
        line1.className = "result-card-line";
        line1.textContent = `Placa: ${placa} ${dataHora}`;

        if (currentAdminLeaderName) {
            const editIcon = document.createElement("span");
            editIcon.className = "result-card-edit-icon";
            editIcon.textContent = "✏️";
            editIcon.title = "Editar este evento";
            editIcon.addEventListener("click", (event) => {
                event.stopPropagation();
                editingEventDoc = doc;
                openEditEventPanel();
            });
            line1.appendChild(editIcon);
        }

        details.appendChild(line1);

        const line2 = document.createElement("div");
        line2.textContent = `Usuário: ${usuario}`;
        details.appendChild(line2);

        const line3 = document.createElement("div");
        line3.textContent = `Cliente: ${cliente}`;
        details.appendChild(line3);

        const eventIdLine = document.createElement("div");
        eventIdLine.className = "result-card-id";
        const eventId = doc.name ? doc.name.split('/').pop() : "";
        eventIdLine.textContent = `ID: ${eventId}`;
        details.appendChild(eventIdLine);

        card.appendChild(details);

        searchResult.appendChild(card);
    });
}

function parseDateInput(value, endOfDay = false) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    if (endOfDay) {
        date.setHours(23, 59, 59, 999);
    }
    return date;
}

function formatTime(timestamp) {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return timestamp;
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function getFirestoreNumberValue(field) {
    if (!field) return null;
    if (field.integerValue !== undefined) {
        return Number(field.integerValue);
    }
    if (field.doubleValue !== undefined) {
        return Number(field.doubleValue);
    }
    return null;
}

async function fetchEventDocuments() {
    const url = `${FIRESTORE_URL}/eventos?pageSize=1000`;
    const response = await fetchWithAuth(url, {
        headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Falha ao carregar eventos.");
    }
    return Array.isArray(data.documents) ? data.documents : [];
}
async function fetchEventsStructured() {
    const docs = await fetchEventDocuments();
    return docs.map((doc) => {
        const f = doc.fields || {};
        return {
            id: doc.name,
            placa: getFirestoreStringValue(f.placa).toUpperCase(),
            usuario: getFirestoreStringValue(f.usuario),
            cliente: getFirestoreStringValue(f.cliente),
            status: getFirestoreStringValue(f.status),
            dataHora: f.dataHora?.timestampValue,
            raw: doc,
        };
    });
}

function filterEventsByDateRange(docs, startDate, endDate, placaUpper) {
    return docs.filter((doc) => {
        const fields = doc.fields || {};
        const placaValue = getFirestoreStringValue(fields.placa).toUpperCase();
        const timestamp = fields.dataHora?.timestampValue;
        const eventDate = timestamp ? new Date(timestamp) : null;
        if (!eventDate || Number.isNaN(eventDate.getTime())) {
            return false;
        }
        if (startDate && eventDate < startDate) return false;
        if (endDate && eventDate > endDate) return false;
        if (placaUpper && !placaValue.includes(placaUpper)) return false;
        return true;
    });
}
async function openExtractPanel() {
    extractPanel.classList.remove("hidden");
    productivityPanel.classList.add("hidden");
    mainPanel.classList.add("hidden");
    searchPanel.classList.add("hidden");
    extractResult.textContent = "";
    extractDayDate.value = "";
}

async function openSearchPanel(fromAdmin = false) {
    adminSearchMode = fromAdmin;
    searchPanel.classList.remove("hidden");
    extractPanel.classList.add("hidden");
    productivityPanel.classList.add("hidden");
    editEventPanel.classList.add("hidden");
    auditPanel.classList.add("hidden");
    mainPanel.classList.add("hidden");
    adminScreenPanel.classList.add("hidden");
    adminDashboardPanel.classList.add("hidden");
    searchResult.textContent = "";
    if (searchPlacaSelect) {
        searchPlacaSelect.value = "";
    }
    if (editEventBtn) {
        editEventBtn.classList.add("hidden");
    }
    editingEventDoc = null;
    await populateSearchPlacaSelectFromEvents();
}

async function openAdminEditEventPanel() {
    if (!currentAdminLeaderName) {
        setStatus("Acesso administrativo necessário para editar eventos.", true);
        return;
    }

    await openSearchPanel(true);
    setStatus("Busque um evento por placa para editar.");
}

function openAuditPanel() {
    if (!currentAdminLeaderName) {
        setStatus("Acesso administrativo necessário para acessar a auditoria.", true);
        return;
    }

    adminScreenPanel.classList.remove("hidden");
    adminAuthPanel.classList.add("hidden");
    adminDashboardPanel.classList.add("hidden");
    adminUserPanel.classList.add("hidden");
    adminPlatePanel.classList.add("hidden");
    auditPanel.classList.remove("hidden");
    auditResult.textContent = "";
    if (auditPlacaSelect) {
        auditPlacaSelect.value = "";
    }
    if (auditStartDate) {
        auditStartDate.value = "";
    }
    if (auditEndDate) {
        auditEndDate.value = "";
    }
}

function closeAuditPanel() {
    if (auditPanel) {
        auditPanel.classList.add("hidden");
    }
    adminScreenPanel.classList.remove("hidden");
    adminDashboardPanel.classList.remove("hidden");
    auditResult.textContent = "";
}

async function searchAudit() {
    const placa = auditPlacaSelect?.value.trim().toUpperCase();
    const startDateValue = auditStartDate?.value;
    const endDateValue = auditEndDate?.value;

    setStatus("Buscando auditoria...");
    auditResult.textContent = "";

    try {
        const startDate = parseDateInput(startDateValue);
        const endDate = parseDateInput(endDateValue, true);

        if (startDate && endDate && startDate > endDate) {
            setStatus("Data início não pode ser maior que data fim.", true);
            return;
        }

        // Use simple GET listing and filter client-side to avoid :runQuery permission issues
        const url = `${FIRESTORE_URL}/auditoria?pageSize=1000`;
        const response = await fetchWithAuth(url, {
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Falha ao buscar auditoria.");
        }

        let docs = Array.isArray(data.documents) ? data.documents : [];

        // apply filters client-side (placa and date range)
        if (placa || startDate || endDate) {
            docs = docs.filter((doc) => {
                const f = doc.fields || {};
                const docPlaca = (getFirestoreStringValue(f.placa || f.eventoPlaca) || "").toUpperCase();
                const ts = f.dataHora?.timestampValue;
                const docDate = ts ? new Date(ts) : null;

                if (placa && docPlaca !== placa) return false;
                if (startDate && (!docDate || docDate < startDate)) return false;
                if (endDate && (!docDate || docDate > endDate)) return false;
                return true;
            });
        }

        docs.sort((a, b) => {
            const aTime = a.fields?.dataHora?.timestampValue || "";
            const bTime = b.fields?.dataHora?.timestampValue || "";
            return bTime.localeCompare(aTime);
        });

        if (docs.length === 0) {
            auditResult.textContent = "Nenhum registro de auditoria encontrado.";
            setStatus("Busca de auditoria concluída.");
            return;
        }

        auditResult.textContent = docs
            .map((doc) => {
                const f = doc.fields || {};
                const eventId = getFirestoreStringValue(f.eventoId);
                const eventPlaca = getFirestoreStringValue(f.placa) || getFirestoreStringValue(f.eventoPlaca);
                const eventUsuario = getFirestoreStringValue(f.eventoUsuario);
                const dataHora = formatDateTime(f.eventoDataHora?.timestampValue || f.dataHora?.timestampValue);
                const campo = getFirestoreStringValue(f.campo);
                const valorAnterior = getFirestoreStringValue(f.valorAnterior);
                const valorNovo = getFirestoreStringValue(f.valorNovo);

                let antes = `ANTES > ${valorAnterior}`;
                let depois = `DEPOIS > ${valorNovo}`;

                if (campo === "usuario") {
                    antes = `ANTES > ${eventPlaca || "-"} | ${valorAnterior} | ${dataHora}`;
                    depois = `DEPOIS > ${eventPlaca || "-"} | ${valorNovo} | ${dataHora}`;
                } else if (campo === "placa") {
                    antes = `ANTES > ${valorAnterior} | ${eventUsuario || "-"} | ${dataHora}`;
                    depois = `DEPOIS > ${valorNovo} | ${eventUsuario || "-"} | ${dataHora}`;
                } else if (campo === "cliente") {
                    antes = `ANTES > ${eventPlaca || "-"} | ${eventUsuario || "-"} | ${dataHora}`;
                    depois = `DEPOIS > ${eventPlaca || "-"} | ${eventUsuario || "-"} | ${dataHora}`;
                }

                return [
                    `eventoId: ${eventId}`,
                    antes,
                    depois,
                ].join("\n");
            })
            .join("\n\n");

        setStatus("Auditoria encontrada.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

function openEditEventPanel() {
    if (!editingEventDoc) {
        setStatus("Nenhum evento selecionado para edição.", true);
        return;
    }

    editEventPanel.classList.remove("hidden");
    searchPanel.classList.add("hidden");
    extractPanel.classList.add("hidden");
    productivityPanel.classList.add("hidden");
    mainPanel.classList.add("hidden");

    const oldFields = editingEventDoc.fields || {};
    const selectedUser = getFirestoreStringValue(oldFields.usuario);
    if (editEventUsuario) {
        safeSetInnerHTML(editEventUsuario, "<option value=''>Selecione um usuário...</option>");
        const activeUsers = usuarios.filter((user) => user.ativo);
        activeUsers.forEach((user) => {
            const option = document.createElement("option");
            option.value = user.nome;
            option.textContent = user.nome;
            if (user.nome === selectedUser) {
                option.selected = true;
            }
            editEventUsuario.appendChild(option);
        });
        if (selectedUser && !activeUsers.some((user) => user.nome === selectedUser)) {
            const option = document.createElement("option");
            option.value = selectedUser;
            option.textContent = `${selectedUser} (Inativo)`;
            option.selected = true;
            editEventUsuario.appendChild(option);
        }
    }
    if (editEventCliente) {
        editEventCliente.value = getFirestoreStringValue(oldFields.cliente);
    }

    if (editEventPlaca) {
        safeSetInnerHTML(editEventPlaca, "<option value=''>Selecione uma placa...</option>");
        const selectedPlate = getFirestoreStringValue(oldFields.placa).toUpperCase();
        const activePlates = placas.filter((plate) => plate.ativo);
        activePlates.forEach((plate) => {
            const option = document.createElement("option");
            option.value = plate.placa;
            option.textContent = plate.placa;
            if (plate.placa === selectedPlate) {
                option.selected = true;
            }
            editEventPlaca.appendChild(option);
        });

        if (!activePlates.some((plate) => plate.placa === selectedPlate) && selectedPlate) {
            const option = document.createElement("option");
            option.value = selectedPlate;
            option.textContent = `${selectedPlate} (inativa)`;
            option.selected = true;
            editEventPlaca.appendChild(option);
        }
    }
}

function closeEditEventPanel() {
    editEventPanel.classList.add("hidden");
    searchPanel.classList.remove("hidden");
    if (editEventBtn) {
        editEventBtn.classList.add("hidden");
    }
    editingEventDoc = null;
}

async function saveEventEdit() {
    if (!editingEventDoc) {
        setStatus("Nenhum evento selecionado para edição.", true);
        return;
    }

    const placa = editEventPlaca.value.trim().toUpperCase();
    const usuario = editEventUsuario.value.trim();
    const cliente = editEventCliente.value.trim();
    if (!placa) {
        setStatus("Placa é obrigatória.", true);
        return;
    }
    if (!usuario) {
        setStatus("Usuário é obrigatório.", true);
        return;
    }

    const oldFields = editingEventDoc.fields || {};
    const oldPlaca = getFirestoreStringValue(oldFields.placa).toUpperCase();
    const oldUsuario = getFirestoreStringValue(oldFields.usuario);
    const oldCliente = getFirestoreStringValue(oldFields.cliente);

    const updates = {};
    const auditEntries = [];

    if (placa !== oldPlaca) {
        updates.placa = { stringValue: placa };
        auditEntries.push({ campo: "placa", valorAnterior: oldPlaca, valorNovo: placa });
    }
    if (usuario !== oldUsuario) {
        updates.usuario = { stringValue: usuario };
        auditEntries.push({ campo: "usuario", valorAnterior: oldUsuario, valorNovo: usuario });
    }
    if (cliente !== oldCliente) {
        updates.cliente = { stringValue: cliente };
        auditEntries.push({ campo: "cliente", valorAnterior: oldCliente, valorNovo: cliente });
    }

    if (Object.keys(updates).length === 0) {
        setStatus("Nenhuma alteração detectada.", true);
        return;
    }

    try {
        await patchDocument(editingEventDoc.name, updates);
        await Promise.all(auditEntries.map((entry) => createAuditEntry(editingEventDoc, entry)));
        setStatus("Evento atualizado e auditoria registrada.");
        closeEditEventPanel();
        await searchPlaca();
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function createAuditEntry(eventDoc, entry) {
    const eventId = eventDoc.name ? eventDoc.name.split("/").pop() : "";
    const placa = getFirestoreStringValue(eventDoc.fields?.placa).toUpperCase();
    const usuarioEvento = getFirestoreStringValue(eventDoc.fields?.usuario);
    const eventoDataHora = eventDoc.fields?.dataHora?.timestampValue;
    const fields = {
        acao: { stringValue: "alteracao" },
        dataHora: { timestampValue: new Date().toISOString() },
        eventoId: { stringValue: eventId },
        usuario: { stringValue: currentAdminLeaderName || "Líder" },
        campo: { stringValue: entry.campo },
        valorAnterior: { stringValue: entry.valorAnterior },
        valorNovo: { stringValue: entry.valorNovo },
        eventoPlaca: { stringValue: placa },
        eventoUsuario: { stringValue: usuarioEvento },
    };

    if (eventoDataHora) {
        fields.eventoDataHora = { timestampValue: eventoDataHora };
    }

    await createDocument("auditoria", fields);
}

function openProductivityPanel() {
    productivityPanel.classList.remove("hidden");
    extractPanel.classList.add("hidden");
    mainPanel.classList.add("hidden");
    searchPanel.classList.add("hidden");
    productivityResult.textContent = "";
    productivityDate.value = "";
}

function closeSearchPanel() {
    searchPanel.classList.add("hidden");
    if (adminSearchMode && currentAdminLeaderName) {
        adminSearchMode = false;
        adminScreenPanel.classList.remove("hidden");
        adminDashboardPanel.classList.remove("hidden");
        return;
    }
    mainPanel.classList.remove("hidden");
}

function closeExtractPanel() {
    extractPanel.classList.add("hidden");
    productivityPanel.classList.add("hidden");
    mainPanel.classList.remove("hidden");
    searchPanel.classList.add("hidden");
    extractResult.textContent = "";
    productivityResult.textContent = "";
}

function closeProductivityPanel() {
    productivityPanel.classList.add("hidden");
    extractPanel.classList.add("hidden");
    mainPanel.classList.remove("hidden");
    searchPanel.classList.add("hidden");
    productivityResult.textContent = "";
}


async function reportProductivityByUser() {
    const dateValue = productivityDate.value;
    if (!dateValue) {
        setStatus("Informe a data.", true);
        return;
    }

    const startDate = parseDateInput(dateValue);
    const endDate = parseDateInput(dateValue, true);
    if (!startDate || !endDate) {
        setStatus("Datas inválidas.", true);
        return;
    }

    setStatus("Gerando relatório de produtividade por usuário...");
    productivityResult.textContent = "";

    try {
        const docs = await fetchEventDocuments();
        const entries = filterEventsByDateRange(docs, startDate, endDate, "");
        if (entries.length === 0) {
            productivityResult.textContent = "Nenhum evento encontrado para esse período.";
            setStatus("Busca concluída.");
            return;
        }

        const userStats = entries.reduce((stats, doc) => {
            const fields = doc.fields || {};
            const userName = getFirestoreStringValue(fields.usuario) || "Sem usuário";

            if (!stats[userName]) {
                stats[userName] = { count: 0 };
            }
            stats[userName].count += 1;
            return stats;
        }, {});

        const sortedUsers = Object.keys(userStats).sort((a, b) => {
            const diff = userStats[b].count - userStats[a].count;
            return diff !== 0 ? diff : a.localeCompare(b);
        });

        productivityResult.textContent = sortedUsers
            .map((userName) => {
                const stats = userStats[userName];
                return `${userName}: ${stats.count}`;
            })
            .join("\n");

        setStatus("Relatório de produtividade gerado.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function dailyReport() {
    const dayValue = extractDayDate.value;
    if (!dayValue) {
        setStatus("Informe a data do extrato.", true);
        return;
    }

    const startDate = parseDateInput(dayValue);
    const endDate = parseDateInput(dayValue, true);
    if (!startDate || !endDate) {
        setStatus("Data inválida.", true);
        return;
    }

    setStatus("Gerando extrato do dia...");
    extractResult.textContent = "";

    try {
        const docs = await fetchEventDocuments();
        const entries = filterEventsByDateRange(docs, startDate, endDate, "");
        if (entries.length === 0) {
            extractResult.textContent = "Nenhum evento encontrado para essa data.";
            setStatus("Busca concluída.");
            return;
        }

        const grouped = entries.reduce((acc, doc) => {
            const fields = doc.fields || {};
            const placa = getFirestoreStringValue(fields.placa).toUpperCase();
            const usuario = getFirestoreStringValue(fields.usuario);
            const hora = formatTime(fields.dataHora?.timestampValue);
            acc[placa] = acc[placa] || [];
            acc[placa].push(`${usuario} ${hora}`);
            return acc;
        }, {});

        const sortedPlacas = Object.keys(grouped).sort();
        extractResult.textContent = sortedPlacas
            .map((placa) => `${placa} ${grouped[placa].join(" / ")}`)
            .join("\n");

        setStatus("Extrato do dia gerado.");
    } catch (error) {
        setStatus(error.message, true);
    }
}

function showAdminScreen() {
    if (adminScreenPanel) adminScreenPanel.classList.remove("hidden");
    if (technicalPanel) technicalPanel.classList.add("hidden");
    if (mainPanel) mainPanel.classList.add("hidden");
    if (searchPanel) searchPanel.classList.add("hidden");
    if (adminAuthPanel) adminAuthPanel.classList.remove("hidden");
    if (adminDashboardPanel) adminDashboardPanel.classList.add("hidden");
    if (adminUserPanel) adminUserPanel.classList.add("hidden");
    if (adminPlatePanel) adminPlatePanel.classList.add("hidden");
    if (adminPinInput) {
        adminPinInput.value = "";
        adminPinInput.focus();
    }
}

function closeAdminPanels() {
    if (adminScreenPanel) adminScreenPanel.classList.add("hidden");
    if (technicalPanel) technicalPanel.classList.add("hidden");
    if (mainPanel) mainPanel.classList.remove("hidden");
    if (searchPanel) searchPanel.classList.add("hidden");
    if (adminAuthPanel) adminAuthPanel.classList.add("hidden");
    if (adminDashboardPanel) adminDashboardPanel.classList.add("hidden");
    if (adminUserPanel) adminUserPanel.classList.add("hidden");
    if (adminPlatePanel) adminPlatePanel.classList.add("hidden");
    if (adminPinInput) adminPinInput.value = "";
}

async function showAdminAuth() {
    try {
        await loadUsuarios();
        if (usuarios.length === 0) {
            showAdminScreen();
            enterAdminMode("Administrador");
            setStatus("Acesso administrativo liberado: registre o primeiro usuário líder.");
            return;
        }
    } catch (error) {
        console.warn("Falha ao carregar usuários antes de abrir admin:", error);
    }

    showAdminScreen();
}

function hideAdminScreen() {
    closeAdminPanels();
}

function enterAdminMode(leaderName) {
    currentAdminLeaderName = leaderName || null;
    adminAuthPanel.classList.add("hidden");
    adminDashboardPanel.classList.remove("hidden");
    setStatus("Administração ativada.");
}

async function openAdminUsers() {
    if (!adminUserPanel) {
        setStatus("Painel de usuários não está disponível.", true);
        return;
    }

    adminUserPanel.classList.remove("hidden");
    if (adminPlatePanel) adminPlatePanel.classList.add("hidden");
    clearUserForm();
    await loadFirestoreUsuarios();
    if (adminUserSelect) {
        safeSetInnerHTML(adminUserSelect, "<option value=\"\">Selecione um usuário...</option>");
        firestoreUsuarios.forEach((user) => {
            const userOption = document.createElement("option");
            userOption.value = user.id;
            userOption.textContent = user.ativo ? user.nome : `${user.nome} (Inativo)`;
            adminUserSelect.appendChild(userOption);
        });
    }
}

async function openAdminPlates() {
    if (!adminPlatePanel) {
        setStatus("Painel de placas não está disponível.", true);
        return;
    }

    adminPlatePanel.classList.remove("hidden");
    if (adminUserPanel) adminUserPanel.classList.add("hidden");
    clearPlateForm();
    await loadPlates();
}

function closePlateAdminPanel() {
    if (adminPlatePanel) adminPlatePanel.classList.add("hidden");
    if (adminUserPanel) adminUserPanel.classList.add("hidden");
    if (adminDashboardPanel) adminDashboardPanel.classList.remove("hidden");
}

function closePlateAdminPanelAndReturn() {
    closePlateAdminPanel();
    if (adminScreenPanel) adminScreenPanel.classList.add("hidden");
    if (technicalPanel) technicalPanel.classList.add("hidden");
    if (mainPanel) mainPanel.classList.remove("hidden");
    if (searchPanel) searchPanel.classList.add("hidden");
}

function handleAdminUserSelectChange() {
    if (!adminUserSelect) return;
    const selectedId = adminUserSelect.value;
    if (!selectedId) {
        clearUserForm();
        return;
    }
    const user = firestoreUsuarios.find((u) => u.id === selectedId);
    if (user) {
        setUserForm(user);
    }
}

function handleAdminPlateSelectChange() {
    if (!adminPlateSelect) return;
    const selectedId = adminPlateSelect.value;
    if (!selectedId) {
        clearPlateForm();
        return;
    }
    const plate = placas.find((p) => p.id === selectedId);
    if (plate) {
        setPlateForm(plate);
    }
}

async function validateAdminPin() {
    const pin = adminPinInput.value.trim();
    if (!pin) {
        setStatus("Informe o PIN.", true);
        return;
    }

    try {
        const response = await fetchWithAuth(`${FIRESTORE_URL}/usuarios?pageSize=200`, {
            headers: { "Content-Type": "application/json" },
        });
        const data = await parseResponseBody(response);

        if (!response.ok) {
            throw new Error(data?.error?.message || data?.rawText || "Falha ao consultar usuários no Firestore.");
        }

        const firestoreUsers = Array.isArray(data?.documents) ? data.documents : [];
        const activeLeaders = firestoreUsers
            .map((doc) => {
                const fields = doc.fields || {};
                return {
                    nome: getFirestoreStringValue(fields.nome),
                    lider: getFirestoreBooleanValue(fields.lider),
                    ativo: fields.ativo !== undefined ? getFirestoreBooleanValue(fields.ativo) : true,
                    password: getFirestoreStringValue(fields.password),
                };
            })
            .filter((user) => user.lider && user.ativo && user.nome)
            .map((user) => ({ nome: user.nome, password: String(user.password || "").trim() }));

        if (activeLeaders.length === 0) {
            setStatus("Nenhum líder ativo encontrado na coleção usuarios do Firestore.", true);
            return;
        }

        const leader = activeLeaders.find((user) => user.password === pin);
        if (!leader) {
            console.log("Líderes ativos disponíveis:", activeLeaders);
            setStatus("PIN inválido. Apenas líderes com PIN cadastrado podem acessar.", true);
            return;
        }

        enterAdminMode(leader.nome);
    } catch (error) {
        setStatus(error.message, true);
    }
}

async function init() {
    loadSavedEmail();

    const active = await loadSession();
    if (!active) {
        setStatus("Sessão técnica ausente. Informe e-mail e senha.", true);
        technicalPanel.classList.remove("hidden");
        mainPanel.classList.add("hidden");
        searchPanel.classList.add("hidden");
        return;
    }

    try {
        await ensureFirestoreCollections();
        await loadUsuarios();
        await loadPlates();
        setStatus("Sessão técnica ativa. Dados administrativos carregados.");
        technicalPanel.classList.add("hidden");
        mainPanel.classList.remove("hidden");
        searchPanel.classList.add("hidden");
    } catch (error) {
        console.error("Falha no init():", error);
        setStatus(`Erro ao carregar dados: ${error.message || error}. Informe e-mail e senha novamente.`, true);
        technicalPanel.classList.remove("hidden");
        mainPanel.classList.add("hidden");
        searchPanel.classList.add("hidden");
    }
}

function attachEventListeners() {
    if (!document.body) return;

    if (saveUserBtn) saveUserBtn.addEventListener("click", saveUser);
    enforceUserPasswordInputLimit();
    if (deleteUserBtn) deleteUserBtn.addEventListener("click", deleteUser);
    if (clearUserBtn) clearUserBtn.addEventListener("click", clearUserForm);
    if (userLiderCheckbox) userLiderCheckbox.addEventListener("change", toggleUserPasswordField);
    if (adminUserSelect) adminUserSelect.addEventListener("change", handleAdminUserSelectChange);
    if (usuarioSelect) {
        usuarioSelect.addEventListener("change", () => {
            const selected = usuarioSelect.value;
            if (selected) {
                savePreferredUsuario(selected);
            }
        });
    }
    if (savePlateBtn) savePlateBtn.addEventListener("click", savePlate);
    if (deletePlateBtn) deletePlateBtn.addEventListener("click", deletePlate);
    if (clearPlateBtn) clearPlateBtn.addEventListener("click", clearPlateForm);
    if (closePlatePanelBtn) closePlatePanelBtn.addEventListener("click", closePlateAdminPanelAndReturn);
    if (adminPlateSelect) adminPlateSelect.addEventListener("change", handleAdminPlateSelectChange);
    if (adminAccessBtn) adminAccessBtn.addEventListener("click", showAdminAuth);
    if (adminPinConfirmBtn) adminPinConfirmBtn.addEventListener("click", validateAdminPin);
    if (adminPinCancelBtn) adminPinCancelBtn.addEventListener("click", hideAdminScreen);
    if (adminUsersBtn) adminUsersBtn.addEventListener("click", openAdminUsers);
    if (adminPlatesBtn) adminPlatesBtn.addEventListener("click", openAdminPlates);
    if (adminEditEventBtn) adminEditEventBtn.addEventListener("click", openAdminEditEventPanel);
    if (adminAuditBtn) adminAuditBtn.addEventListener("click", openAuditPanel);
    if (auditSearchBtn) auditSearchBtn.addEventListener("click", searchAudit);
    if (auditBackBtn) auditBackBtn.addEventListener("click", closeAuditPanel);
    if (clearPlateBtn) clearPlateBtn.addEventListener("click", () => {
        clearPlateForm();
    });
    if (signInBtn) signInBtn.addEventListener("click", signInTechnical);
    if (clearSessionBtn) clearSessionBtn.addEventListener("click", clearSession);
    if (saveBtn) saveBtn.addEventListener("click", saveEvento);
    if (openExtractBtn) openExtractBtn.addEventListener("click", openExtractPanel);
    if (openSearchBtn) openSearchBtn.addEventListener("click", openSearchPanel);
    if (openProductivityBtn) openProductivityBtn.addEventListener("click", openProductivityPanel);
    if (extractDailyBtn) extractDailyBtn.addEventListener("click", dailyReport);
    if (productivitySearchBtn) productivitySearchBtn.addEventListener("click", reportProductivityByUser);
    if (extractBackBtn) extractBackBtn.addEventListener("click", closeExtractPanel);
    if (productivityBackBtn) productivityBackBtn.addEventListener("click", closeProductivityPanel);
    if (searchBtn) searchBtn.addEventListener("click", searchPlaca);
    if (searchBackBtn) searchBackBtn.addEventListener("click", closeSearchPanel);
    if (editEventBtn) editEventBtn.addEventListener("click", openEditEventPanel);
    if (cancelEventEditBtn) cancelEventEditBtn.addEventListener("click", closeEditEventPanel);
    if (saveEventEditBtn) saveEventEditBtn.addEventListener("click", saveEventEdit);


}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachEventListeners);
} else {
    attachEventListeners();
}

if (typeof window !== "undefined") {
    window.openAdminEditEventPanel = openAdminEditEventPanel;
    window.openAuditPanel = openAuditPanel;
    window.openSearchPanel = openSearchPanel;
    window.closeAuditPanel = closeAuditPanel;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "sessionSaved") {
        init();
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (changes.firebaseIdToken || changes.firebaseRefreshToken) {
        init();
    }
});

init();
