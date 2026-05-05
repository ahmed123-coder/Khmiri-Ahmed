# Implementation Plan: Dynamic CMS Sections

## Overview

Refactor the portfolio CMS from a flat `Site` model with hardcoded fields into a dynamic, section-based content system. The implementation proceeds in layers: schema first, then backend API, then frontend admin UI, then public homepage renderer, and finally property-based tests.

## Tasks

- [x] 1. Update the Mongoose Site schema
  - [x] 1.1 Add `SectionSchema` subdocument and update `SiteSchema` in `backend/models/contentsite.js`
    - Define `SectionSchema` with fields: `key` (String, required, enum: `["hero","skills","services","footer","about","projects"]`), `title` (String), `subtitle` (String), `content` (String), `image` (String), `order` (Number, required), `visible` (Boolean, default `true`)
    - Change `selected` from `{ type: String, enum: ['selected','not selected'] }` to `{ type: Boolean, default: false }`
    - Remove deprecated fields: `siteDescription`, `hero`, `heroTitle`, `heroName`, `skillsTitle`, `serviceDescription`, `footer`, `logohero`
    - Add `sections: [SectionSchema]` to `SiteSchema`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.2 Write unit tests for schema defaults
    - Verify `visible` defaults to `true` on a new `SectionSchema` instance
    - Verify `selected` defaults to `false` on a new `SiteSchema` instance
    - Verify that deprecated fields (`siteDescription`, `hero`, `logohero`, etc.) are no longer present on the schema
    - _Requirements: 1.2, 1.4_

- [x] 2. Create the sections REST API (`backend/routes/sections.js`)
  - [x] 2.1 Implement `POST /api/site/:siteId/sections` — add section with optional image upload
    - Reuse the existing `CloudinaryStorage` config from `routes/contentsite.js`
    - Accept `multipart/form-data` via `multer`; store Cloudinary URL in `section.image`
    - When `order` is omitted, default to `site.sections.length` (append to end)
    - Validate `key` against the enum; return 400 on invalid value
    - Return 201 with the updated Site document
    - _Requirements: 2.1, 2.7, 2.8, 1.5, 12.1, 12.2, 12.4_

  - [ ]* 2.2 Write property test for section addition auto-order (Property 1)
    - **Property 1: Section addition appends with correct auto-order**
    - **Validates: Requirements 1.5, 2.1**

  - [x] 2.3 Implement `PUT /api/site/:siteId/sections/reorder` — bulk reorder by ID array
    - Register this route **before** `PUT /:sectionId` to prevent Express matching `"reorder"` as a param
    - Accept `{ sectionIds: string[] }` in the request body
    - Return 400 with `"Section ID count mismatch"` if array length ≠ `site.sections.length`
    - Return 400 with `"Unknown section ID: <id>"` for any unrecognised ID
    - Assign each section's `order` to its 0-based index in the provided array
    - Return 200 with the updated Site document
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.4 Write property test for reorder assigns positions matching array index (Property 6)
    - **Property 6: Reorder assigns positions matching array index**
    - **Validates: Requirements 3.1**

  - [x] 2.5 Implement `PUT /api/site/:siteId/sections/:sectionId` — update section fields
    - Accept partial updates; only overwrite fields present in the request body
    - If no new image file is uploaded, retain the existing `section.image` URL unchanged
    - Return 404 if `siteId` or `sectionId` not found
    - Return 200 with the updated Site document
    - _Requirements: 2.2, 2.5, 2.6, 12.3_

  - [ ]* 2.6 Write property test for partial update preserves unmodified fields (Property 2)
    - **Property 2: Partial update preserves unmodified fields**
    - **Validates: Requirements 2.2**

  - [x] 2.7 Implement `PUT /api/site/:siteId/sections/:sectionId/toggle` — toggle `visible`
    - Invert the current `visible` boolean value of the matching section
    - Return 404 if `siteId` or `sectionId` not found
    - Return 200 with the updated Site document
    - _Requirements: 4.1, 4.2_

  - [ ]* 2.8 Write property test for visibility toggle inverts the current value (Property 7)
    - **Property 7: Visibility toggle inverts the current value**
    - **Validates: Requirements 4.1**

  - [x] 2.9 Implement `DELETE /api/site/:siteId/sections/:sectionId` — remove section
    - Remove the matching section from `site.sections`
    - Return 404 if `siteId` or `sectionId` not found
    - Return 200 with the updated Site document
    - _Requirements: 2.3, 2.5, 2.6_

  - [ ]* 2.10 Write property test for delete removes exactly the targeted section (Property 3)
    - **Property 3: Delete removes exactly the targeted section**
    - **Validates: Requirements 2.3**

  - [ ]* 2.11 Write property test for protected endpoints reject unauthenticated requests (Property 4)
    - **Property 4: Protected endpoints reject unauthenticated requests**
    - **Validates: Requirements 2.4, 3.4, 4.3**

  - [ ]* 2.12 Write property test for invalid section key is rejected (Property 5)
    - **Property 5: Invalid section key is rejected**
    - **Validates: Requirements 2.8**

