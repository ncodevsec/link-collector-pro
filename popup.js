let allLinksGlobal = [];
let currentCategory = "All";
let currentSearchQuery = "";

document.addEventListener("DOMContentLoaded", async () => {
	initTheme();
	const urlParams = new URLSearchParams(window.location.search);
	const isFullTab = urlParams.has("fullTab");

	if (isFullTab) {
		document.body.classList.add("full-tab");
		document.getElementById("openTabBtn").classList.add("hidden");
		chrome.storage.local.get(["savedLinks"], (data) => {
			if (data.savedLinks) {
				allLinksGlobal = data.savedLinks;
				renderLinks();
			}
		});
	} else {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (tab.url.startsWith("chrome"))
			return (document.getElementById("results").innerHTML =
				'<p class="text-red-500 text-center">Unavailable on this page.</p>');

		chrome.scripting.executeScript(
			{
				target: { tabId: tab.id },
				function: collectAllLinksInPage,
			},
			(results) => {
				if (results && results[0]) {
					allLinksGlobal = results[0].result;
					chrome.storage.local.set({ savedLinks: allLinksGlobal });
					renderLinks();
				}
			},
		);
	}
});

function collectAllLinksInPage() {
	const uniqueLinks = new Map();

	const selectors = [
		"a[href]", // Anchor tags
		"link[href]", // Link tags
		"script[src]", // Script tags
		"img[src]", // Image tags
		"iframe[src]", // Iframe tags
		"source[src]", // Media source tags
		"video[src]", // Video tags
		"audio[src]", // Audio tags
		"[data-url]", // Custom data-url attribute
	];

	const elements = document.querySelectorAll(selectors.join(","));

	elements.forEach((tag) => {
		let url = tag.href || tag.src || tag.getAttribute("data-url");
		if (url && url.startsWith("http")) {
			if (!uniqueLinks.has(url)) {
				const cleanUrl = url.split("?")[0].split("#")[0];

				let category = "";
				let hasFileExtension = false;

				if (cleanUrl.endsWith(".js")) {
					category = "JS Links";
					hasFileExtension = true;
				} else if (cleanUrl.endsWith(".json")) {
					category = "JSON Files";
					hasFileExtension = true;
				} else if (
					cleanUrl.match(/\.(jpeg|jpg|gif|png|svg|webp|ico)$/i)
				) {
					category = "Images";
					hasFileExtension = true;
				} else if (cleanUrl.match(/\.[a-zA-Z0-9]+$/)) {
					category = "Files";
					hasFileExtension = true;
				} else {
					category = "Paths";
					hasFileExtension = false;
				}

				try {
					const urlObj = new URL(url);
					uniqueLinks.set(url, {
						fullUrl: url,
						category: category,
						domain: urlObj.hostname,
						path:
							urlObj.pathname + urlObj.search + urlObj.hash ||
							"/",
					});
				} catch (e) {
				}
			}
		}
	});
	return Array.from(uniqueLinks.values());
}

document.getElementById("tabBar").addEventListener("click", (e) => {
	if (e.target.dataset.type) {
		document
			.querySelectorAll("#tabBar div")
			.forEach((el) => el.classList.remove("tab-active"));
		e.target.classList.add("tab-active");
		currentCategory = e.target.dataset.type;
		renderLinks();
	}
});

document.getElementById("searchInput").addEventListener("input", (e) => {
	currentSearchQuery = e.target.value.toLowerCase();
	renderLinks();
});

