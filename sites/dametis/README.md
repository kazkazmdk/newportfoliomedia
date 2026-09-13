# Dametis

On-device Language Model chat prototype. It uses the browser Prompt API when present and never requires a remote AI backend.

## Run

```sh
npm ci
npm run dev
```

Chrome / Edge with the on-device Prompt API is required to actually chat. Other browsers show an unsupported state instead of a silent Send button.

## Checks

```sh
npm run lint
npm test
npm run build
```

Conversations are stored locally in IndexedDB and restored from `/:id`.
