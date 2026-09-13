# newportfoliomedia

Portfolio technique de Lissandre Pasdeloup. Cinq projets, chacun laissé dans sa stack d’origine.

| Projet | Emplacement | Stack | Rôle |
| --- | --- | --- | --- |
| Folio Lissandre | racine | Next.js 16, React 19, R3F | Site vitrine minimal, sous construction |
| Beyond Memories | `sites/beyond_memories` | Webpack 5, Three.js r124 (historique) | Expérience interactive 3D desktop |
| Dametis | `sites/dametis` | Vite 6, React 19, Prompt API | Prototype d’IA on-device |
| Skat Designer | `sites/skatdesigner` | Vite 4, React 18, Tailwind | Site éditorial |
| Three.js template | `sites/three_template` | Webpack 5, Three.js r134 (historique) | **Template / expérimentation Three.js**, pas un produit fini |

## Lancer un projet

```bash
# Folio
npm install
npm run dev

# Beyond Memories (Node 17+ : OpenSSL legacy)
cd sites/beyond_memories && npm install && npm run dev

# Dametis
cd sites/dametis && npm ci && npm run dev

# Skat Designer
cd sites/skatdesigner && npm install && npm run dev

# Three.js template
cd sites/three_template && npm install && npm run dev
```

## Checks

```bash
npm run check          # folio only: lint, typecheck, tests, build
npm run lint:all
npm run test:all
npm run build:all
npm run check:all      # lint + tests + build for every project
```

CI GitHub Actions : `.github/workflows/ci.yml`.

## Notes

- Beyond Memories et le template Three.js sont des codebases 2021–2022. Three.js n’est **pas** upgradé ici.
- Le folio à la racine est la vitrine moderne. Le template Three.js sert à démarrer d’autres scènes, pas à se substituer au folio.
- Rapports : `ops/BASELINE_AUDIT.md`, `ops/PERFORMANCE.md`, `ops/DEPENDENCIES.md`, `ops/MERGE_READINESS.md`.