- [x] 3. Update `backend/routes/contentsite.js` for schema compatibility
  - [x] 3.1 Remove deprecated fields from `POST /api/site` and `PUT /api/site/:id` handlers
    - Remove `logohero` from `upload.fields([...])` — only `logoheader` is required
    - Remove `siteDescription`, `hero`, `heroTitle`, `heroName`, `skillsTitle`, `serviceDescription`, `footer`, `logohero` from body destructuring and `updateFields` object
    - Return 400 with `"logoheader is required"` when `logoheader` file is absent on POST
    - _Requirements: 10.1, 10.2, 10.5_

  - [x] 3.2 Update `PUT /api/site/:id/select` and `PUT /api/site/:id/deselect` for Boolean `selected`
    - `select`: use `await Site.updateMany({}, { selected: false })` then set `selected: true`
    - `deselect`: set `selected: false`
    - _Requirements: 10.3_

  - [x] 3.3 Update `GET /api/site/selected` to query Boolean and sort sections by `order`
    - Query `Site.findOne({ selected: true })` (was `"selected"`)
    - After finding the site, sort `site.sections` ascending by `order` before returning
    - Retain fallback to first available site and empty-object response when DB is empty
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 3.4 Write property test for GET /selected returns sections sorted ascending by order (Property 8)
    - **Property 8: GET /selected returns sections sorted ascending by order**
    - **Validates: Requirements 5.1**

- [x] 4. Mount the sections router in `backend/server.js`
  - Import `backend/routes/sections.js` as `routerSections`
  - Add `app.use("/api/site", routerSections)` **after** the existing `app.use("/api/site", routerSite)` line
  - _Requirements: 2.1, 3.1, 4.1_

- [ ] 5. Checkpoint — Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create the Section Manager admin page (`frontend/src/pages/sectionsadmin.jsx`)
  - [x] 6.1 Build the `SiteSelector` dropdown and initial data loading
    - Fetch all sites from `GET /api/site` on mount
    - Default the selected site to the one with `selected === true`
    - Display an empty-state message when no sites exist
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 6.2 Build the `SectionList` with visibility toggle and delete controls
    - Render sections sorted by `order`; show `key` badge, `title`, `order`, and `visible` status per row
    - Sections with `visible: false` show reduced opacity and a "Hidden" badge
    - Visibility toggle button calls `PUT /api/site/:siteId/sections/:sectionId/toggle` and refreshes list
    - Delete button opens `ConfirmModal`; on confirm calls `DELETE /api/site/:siteId/sections/:sectionId`
    - Use violet/purple gradient theme (`linear-gradient(135deg, #AA367C, #4A2FBD)`)
    - _Requirements: 6.1, 6.2, 6.5, 6.6, 6.7, 6.8_

  - [x] 6.3 Build the `SectionForm` for create and edit
    - Fields: `key` (select dropdown with 6 enum options, required), `title`, `subtitle`, `content` (textarea), `order` (number), image upload with preview
    - On submit for new section: call `POST /api/site/:siteId/sections` (multipart/form-data)
    - On submit for existing section: call `PUT /api/site/:siteId/sections/:sectionId`
    - Show success toast on completion; show error toast on failure; reset form and refresh list on success
    - "Cancel" button resets the form without submitting
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 6.4 Integrate `@dnd-kit/core` and `@dnd-kit/sortable` for drag-and-drop reorder
    - Install `@dnd-kit/core` and `@dnd-kit/sortable` as frontend dependencies
    - Wrap `SectionList` in `DndContext` + `SortableContext`; each row uses `useSortable`
    - On `onDragEnd`, snapshot pre-drag order in a `useRef`, optimistically update local state, then call `PUT /api/site/:siteId/sections/reorder`
    - On API failure, revert to the pre-drag snapshot and show an error toast
    - Show a drag handle indicator on each row while dragging
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 6.5 Write unit tests for Section Manager UI
    - Test that the section form renders all required fields (key dropdown, title, subtitle, content, order, image upload)
    - Test that sections with `visible: false` show the "Hidden" badge
    - Test that the site selector defaults to the selected site
    - _Requirements: 6.2, 6.7, 11.3_

