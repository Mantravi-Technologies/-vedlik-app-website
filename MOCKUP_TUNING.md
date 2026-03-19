# Adjusting images inside the mobile mockup

The article and Signal images sit in a **content hole** over the mockup’s empty black area. If they overlap the header or footer, or feel too big/small, adjust the inset in code.

## Where to edit

**File:** `src/PhoneMockup.tsx`  
**Variables:** `CONTENT_INSET_MOBILE` and `CONTENT_INSET_DESKTOP` at the top of the file.

## What each value does

| Value   | Effect |
|--------|--------|
| **top**    | Distance from the **top** of the mockup. Increase if content is under the **header**. |
| **bottom** | Distance from the **bottom**. Increase if content is under the **footer**. |
| **left**   | Distance from the **left** edge. Increase to make the content area narrower. |
| **right**  | Distance from the **right** edge. Increase to make the content area narrower. |

All values are **percentages** of the mockup image size (e.g. `"12%"`).

## Quick fixes

- **Content overlapping the top nav** → Increase `top` (e.g. `"12%"` → `"14%"`).
- **Content overlapping the bottom nav** → Increase `bottom` (e.g. `"14%"` → `"16%"`).
- **Content too wide or touching sides** → Increase `left` and `right` (e.g. `"5%"` → `"6%"`).
- **Content too narrow** → Decrease `left` and `right` (e.g. `"5%"` → `"4%"`).

Change one value at a time, save, and check in the browser. Use small steps (e.g. 0.5% or 1%).

## Mobile vs desktop

- **`CONTENT_INSET_MOBILE`** is used for viewports **≤ 767px**.
- **`CONTENT_INSET_DESKTOP`** is used for **≥ 768px**.

Adjust the one that matches the size where the fit is wrong.
