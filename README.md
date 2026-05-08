# Link Collector Pro

A powerful Chrome extension to extract, categorize, and search all links on any webpage.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Available-brightgreen)

## Features

✨ **Intelligent Link Extraction**
- Automatically discovers all links on a webpage
- Supports hyperlinks, scripts, images, JSON, and resource files
- Handles parameters and query strings correctly

🏷️ **Smart Categorization**
- **Paths**: Regular URLs without file extensions
- **JS Files**: JavaScript resources (.js)
- **JSON**: JSON data files (.json)
- **Images**: Image assets (.png, .jpg, .gif, .svg, etc.)
- **Files**: Other file types with extensions

🔍 **Powerful Search**
- Real-time filtering by domain, path, or file extension
- Case-insensitive search
- Works across all categories

📊 **Professional UI**
- Two view modes: Popup and Full View
- Dark/Light theme support
- System-aware theme preference
- Beautiful gradient design with smooth transitions

📋 **Quick Actions**
- Copy all links with one click
- Organized by domain
- Proper subdomain sorting
- Alphabetical link ordering

⚡ **Optimized for Large Pages**
- Efficiently handles pages with thousands of links
- No performance degradation
- Responsive and fast

## Installation

### From Chrome Web Store
[Coming Soon - Available on Chrome Web Store]

### Manual Installation
1. Download or clone this repository
2. Open `chrome://extensions/` in Chrome
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension folder

## Usage

1. Click the **Link Collector Pro** icon in your browser toolbar
2. The extension automatically extracts all links from the current page
3. Use the **tabs** to filter by link type:
   - 📊 All Links
   - 🔗 Paths (regular URLs)
   - ⚙️ JS (JavaScript files)
   - 📄 JSON (JSON files)
   - 🖼️ Images (image files)
   - 📦 Files (other file types)

4. **Search** for specific links using the search box
5. Click **Copy All** to copy all displayed links to clipboard
6. Click **Full View** to see all links in a dedicated page
7. Toggle **Day/Night** mode for comfortable viewing

## Advanced Features

### Smart Domain Sorting
- Current website always appears at the top
- Subdomains grouped together
- Related domains prioritized
- Third-party domains sorted by TLD

### Flexible Filtering
- Search by domain name
- Search by file path
- Search by file extension
- Combine with category tabs for precise results

## Example Use Cases

- **Web Development**: Extract all API endpoints from a page
- **Security Research**: Collect all external resources and links
- **SEO Analysis**: Find all internal and external links
- **Content Curation**: Gather resource references
- **Data Collection**: Extract data file URLs (JSON, CSV, etc.)

## Technical Details

- **Manifest Version**: 3 (Latest)
- **Permissions**: activeTab, scripting, storage
- **Size**: Minimal (~50KB)
- **Performance**: Optimized for large pages

## File Structure

```
link-collector-pro/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI
├── popup.js              # Core logic
├── popup.css             # Styling
├── content.js            # Content script
├── img/                  # Icons and assets
│   ├── links16.png
│   ├── links48.png
│   └── links128.png
└── README.md             # This file
```

## Development

### Prerequisites
- Chrome 88+
- Basic knowledge of Chrome Extension APIs

### Building
No build process required! The extension is ready to use.

### Testing
1. Load the extension in developer mode
2. Open any website
3. Click the extension icon to test

## Keyboard Shortcuts

Future versions will include keyboard shortcuts for power users.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Author

**ncodevsec**
- GitHub: [@ncodevsec](https://github.com/ncodevsec)
- Email: Contact via GitHub

## License

MIT License - feel free to use this project as you wish!

## Changelog

### v1.0.0 (May 9, 2026)
- Initial release
- Full link extraction and categorization
- Search functionality
- Professional UI with dark mode
- Full view mode for detailed browsing

## Support

For issues, feature requests, or questions:
- Open an issue on [GitHub](https://github.com/ncodevsec)
- Check existing documentation

## Privacy Policy

Link Collector Pro:
- ✅ Does NOT collect user data
- ✅ Does NOT track browsing activity
- ✅ Does NOT require sign-in
- ✅ Works 100% offline
- ✅ All processing happens locally on your device

## Screenshots

### Popup View
Clean, organized interface with categories and search

### Full View
Dedicated page for detailed link browsing with better visibility

### Dark Mode
Professional dark theme for comfortable night browsing

---

Made with ❤️ by **ncodevsec**

⭐ If you find this extension useful, please star it on GitHub!
