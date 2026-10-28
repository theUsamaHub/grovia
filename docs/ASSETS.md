# Asset and license ledger

| Asset                    | Source                     | License / status                                           | Bundled      |
| ------------------------ | -------------------------- | ---------------------------------------------------------- | ------------ |
| Grovia branding board    | User-provided reference    | Reference only; production artwork approval pending        | No           |
| Outfit 400/500/600/700   | @expo-google-fonts/outfit  | SIL Open Font License; license copied to docs/licenses     | Yes          |
| DM Sans 400/500/600      | @expo-google-fonts/dm-sans | SIL Open Font License; license copied to docs/licenses     | Yes          |
| Expo starter scaffolding | expo-template-default      | MIT notice retained in docs/licenses/expo-template-MIT.txt | Adapted code |

No ambient sounds, world sprites, app icons or additional illustrations are included yet. Record source, license, required attribution and optimization details here whenever production assets are added. No project-wide open-source license is selected by this setup.

## Phase 2 assets

- `assets/images/grovia-icon.png`: original Grovia tree icon generated with the built-in imagegen tool, 27 October 2026; opaque 1024px PNG.
- `assets/images/grovia-adaptive.png`: transparent adaptive foreground derived using imagegen; padded for Android launcher masks. Also used as in-app brand art.
- Prompt and design notes: [Brand, theme and storage](BRAND_THEME_STORAGE.md).

## Focus forest scene

- Output: `assets/images/forest-glade.jpg` (1024 × 1536).
- Source: generated with ImageGen on 27 October 2026; converted to JPEG for app packaging.
- Reference: project branding board for visual direction.
- Prompt: Original Grovia forest background, calm magical forest glade with a floating moss island, a single rounded leafy tree, pine trees and misty mountains, golden flowers, softly sculpted hand-painted 3D look, mint and forest green with cream sunlight, open top third. No UI, text, logos, people, animals or buildings.
