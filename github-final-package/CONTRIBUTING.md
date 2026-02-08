# Contributing to Worth My Time

Thank you for your interest in contributing! Worth My Time is a privacy-first Chrome extension, and we welcome contributions that align with our core values.

## 🎯 Core Values

All contributions must respect these principles:

1. **Privacy First** - No data collection, tracking, or transmission
2. **User Benefit** - Features must genuinely help users
3. **Performance** - Keep it fast and lightweight
4. **Simplicity** - Clear, maintainable code
5. **Transparency** - Open source and auditable

## 🐛 Reporting Bugs

### Before Submitting

- Check [existing issues](https://github.com/luke1278/worth-my-time/issues)
- Try the latest version
- Disable other extensions to rule out conflicts

### Bug Report Template

```markdown
**Extension Version:** 2.6.0
**Chrome Version:** 120.0.6099.109
**Operating System:** Windows 11 / macOS 14 / Linux

**Website:** https://example.com/product

**Expected Behavior:**
Prices should be converted to work time

**Actual Behavior:**
Prices are not detected

**Screenshots:**
[Attach screenshot]

**Console Output:**
[Open DevTools → Console, paste any errors]
```

## 💡 Suggesting Features

Start a [GitHub Discussion](https://github.com/luke1278/worth-my-time/discussions) with:

- **Problem:** What issue does this solve?
- **Solution:** How would this feature work?
- **Privacy Impact:** Does it require new permissions or data?
- **Use Case:** Real-world example

## 🌐 Adding New Site Support

The most common contribution! Here's how:

### Step 1: Analyze the Site

1. **Visit the target website**
2. **Open DevTools** (F12)
3. **Inspect price elements**
4. **Note the selectors:**
   ```html
   <span class="product-price">$99.99</span>
   ```
   Selector: `.product-price`

### Step 2: Add Site Detector

Edit `content.js` and add your detector after the existing ones:

```javascript
// YOUR SITE NAME
yoursite: {
  detect: function(hostname) {
    return hostname.includes('yoursite.com');
  },
  
  patterns: [
    {
      name: 'YourSite Product Price',
      selector: '.product-price, .price-main',
      validate: function(element) {
        if (element.querySelector('.timeprice-converted')) return false;
        return !isStrikethrough(element);
      }
    }
  ],
  
  process: amazon.process // Reuse Amazon's process function
}
```

### Step 3: Test Thoroughly

Test on:
- ✅ Product detail pages
- ✅ Search results pages
- ✅ Category listing pages
- ✅ Sale/deals pages

Check for:
- ✅ No duplicate conversions
- ✅ Strikethrough prices are skipped
- ✅ Promotional numbers are filtered out

### Step 4: Submit PR

Include:
- Screenshots showing before/after
- List of tested page types
- Notes about any edge cases

## 💻 Development Setup

### Prerequisites

- Chrome 88+ or Chromium-based browser
- Text editor (VS Code recommended)
- Git

### Local Setup

```bash
# Fork and clone
git clone https://github.com/luke1278/worth-my-time.git
cd worth-my-time

# Create feature branch
git checkout -b feature/your-feature-name

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the cloned folder
```

### Making Changes

1. **Edit files** in your text editor
2. **Reload extension** in Chrome (chrome://extensions → reload button)
3. **Test on target websites**
4. **Check console** for errors (F12 → Console tab)

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Welcome page works on first install
- [ ] Settings popup opens and saves correctly
- [ ] Prices are detected on test sites
- [ ] No duplicate conversions
- [ ] No console errors
- [ ] Performance is good (<100ms detection)

## 📝 Code Style

### JavaScript

```javascript
// Use clear variable names
const hourlyRate = calculateHourlyRate(salary, hours);

// Add comments for complex logic
// Skip strikethrough prices (old/was prices)
if (isStrikethrough(element)) return;

// Use consistent formatting
function detectPrices() {
  const elements = document.querySelectorAll('.price');
  elements.forEach(element => {
    // Process element
  });
}
```

### Naming Conventions

- **Functions:** `camelCase` (e.g., `calculateWorkTime`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_PRICE`)
- **Variables:** `camelCase` (e.g., `totalConverted`)
- **CSS Classes:** `kebab-case` (e.g., `timeprice-converted`)

## 🔒 Privacy Guidelines

**CRITICAL:** All contributions must maintain zero data collection.

### ✅ Allowed

- Reading visible price text from webpages
- Storing user settings in local Chrome storage
- Processing data entirely on the user's device

### ❌ Forbidden

- Network requests to external servers
- Collecting browsing history or behavior
- Transmitting ANY user data
- Third-party analytics or tracking
- Cookies or persistent identifiers

## 📤 Pull Request Process

### Before Submitting

1. ✅ Test thoroughly on multiple sites
2. ✅ Check for console errors
3. ✅ Update version number in `manifest.json`
4. ✅ Add entry to CHANGELOG (if major feature)
5. ✅ Update README if adding features

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New site support
- [ ] Feature enhancement
- [ ] Documentation update

## Testing
Tested on:
- [ ] Amazon
- [ ] [Your target site]
- [ ] Chrome 120
- [ ] Edge 120

## Screenshots
[Add screenshots showing the feature]

## Checklist
- [ ] Code follows style guidelines
- [ ] No new permissions required
- [ ] Privacy policy still accurate
- [ ] No console errors
- [ ] Tested on multiple pages
```

### Review Process

1. **Automated checks** run on all PRs
2. **Maintainer reviews** code and tests
3. **Feedback** is provided within 48 hours
4. **Merge** happens after approval

## 🏆 Recognition

Contributors are recognized in:

- **CONTRIBUTORS.md** - Full list of contributors
- **README.md** - Acknowledgments section
- **Release notes** - Credited in version announcements
- **Chrome Web Store** - Listed in extension description

## 📞 Getting Help

Stuck? Reach out:

- 💬 [GitHub Discussions](https://github.com/luke1278/worth-my-time/discussions)
- 📧 Email: luke1278@gmail.com
- 🐛 [Issue Tracker](https://github.com/luke1278/worth-my-time/issues)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and harassment-free experience for everyone.

### Our Standards

**Positive behavior:**
- ✅ Being respectful and inclusive
- ✅ Accepting constructive criticism
- ✅ Focusing on what's best for the community
- ✅ Showing empathy towards others

**Unacceptable behavior:**
- ❌ Harassment or discrimination
- ❌ Trolling or insulting comments
- ❌ Personal or political attacks
- ❌ Publishing others' private information

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: luke1278@gmail.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make Worth My Time better!** 🎉

Every contribution, no matter how small, helps users make smarter purchasing decisions.
