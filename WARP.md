# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SURGE is a website project for surge.ngo, built as a WordPress theme with custom styling and interactive features. The project combines traditional WordPress theming with modern front-end development practices.

## Architecture

### Directory Structure
- `wp-content/themes/composer/` - WordPress theme files (minimal, mainly contains menu.js)
- `scss/` - SASS/SCSS source files for styling
- `css/` - Compiled CSS output files
- `js/` - JavaScript files for site functionality
- `images/` - Website assets and background images

### Key Files
- `scss/surge-styles.scss` - Main SASS file with comprehensive styling system including:
  - Responsive breakpoint mixins
  - Color and design system variables
  - Custom WordPress theme overrides
- `css/surge-styles.css` - Compiled CSS for production use
- `js/surge-script.js` - Custom JavaScript for site interactions (header animations, random backgrounds)
- `js/menu.js` - jQuery Superfish menu plugin for navigation

### Styling Architecture
The project uses a sophisticated SASS-based styling system with:
- **Breakpoint System**: Comprehensive responsive design with mixins for different screen sizes (xxs, xs, sm, md, lg, xl, xxl)
- **Design Variables**: Centralized color palette, background images, transitions, and typography
- **WordPress Integration**: Custom styling that overrides the Composer theme
- **Background System**: Dynamic background image rotation using CSS classes and JavaScript

### JavaScript Features
- **Header Animation**: Scroll-based header hide/show with transparency effects
- **Random Backgrounds**: Dynamic background image selection from 5 predefined options
- **Menu System**: jQuery Superfish dropdown navigation with touch support

## Common Development Commands

### SASS Compilation
Since there's no package.json or build configuration, SASS compilation is likely handled manually or through an external tool:

```bash
# Compile SASS to CSS (requires sass CLI tool)
sass scss/surge-styles.scss css/surge-styles.css

# Watch for changes and auto-compile
sass --watch scss/surge-styles.scss:css/surge-styles.css

# Compile with compressed output
sass scss/surge-styles.scss css/surge-styles.css --style compressed
```

### Git Workflow
The project uses a development branch workflow:

```bash
# Switch to development branch (current working branch)
git checkout development

# Create feature branch
git checkout -b feature/new-feature

# Push to development
git push origin development

# Merge to main for production
git checkout main
git merge development
git push origin main
```

### File Watching and Development
```bash
# Watch SCSS files for changes (if using VS Code with SASS extensions)
# Or use sass command line with --watch flag

# Serve files locally (if using Live Server or similar)
# Point to the root directory to test the complete site structure
```

## WordPress Integration Notes

- The theme appears to be based on the "Composer" theme
- Custom JavaScript removes default theme credits on load
- Header styling includes fixed positioning with scroll-based animations
- The site uses custom background image rotation system
- Menu system uses jQuery Superfish for enhanced dropdown functionality

## Development Workflow

1. **Styling Changes**: Edit `scss/surge-styles.scss` and compile to `css/surge-styles.css`
2. **JavaScript Updates**: Modify `js/surge-script.js` for site interactions or `js/menu.js` for navigation
3. **Assets**: Add new images to the `images/` directory and reference them in SCSS variables
4. **Testing**: Test on multiple breakpoints as the project has comprehensive responsive design
5. **Deployment**: Ensure compiled CSS is up-to-date before committing

## Important Considerations

- Always compile SASS before committing changes
- The project includes 5 background images that rotate randomly - ensure all are optimized
- Header animations are scroll-dependent, test across different screen sizes
- The project targets surge.ngo domain, so image paths reference the live site
- Menu.js is a third-party library (jQuery Superfish) - avoid modifying core functionality