- [x] 7. Add "Sections" nav entry and register the route
  - [x] 7.1 Add "Sections" entry to `frontend/src/components/sidebaradmin.jsx`
    - Import a suitable icon (e.g., `Layers` from `lucide-react`)
    - Add `{ to: '/admin/ManageSections', label: 'Sections', icon: Layers }` to the `navItems` array
    - _Requirements: 6.3_

  - [x] 7.2 Register the `ManageSections` route in `frontend/src/App.jsx`
    - Import `ManageSections` from `./pages/sectionsadmin`
    - Add `<Route path="ManageSections" element={<ManageSections />} />` inside the `/admin` nested routes
    - _Requirements: 6.3_

- [x] 8. Update `frontend/src/pages/home.jsx` — dynamic Section Renderer
  - [x] 8.1 Replace fixed prop passing with a `SECTION_MAP` dynamic renderer
    - Define `SECTION_MAP` mapping each valid key to a render function:
      - `"hero"` → `<Banner heroTitle={s.title} heroName={s.subtitle} hero={s.content} logohero={s.image} roles={site.roles} />`
      - `"skills"` → `<Skills skillsTitle={s.title} />`
      - `"services"` → `<Services serviceDescription={s.content} />`
      - `"footer"` → `<Footer footer={s.content} />`
      - `"about"` → `<About section={s} />` (if component exists)
      - `"projects"` → `<Projects />`
    - Filter `siteContent.sections` to `visible === true`, sort ascending by `order`, then map through `SECTION_MAP`
    - `NavBar` continues to receive global fields (`logoheader`, `siteName`, `linkedIn`, `facebook`, `instagram`) directly from `siteContent`
    - Retain skeleton components (`BannerSkeleton`, `SkillsSkeleton`, `ProjectsSkeleton`) during loading
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

  - [ ]* 8.2 Write property test for Section Renderer displays only visible sections in order (Property 9)
    - **Property 9: Section Renderer displays only visible sections in order**
    - **Validates: Requirements 9.1**

  - [ ]* 8.3 Write property test for section key maps to the correct component with correct props (Property 10)
    - **Property 10: Section key maps to the correct component with correct props**
    - **Validates: Requirements 9.2, 9.3, 9.4, 9.5, 9.6**

- [x] 9. Update `frontend/src/pages/sitecontent.jsx` — remove deprecated fields
  - Remove deprecated fields from `formData` initial state: `siteDescription`, `hero`, `heroTitle`, `heroName`, `skillsTitle`, `serviceDescription`, `footer`, `logohero`
  - Remove corresponding `<Field>` form inputs and `<textarea>`/`<input>` elements for those fields
  - Remove the `logohero` file upload field and `logoheroPreview` state
  - Update the `selected` badge check from `site.selected === 'selected'` to `site.selected === true`
  - Update `handleEdit` to no longer populate deprecated fields
  - Update `resetForm` to no longer include deprecated fields
  - _Requirements: 10.1, 10.2_

- [x] 10. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Route registration order is critical: `PUT /api/site/:siteId/sections/reorder` MUST be registered before `PUT /api/site/:siteId/sections/:sectionId` in Express
- `@dnd-kit/core` and `@dnd-kit/sortable` must be installed before implementing task 6.4 (`npm install @dnd-kit/core @dnd-kit/sortable` in the `frontend` directory)
- Property-based tests use `fast-check` — install with `npm install --save-dev fast-check` in the relevant package
- Each property test should run a minimum of 100 iterations and be tagged with `// Feature: dynamic-cms-sections, Property N: <property_text>`
- The `selected` field migration from String enum to Boolean affects both backend queries and frontend badge rendering — both must be updated together (tasks 3.2, 3.3, and 9)
