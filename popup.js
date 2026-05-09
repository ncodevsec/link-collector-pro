let allLinksGlobal = [];
let currentCategory = "All";
let currentSearchQuery = "";

document.addEventListener("DOMContentLoaded", async () => {
	initTheme();
	const urlParams = new URLSearchParams(window.location.search);
	const isFullTab = urlParams.has("fullTab");

	if (isFullTab) {
		// ফুল ট্যাব মোডে থাকলে বডি ক্লাস এবং বাটন হাইড করা
		document.body.classList.add("full-tab");
		const openTabBtn = document.getElementById("openTabBtn");
		if (openTabBtn) {
			openTabBtn.style.display = "none"; // বাটনটি পুরোপুরি সরিয়ে ফেলবে
		}

		chrome.storage.local.get(["savedLinks"], (data) => {
			if (data.savedLinks) {
				allLinksGlobal = data.savedLinks;
				renderLinks();
			}
		});
	} else {
		// পপআপ মোডে থাকলে স্ক্র্যাপার রান করবে
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (tab.url.startsWith("chrome")) {
			return (document.getElementById("results").innerHTML =
				'<p class="text-red-500 text-center">Unavailable on this page.</p>');
		}

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
				} catch (e) {}
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

	// বর্তমান ট্যাব বা প্যারামিটার থেকে ডোমেইন আইডেন্টিফাই করা
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

	// ১. ট্যাবগুলোর লিঙ্ক কোয়ান্টিটি (Quantity) আপডেট করা
	const tabs = document.querySelectorAll("#tabBar .tab-item");
	tabs.forEach((tab) => {
		const type = tab.dataset.type;
		const count = allLinksGlobal.filter(
			(l) => type === "All" || l.category === type,
		).length;
		tab.innerHTML = `${type} <span class="tab-count">${count}</span>`;
	});

	// ২. লিঙ্ক ফিল্টারিং (Category + Search)
	const filteredLinks = allLinksGlobal
		.filter(
			(l) => currentCategory === "All" || l.category === currentCategory,
		)
		.filter((l) => {
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

	// ৩. ডোমেইন অনুযায়ী গ্রুপিং
	const grouped = filteredLinks.reduce((acc, link) => {
		(acc[link.domain] = acc[link.domain] || []).push(link);
		return acc;
	}, {});

	// ৪. ডোমেইন সর্টিং (Current Domain First)
	const sortedDomains = Object.keys(grouped).sort((a, b) => {
		if (a === fullCurrentDomain && b !== fullCurrentDomain) return -1;
		if (b === fullCurrentDomain && a !== fullCurrentDomain) return 1;

		const aIsRelated =
			a === mainBaseDomain || a.endsWith("." + mainBaseDomain);
		const bIsRelated =
			b === mainBaseDomain || b.endsWith("." + mainBaseDomain);

		if (aIsRelated && !bIsRelated) return -1;
		if (!aIsRelated && bIsRelated) return 1;

		const aRev = a.split(".").reverse().join(".");
		const bRev = b.split(".").reverse().join(".");
		return aRev.localeCompare(bRev);
	});

	// ৫. ডোমেইন কার্ড রেন্ডারিং
	for (const domain of sortedDomains) {
		const section = document.createElement("div");
		section.className = "cyber-card";

		const domainLinks = grouped[domain];
		const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
		const sortedLinks = domainLinks.sort((a, b) =>
			a.path.localeCompare(b.path),
		);

		section.innerHTML = `
      <div class="domain-header-box">
        <div class="flex items-center">
            <img src="${faviconUrl}" class="w-5 h-5 mr-3 rounded bg-white" onerror="this.src='images/links16.ico'">
            <h2 class="text-sm font-bold truncate" style="max-width: 250px;">${domain}</h2>
        </div>
        <span class="badge-count">${domainLinks.length} Links</span>
      </div>
      <ul class="space-y-2 ml-2">
        ${sortedLinks
			.map(
				(link) => `
          <li class="flex items-center text-sm">
            <span class="bullet-point mr-2">•</span>
            <a href="${link.fullUrl}" target="_blank" class="cyber-link" title="${link.fullUrl}">${link.path}</a>
          </li>
        `,
			)
			.join("")}
      </ul>
    `;
		resultsDiv.appendChild(section);
	}

	// ৬. 'No Results' হ্যান্ডলিং
	if (filteredLinks.length === 0) {
		const noResults = document.createElement("div");
		noResults.className =
			"flex flex-col items-center justify-center py-12 text-gray-500";
		noResults.innerHTML = `
      <div class="text-4xl mb-3">🔍</div>
      <p class="font-semibold">No links found</p>
      <p class="text-xs mt-1">Try adjusting your search or category filters</p>
    `;
		resultsDiv.appendChild(noResults);
	}

	// ৭. সার্চ রেজাল্ট কাউন্টার (সার্চ ইনপুটের নিচে)
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

document.getElementById("copyBtn").addEventListener("click", function () {
	const btn = this;
	const originalIcon = btn.innerHTML;

	// কপি করার লজিক
	let text = allLinksGlobal.map((l) => l.fullUrl).join("\n");
	navigator.clipboard.writeText(text);

	// টিক মার্ক আইকন (Lucide Check Icon)
	btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

	setTimeout(() => {
		btn.innerHTML = originalIcon; // ১.৫ সেকেন্ড পর আগের আইকনে ফিরবে
	}, 1500);
});
