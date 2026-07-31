# BMW Arcade Racer Design

## Goal

Create a single-page, browser-playable top-down arcade racing game themed around BMW road cars, with a selectable roster of real model names and clear powertrain labels for petrol, diesel, and electric variants.

## Player experience

- The player chooses a representative BMW model from a searchable/filterable roster.
- Each vehicle card shows model, body style, powertrain, and four arcade stats: top speed, acceleration, handling, and braking.
- The race runs on an autobahn-inspired circuit with three laps, traffic cars, road-edge slowdown, checkpoints, a live timer, speed readout, and best-time persistence in the browser.
- Keyboard controls use WASD or arrow keys; touch controls are available for smaller screens.
- After finishing, the player sees the final time, best time, and a restart action.

## Vehicle roster

The roster includes representative current BMW model families and variants, including iX1, iX2, iX3, iX, 1/2/3/4/5/7/8 Series, X1/X2/X3/X5/X7, Z4, M2/M3/M4/M5/M8, i4/i5/i7, and representative petrol and diesel derivatives. Each entry has an explicit `fuel` value: `가솔린`, `디젤`, or `전기`. Exact current naming is verified against BMW's published model pages before implementation.

## Visual direction

Dark graphite race UI, electric blue accents, white telemetry, amber warnings, and a warm asphalt circuit. The car illustrations are original simplified top-down silhouettes rather than official logos or image assets. The screen is organized around the game canvas, a compact race HUD, and a responsive vehicle garage panel.

## Technical shape

- One route and one client-side React page.
- HTML canvas owns the animated race scene and collision loop.
- React state owns garage filters, selected vehicle, race status, telemetry, and local best time.
- CSS provides the visual system, responsive layout, and touch control buttons.
- No backend or external account is required.

## Validation

- Production build must complete successfully.
- The UI must expose accessible labels for vehicle filters, start/restart actions, and touch controls.
- Keyboard and touch controls must map to the same movement state.
- A completed race must save and display the best time locally.
