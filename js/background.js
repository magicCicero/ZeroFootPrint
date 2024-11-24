function URLComponents(link) {
    const data = { url: link, protocol: "", host: "", port: "", path: "", query: "" };
    let info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?/i);
    if (info !== null) {
        data.protocol = info[1];
        data.host = info[2];
    }
    info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)/i);
    if (info !== null) {
        data.path = info[4];
    }
    info = link.match(/(http|https):\/\/([a-z0-9\.-]*)(:\d*)?\/(.*)\?(.*)/i);
    if (info !== null) {
        data.query = info[5];
        data.path = info[4];
    }
    return data;
}
chrome.runtime.onStartup.addListener(() => {
    doHistoryClear();
});

async function doHistoryClear() {
    console.log("Starting full history clear process");

    try {
        const result = await chrome.storage.local.get(['fgnnpnnjglioamgigfemklhmbfalegbj']);
        const historyList = result.fgnnpnnjglioamgigfemklhmbfalegbj || [];
        console.log("Domains to delete from history:", historyList);
        if (historyList.length === 0) {
            // No domains specified, clear all history
            console.log("No specific domains. Clearing all history...");
            await chrome.history.deleteAll();
            console.log("All history cleared.");
        } else {
            // Clear history only for specified domains
            console.log("Domains to delete from history:", historyList);
            for (const domain of historyList) {
                await deleteHistory(domain);
            }
            console.log("History deletion completed for all specified domains.");
        }

        console.log("History deletion completed for all specified domains.");
    } catch (error) {
        console.error("Error in doHistoryClear:", error);
        throw error;
    }
}

async function deleteHistory(domain) {
    console.log("Starting comprehensive history deletion for domain:", domain);

    if (!domain) {
        console.warn("No domain provided for history deletion.");
        return;
    }

    // Array of search terms to catch different URL patterns
    const searchPatterns = [
        `https://${domain}`,
        `https://www.${domain}`,
        `${domain}`, // Search for the domain itself
        `.${domain}`, // Any subdomain under the domain
    ];

    let deletedCount = 0;

    try {
        // Loop through each pattern to ensure we catch all variations
        for (const pattern of searchPatterns) {
            console.log(`Searching and deleting history for pattern: ${pattern}`);
            
            // Continue deleting in a loop until no more matches are found
            let items;
            do {
                items = await chrome.history.search({ text: pattern, startTime: 0, maxResults: 100 });
                console.log(`Found ${items.length} items for pattern "${pattern}"`);

                for (const item of items) {
                    console.log(`Deleting URL from history: ${item.url}`);
                    await chrome.history.deleteUrl({ url: item.url });
                    deletedCount++;
                }
            } while (items.length > 0); // Repeat if items are still found
        }

        console.log(`Total deleted history entries for ${domain}: ${deletedCount}`);
    } catch (error) {
        console.error(`Failed to delete history for domain: ${domain}`, error);
        throw error;
    }
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Received message in background script:", msg); // This should log every time a message is received

    if (msg.action === 'rfh') {
        console.log("Action 'rfh' received, attempting to clear history...");

        (async () => {
            try {
                await doHistoryClear();
                console.log("History cleared successfully.");
                sendResponse({ status: "history cleared" });
            } catch (error) {
                console.error("Error during history clearing:", error);
                sendResponse({ status: "error", error: error.message });
            }
        })();
        return true; // Keeps the message port open for asynchronous operations
    } else {
        console.warn("Unknown action received:", msg.action);
        sendResponse({ status: "unknown action" });
    }
});

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.url) {
        chrome.storage.local.get(['fgnnpnnjglioamgigfemklhmbfalegbj', 'fgnnpnnjglioamgigfemklhmbfalegbj_iconize'], (result) => {
            const historyList = result.fgnnpnnjglioamgigfemklhmbfalegbj || [];
            const iconize = result.fgnnpnnjglioamgigfemklhmbfalegbj_iconize === 1;

            const url = URLComponents(tab.url);
            const isEnabled = historyList.includes(url.host.replace("www.", ""));
            const iconPath = iconize && isEnabled ? "/icons/icon19.png" : "/icons/icon19.png";
            
            // Set icon and title for the tab, handling potential errors
            chrome.tabs.get(tabId, function(tab) {
                if (chrome.runtime.lastError || !tab) {
                    console.warn("Tab not found:", chrome.runtime.lastError?.message);
                    return;
                }
                chrome.action.setIcon({ tabId: tabId, path: iconPath });
                chrome.action.setTitle({ tabId: tabId, title: isEnabled ? "Enabled" : "Disabled" });
            });
        });
    }
});

// Open options.html when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL("/pages/options.html") });
});

// Set up initial data on first install and open the options page
chrome.runtime.onInstalled.addListener((detail) => {
    const initialData = {
        fgnnpnnjglioamgigfemklhmbfalegbj: [],
        fgnnpnnjglioamgigfemklhmbfalegbj_protected: { enabled: false, password: "" },
        fgnnpnnjglioamgigfemklhmbfalegbj_iconize: 1,
        report_setting: '{"reporting":3,"schedule":1,"amazon":0,"tracking":0}',
        tag_amazon: null,
        tag_amazon_time: null,
        freq_track: '{}',
        track_date: new Date().toString()
    };
    chrome.storage.local.set(initialData);

    if (detail.reason === "install") {
        chrome.tabs.create({ url: chrome.runtime.getURL("/pages/options.html") });
    }
});

// Clear history when a Chrome window is closed
chrome.windows.onRemoved.addListener(() => {
    doHistoryClear();
});
