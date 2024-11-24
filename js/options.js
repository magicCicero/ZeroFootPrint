// Initialize the main storage objects
const STORAGE_KEYS = {
    DOMAIN_LIST: 'fgnnpnnjglioamgigfemklhmbfalegbj',
    PROTECTED: 'fgnnpnnjglioamgigfemklhmbfalegbj_protected',
    ICONIZE: 'fgnnpnnjglioamgigfemklhmbfalegbj_iconize'
};

// URL components extractor
function URLComponents(link) {
    const data = { url: link, protocol: "", host: "", port: "", path: "", query: "" };
    const info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?/i);
    if (info) {
        data.protocol = info[1];
        data.host = info[2];
    }
    const pathInfo = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)/i);
    if (pathInfo) data.path = pathInfo[4];
    const queryInfo = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)\?(.*)/i);
    if (queryInfo) {
        data.query = queryInfo[5];
        data.path = queryInfo[4];
    }
    return data;
}

// Populate the table with entries
function load() {
    chrome.storage.local.get([STORAGE_KEYS.DOMAIN_LIST, STORAGE_KEYS.PROTECTED, STORAGE_KEYS.ICONIZE], (result) => {
        const domainList = result[STORAGE_KEYS.DOMAIN_LIST] || [];
        const protectedSettings = result[STORAGE_KEYS.PROTECTED] || { enabled: false, password: "" };
        const iconize = result[STORAGE_KEYS.ICONIZE] === "0";

        const body = document.getElementById('table');
        body.innerHTML = "";
        
        domainList.forEach((item, i) => {
            const tr = document.createElement('div');
            tr.appendChild(document.createElement('div')).textContent = item;
            
            const deleteBtn = document.createElement('div');
            deleteBtn.textContent = "X";
            deleteBtn.classList.add('x-btn');
            deleteBtn.index = i;
            deleteBtn.onclick = function() {
                domainList.splice(this.index, 1);
                chrome.storage.local.set({ [STORAGE_KEYS.DOMAIN_LIST]: domainList }, load);
            };
            tr.appendChild(deleteBtn);
            body.appendChild(tr);
        });

        // Toggle password protection settings
        togglePasswordProtection(protectedSettings.enabled);
        document.getElementById('checkbox').checked = protectedSettings.enabled;
        document.getElementById('password').value = protectedSettings.password;
        document.getElementById('hide').checked = localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_iconize'] == 0 ? true : false;
	

        // Display sync warning if necessary
        chrome.runtime.sendMessage({ action: "syncwarn" }, (msg) => {
            if (msg && msg.message && msg.message.length > 0) {
                document.getElementById('syncwarn_wrap').style.display = "block";
            }
        });
    });
}

// Toggle password protection UI elements
function togglePasswordProtection(enabled) {
    const elements = ['password', 'pwdBtn', 'resetBtn'];
    elements.forEach(id => {
        document.getElementById(id).disabled = !enabled;
    });
}

// Password login handler
function logged(isLoggedIn) {
    document.getElementById('panel').style.display = isLoggedIn ? "block" : "none";
    document.getElementById('box').style.display = isLoggedIn ? "none" : "block";
}

// Initialize event listeners on window load
window.onload = function() {
    load();

    document.getElementById('addBtn').onclick = function() {
        const urlInput = document.getElementById('url').value;
        if (!/^(http|https):\/\/(www\.)?\w*/.test(urlInput)) {
            alert('Invalid URL format!');
            return;
        }

        const host = URLComponents(urlInput).host.replace("www.", "");
        chrome.storage.local.get([STORAGE_KEYS.DOMAIN_LIST], (result) => {
            const domainList = result[STORAGE_KEYS.DOMAIN_LIST] || [];
            if (!domainList.includes(host)) {
                domainList.push(host);
                chrome.storage.local.set({ [STORAGE_KEYS.DOMAIN_LIST]: domainList }, load);
            }
        });
    };

    document.getElementById('checkbox').onclick = function() {
        const isEnabled = this.checked;
        togglePasswordProtection(isEnabled);
        chrome.storage.local.set({
            [STORAGE_KEYS.PROTECTED]: {
                enabled: isEnabled,
                password: document.getElementById('password').value
            }
        });
    };
	document.getElementById('hide').onclick = function(){
		localStorage['fgnnpnnjglioamgigfemklhmbfalegbj_iconize'] = this.checked ? 0 : 1;
	}
    document.getElementById('remBtn').onclick = function() {
        console.log("Sending message to background script to clear history.");
        chrome.runtime.sendMessage({ action: "rfh" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError.message);
                alert("Error: Could not clear history. " + chrome.runtime.lastError.message);
            } else if (response && response.status === "history cleared") {
                console.log("History cleared successfully.");
                alert("History cleared!");
            } else {
                console.error("Unexpected response or no response received:", response);
                alert("Error: Could not clear history.");
            }
        });
    };

    document.getElementById('pwdBtn').onclick = function() {
        chrome.storage.local.set({
            [STORAGE_KEYS.PROTECTED]: {
                enabled: document.getElementById('checkbox').checked,
                password: document.getElementById('password').value
            }
        }, () => {
            alert("Protection set!");
            location.reload();
        });
    };

    document.getElementById('passBtn').onclick = function() {
        const enteredPassword = document.getElementById('pwd').value;
        chrome.storage.local.get([STORAGE_KEYS.PROTECTED], (result) => {
            const savedPassword = (result[STORAGE_KEYS.PROTECTED] || {}).password;
            logged(enteredPassword === savedPassword);
        });
    };

    document.getElementById('resetBtn').onclick = function() {
        chrome.storage.local.set({
            [STORAGE_KEYS.PROTECTED]: { enabled: false, password: "" }
        }, () => {
            alert("Protection removed!");
            location.reload();
        });
    };

    chrome.storage.local.get([STORAGE_KEYS.PROTECTED], (result) => {
        const protectedSettings = result[STORAGE_KEYS.PROTECTED] || { enabled: false, password: "" };
        logged(!protectedSettings.enabled);
    });
};
