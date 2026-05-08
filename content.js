function collectAllLinks() {
	const links = [];

	const selectors = [
		"a[href]",
		"link[href]",
		"script[src]",
		"img[src]",
		"iframe[src]",
		"source[src]",
		"video[src]",
		"audio[src]",
		"[data-url]",
	];

	const elements = document.querySelectorAll(selectors.join(","));

	elements.forEach((el) => {
		const url = el.href || el.src || el.getAttribute("data-url");
		if (url) {
			links.push({ url: url, type: el.tagName });
		}
	});

	return links;
}

collectAllLinks();
