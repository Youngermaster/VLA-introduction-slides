// Fonts are npm packages, NOT a CDN stylesheet.
//
// Slidev's `fonts:` headmatter generates a fonts.googleapis.com <link> that the
// BROWSER resolves at runtime — so a deck configured that way silently breaks in
// a venue with bad WiFi. We set `provider: none` in slides.md and import the
// woff2 files that ship inside these packages instead.
import '@fontsource-variable/instrument-sans'
import '@fontsource-variable/geist-mono'

import './tokens.css'
import './base.css'
import './slides.css'
import './motion.css'
