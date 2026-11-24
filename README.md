# Tricky Escape

A mobile-first visual puzzle game prototype built with **Phaser 3**, **TypeScript**, and **Vite**.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Current prototype

- Responsive portrait canvas (390 × 844 logical resolution)
- Menu screen and three experimental puzzle levels
- Pointer/touch interactions
- Object drag interactions
- Success feedback and level progression

## Deployment on Render

Create a **Static Site** connected to this repository:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`

The Vite build uses relative asset paths so it can also be hosted from a sub-path.

## Notes

This is an early gameplay prototype. Emoji are temporary visual placeholders; the next art pass will replace them with original illustrated assets.