async function renderLinks() {
	const resultsDiv = document.getElementById("results");
	resultsDiv.innerHTML = "";

	const urlParams = new URLSearchParams(window.location.search);
	const isFullTab = urlParams.has("fullTab");

	let fullCurrentDomain = ""; 
	let mainBaseDomain = ""; 

	if (isFullTab) {
		const domainParam = urlParams.get("domain");
		if (domainParam) {
			fullCurrentDomain = domainParam;
			mainBaseDomain = domainParam.replace("www.", "");
		}
	} else {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		try {
			const url = new URL(tab.url);
			fullCurrentDomain = url.hostname;
			mainBaseDomain = url.hostname.replace("www.", "");
		} catch (e) {}
	}

	const filteredLinks = allLinksGlobal
		.filter(
			(l) => currentCategory === "All" || l.category === currentCategory,
		)
		.filter((l) => {
			// Apply search filter
			if (!currentSearchQuery) return true;
			const url = l.fullUrl.toLowerCase();
			const domain = l.domain.toLowerCase();
			const path = l.path.toLowerCase();
			return (
				url.includes(currentSearchQuery) ||
				domain.includes(currentSearchQuery) ||
				path.includes(currentSearchQuery)
			);
		});

	const grouped = filteredLinks.reduce((acc, link) => {
		(acc[link.domain] = acc[link.domain] || []).push(link);
		return acc;
	}, {});

	const sortedDomains = Object.keys(grouped).sort((a, b) => {
		if (a === fullCurrentDomain && b !== fullCurrentDomain) return -1;
		if (b === fullCurrentDomain && a !== fullCurrentDomain) return 1;

		const aIsRelated =
			a === mainBaseDomain || a.endsWith("." + mainBaseDomain);
		const bIsRelated =
			b === mainBaseDomain || b.endsWith("." + mainBaseDomain);

		if (aIsRelated && !bIsRelated) return -1;
		if (!aIsRelated && bIsRelated) return 1;

		if (aIsRelated && bIsRelated) {
			return a.localeCompare(b);
		}

		const aRev = a.split(".").reverse().join(".");
		const bRev = b.split(".").reverse().join(".");
		return aRev.localeCompare(bRev);
	});

	for (const domain of sortedDomains) {
		const section = document.createElement("div");
		section.className =
			"bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 transition-colors duration-300";

		const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;

		const sortedLinks = grouped[domain].sort((a, b) =>
			a.path.localeCompare(b.path),
		);

		section.innerHTML = `
      <div class="flex items-center mb-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg transition-colors">
        <img src="${faviconUrl}" class="w-5 h-5 mr-3 rounded bg-white" onerror="this.src='images/links16.ico'">
        <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">${domain}</h2>
      </div>
      <ul class="space-y-2 ml-2">
        ${sortedLinks
			.map(
				(link) => `
          <li class="flex items-center text-sm">
            <span class="text-blue-500 mr-2">•</span>
            <a href="${link.fullUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline link-text" title="${link.fullUrl}">${link.path}</a>
          </li>
        `,
			)
			.join("")}
      </ul>
    `;
		resultsDiv.appendChild(section);
	}

	// Show no results message if needed
	if (filteredLinks.length === 0) {
		const noResults = document.createElement("div");
		noResults.className = "flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400";
		noResults.innerHTML = `
      <div class="text-4xl mb-3">🔍</div>
      <p class="font-semibold">No links found</p>
      <p class="text-xs mt-1">Try adjusting your search or category filters</p>
    `;
		resultsDiv.appendChild(noResults);
	}

	// Update search results counter
	const searchResultsEl = document.getElementById("searchResults");
	if (currentSearchQuery && filteredLinks.length > 0) {
		searchResultsEl.textContent = `Found ${filteredLinks.length} link${filteredLinks.length !== 1 ? "s" : ""}`;
		searchResultsEl.classList.remove("hidden");
	} else {
		searchResultsEl.classList.add("hidden");
	}
}

function initTheme() {
	const select = document.getElementById("themeSelect");
	const applyTheme = (theme) => {
		const isDark =
			theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);
		if (isDark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	};

	select.addEventListener("change", (e) => {
		applyTheme(e.target.value);
		localStorage.setItem("theme", e.target.value);
	});

	const savedTheme = localStorage.getItem("theme") || "system";
	select.value = savedTheme;
	applyTheme(savedTheme);
}

document.getElementById("openTabBtn").addEventListener("click", async () => {
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	const url = new URL(tab.url);
	const domain = url.hostname;
	chrome.tabs.create({
		url: chrome.runtime.getURL(`popup.html?fullTab=true&domain=${domain}`),
	});
});

document.getElementById("copyBtn").addEventListener("click", () => {
	let text = allLinksGlobal.map((l) => l.fullUrl).join("\n");
	navigator.clipboard.writeText(text);

	const originalText = document.getElementById("copyBtn").innerText;
	document.getElementById("copyBtn").innerText = "Copied!";
	setTimeout(
		() => (document.getElementById("copyBtn").innerText = originalText),
		1500,
	);
});
