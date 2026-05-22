# NatArt Vibes

NatArt Vibes is a static website for a boutique music studio offering violin,
piano, and music history lessons.

## Pages

- `index.html` - home page with hero section and lesson highlights.
- `about.html` - biography, studio philosophy, creative work, and links.
- `lessons.html` - lesson programs, learning outcomes, and format table.
- `reviews.html` - student and family testimonials.
- `contacts.html` - contact page with an HTML5-validated inquiry form.

## Project Structure

```text
natart-vibes-web_labs/
  css/
    base.css
    components.css
    layout.css
    pages.css
    style.css
  images/
  js/
    main.js
  about.html
  contacts.html
  index.html
  lessons.html
  reviews.html
```

## Technologies

- Semantic HTML5 structure: `header`, `nav`, `main`, `section`, `article`,
  `footer`, forms, lists, tables, and accessible image `alt` text.
- CSS imported through `css/style.css`, organized into base, layout,
  components, and page-specific files.
- CSS Flexbox and Grid for responsive page layout.
- Media queries for desktop, tablet, and mobile views.
- HTML5 form validation with required fields, email input, minlength values,
  and CSS error styling.
- JavaScript for the mobile navigation menu and interactive About page links.
- Dynamic footer date generated with JavaScript.
- Accordion-style "Show More" content on the home page.
- JavaScript-driven navigation hover highlighting.
- Keyboard events: `ArrowUp` increases site font size, `ArrowDown` decreases it.
- Custom JavaScript contact form validation, submit handling, console output,
  success/error messages, and LocalStorage storage of the last submitted name.
