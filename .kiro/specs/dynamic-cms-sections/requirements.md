# Requirements Document

## Introduction

This feature refactors the existing MERN stack portfolio CMS from a fixed-field `Site` model into a dynamic, section-based content management system. Instead of hardcoded fields like `hero`, `heroTitle`, `skillsTitle`, and `serviceDescription`, the `Site` model will store a `sections` array where each section is an independently managed content block with a key, title, subtitle, content, image, display order, and visibility flag.

The admin dashboard will gain a Section Manager UI that allows creating, editing, deleting, reordering (via drag-and-drop), and toggling the visibility of sections. The public homepage will dynamically render sections in order, respecting visibility, and routing each section to the appropriate existing component (Banner, Skills, Services, Footer, etc.) based on the section's `key`.

The system must preserve all existing site-level global fields (`siteName`, `logoheader`, `contactEmail`, `selected`, `roles`, `linkedIn`, `facebook`, `instagram`) and maintain backward compatibility with the existing multi-site selection mechanism.

---

## Glossary

- **Site**: A top-level MongoDB document representing a complete portfolio configuration, including global fields and a sections array.
- **Section**: A subdocument within a Site's `sections` array representing a single content block on the homepage (e.g., hero, skills, footer).
- **Section_Key**: A string identifier on a Section that maps it to a specific frontend component (e.g., `"hero"`, `"skills"`, `"services"`, `"footer"`).
- **Section_Manager**: The admin dashboard UI component responsible for creating, editing, deleting, reordering, and toggling sections.
- **Section_Renderer**: The frontend homepage component that reads the selected site's sections and renders each one using the appropriate component based on Section_Key.
- **Selected_Site**: The Site document whose `selected` field equals `true`. Only one Site may be selected at a time.
- **Admin**: An authenticated user with the `verifyAdmin` JWT middleware role.
- **Cloudinary**: The third-party image hosting service used to store and serve uploaded images.
- **DnD_Controller**: The drag-and-drop library integration (using `@dnd-kit`) responsible for handling section reorder interactions in the admin UI.
- **API**: The Express.js REST backend serving `/api/site` routes.
- **Dashboard**: The React admin interface at `/admin` routes.

---

## Requirements

### Requirement 1: Database Schema Refactor

**User Story:** As an admin, I want the Site model to store content as a dynamic sections array instead of fixed fields, so that I can manage any number of content blocks without requiring backend code changes.

#### Acceptance Criteria

1. THE Site model SHALL include a `sections` field defined as an array of subdocuments, where each subdocument contains: `key` (String, required, enum: `["hero", "skills", "services", "footer", "about", "projects"]`), `title` (String), `subtitle` (String), `content` (String), `image` (String, Cloudinary URL), `order` (Number, required), and `visible` (Boolean, default `true`).
2. THE Site model SHALL retain the following global fields unchanged: `siteName`, `logoheader`, `contactEmail`, `selected` (Boolean, default `false`), `roles`, `linkedIn`, `facebook`, `instagram`.
3. THE Site model SHALL remove the following previously hardcoded fields: `siteDescription`, `hero`, `heroTitle`, `heroName`, `skillsTitle`, `serviceDescription`, `footer`, `logohero`.
4. WHEN a new Section subdocument is created without a `visible` value, THE Site model SHALL default `visible` to `true`.
5. WHEN a new Section subdocument is created without an `order` value, THE API SHALL assign an `order` equal to the current count of existing sections in that site (appending to the end).

---

### Requirement 2: Section CRUD API

**User Story:** As an admin, I want REST API endpoints to create, read, update, and delete sections within a site, so that the Section Manager UI can manage content programmatically.

#### Acceptance Criteria

1. WHEN an Admin sends a `POST /api/site/:siteId/sections` request with valid section data, THE API SHALL add the new section to the site's `sections` array and return the updated Site document with HTTP 201.
2. WHEN an Admin sends a `PUT /api/site/:siteId/sections/:sectionId` request with updated fields, THE API SHALL update only the provided fields on the matching section and return the updated Site document with HTTP 200.
3. WHEN an Admin sends a `DELETE /api/site/:siteId/sections/:sectionId` request, THE API SHALL remove the matching section from the `sections` array and return the updated Site document with HTTP 200.
4. IF a `POST`, `PUT`, or `DELETE` request to a section endpoint is made without a valid Admin JWT token, THEN THE API SHALL return HTTP 401 with a descriptive error message.
5. IF a `POST`, `PUT`, or `DELETE` request references a `siteId` that does not exist in the database, THEN THE API SHALL return HTTP 404 with the message `"Site not found"`.
6. IF a `PUT` or `DELETE` request references a `sectionId` that does not exist within the site's `sections` array, THEN THE API SHALL return HTTP 404 with the message `"Section not found"`.
7. WHEN an Admin sends a `POST /api/site/:siteId/sections` request with an `image` file, THE API SHALL upload the image to Cloudinary and store the resulting URL in the section's `image` field.
8. IF a `POST` or `PUT` request to a section endpoint includes a `key` value not in the allowed enum (`"hero"`, `"skills"`, `"services"`, `"footer"`, `"about"`, `"projects"`), THEN THE API SHALL return HTTP 400 with a descriptive validation error message.

---

### Requirement 3: Section Reorder API

**User Story:** As an admin, I want to reorder sections via the API, so that drag-and-drop changes in the UI are persisted to the database.

#### Acceptance Criteria

1. WHEN an Admin sends a `PUT /api/site/:siteId/sections/reorder` request with a body containing an ordered array of section IDs, THE API SHALL update the `order` field of each section to match its position in the provided array (0-indexed) and return the updated Site document with HTTP 200.
2. IF the provided array of section IDs does not match the count of sections in the site, THEN THE API SHALL return HTTP 400 with the message `"Section ID count mismatch"`.
3. IF any section ID in the reorder array does not exist within the site's `sections` array, THEN THE API SHALL return HTTP 400 with a descriptive error message identifying the invalid ID.
4. IF a `PUT /api/site/:siteId/sections/reorder` request is made without a valid Admin JWT token, THEN THE API SHALL return HTTP 401 with a descriptive error message.

---

### Requirement 4: Section Visibility Toggle API

**User Story:** As an admin, I want to toggle a section's visibility without deleting it, so that I can hide content temporarily without losing it.

#### Acceptance Criteria

1. WHEN an Admin sends a `PUT /api/site/:siteId/sections/:sectionId/toggle` request, THE API SHALL invert the current `visible` boolean value of the matching section and return the updated Site document with HTTP 200.
2. IF the `siteId` or `sectionId` in a toggle request does not exist, THEN THE API SHALL return HTTP 404 with a descriptive error message.
3. IF a toggle request is made without a valid Admin JWT token, THEN THE API SHALL return HTTP 401 with a descriptive error message.

---

### Requirement 5: Selected Site API — Sections Sorted by Order

**User Story:** As a visitor, I want the selected site's sections to be returned in display order, so that the homepage renders content in the correct sequence.

#### Acceptance Criteria

1. WHEN a `GET /api/site/selected` request is received, THE API SHALL return the Selected_Site document with its `sections` array sorted ascending by the `order` field.
2. WHEN a `GET /api/site/selected` request is received and no site has `selected: true`, THE API SHALL fall back to returning the first available Site document with sections sorted by `order`.
3. WHEN a `GET /api/site/selected` request is received and the database contains no sites, THE API SHALL return HTTP 200 with an empty object `{}`.

---

### Requirement 6: Section Manager UI — Section List and Controls

**User Story:** As an admin, I want a Section Manager panel in the dashboard that lists all sections for the active site, so that I can see and manage all content blocks in one place.

#### Acceptance Criteria

1. THE Section_Manager SHALL display all sections for the currently selected site in a list sorted by their `order` field.
2. THE Section_Manager SHALL display each section's `key`, `title`, `order`, and `visible` status.
3. THE Section_Manager SHALL provide an "Add Section" button that opens a form to create a new section.
4. THE Section_Manager SHALL provide an "Edit" button per section that populates the section form with the section's existing data.
5. THE Section_Manager SHALL provide a "Delete" button per section that triggers a confirmation modal before sending the delete request.
6. THE Section_Manager SHALL provide a visibility toggle control per section that calls the toggle API endpoint and updates the UI immediately upon success.
7. WHEN a section has `visible: false`, THE Section_Manager SHALL visually distinguish it from visible sections (e.g., reduced opacity or a "Hidden" badge).
8. THE Section_Manager SHALL use the violet/purple gradient theme (`linear-gradient(135deg, #AA367C, #4A2FBD)`) consistent with the existing admin dashboard style.

---

### Requirement 7: Section Manager UI — Add and Edit Form

**User Story:** As an admin, I want a form to create and edit sections with all relevant fields, so that I can fully control each content block's data.

#### Acceptance Criteria

1. THE Section_Manager form SHALL include input fields for: `key` (dropdown/select with options `"hero"`, `"skills"`, `"services"`, `"footer"`, `"about"`, `"projects"`, required), `title` (text), `subtitle` (text), `content` (textarea), and `order` (number).
2. THE Section_Manager form SHALL include an image upload field that previews the selected image before submission and uploads it to Cloudinary via the section API.
3. WHEN the form is submitted for a new section, THE Section_Manager SHALL call `POST /api/site/:siteId/sections` and display a success toast notification on completion.
4. WHEN the form is submitted for an existing section, THE Section_Manager SHALL call `PUT /api/site/:siteId/sections/:sectionId` and display a success toast notification on completion.
5. IF the API returns an error during form submission, THEN THE Section_Manager SHALL display an error toast notification with the error message.
6. WHEN the form submission completes successfully, THE Section_Manager SHALL reset the form and refresh the section list.
7. THE Section_Manager form SHALL provide a "Cancel" button that resets the form without submitting.

---

### Requirement 8: Section Manager UI — Drag-and-Drop Reorder

**User Story:** As an admin, I want to drag and drop sections to reorder them, so that I can visually arrange the homepage layout without manually editing order numbers.

#### Acceptance Criteria

1. THE DnD_Controller SHALL allow sections in the Section_Manager list to be reordered via drag-and-drop using the `@dnd-kit/core` and `@dnd-kit/sortable` libraries.
2. WHEN a drag-and-drop reorder interaction completes, THE Section_Manager SHALL call `PUT /api/site/:siteId/sections/reorder` with the new ordered array of section IDs.
3. WHEN the reorder API call succeeds, THE Section_Manager SHALL update the displayed section list to reflect the new order without a full page reload.
4. IF the reorder API call fails, THEN THE Section_Manager SHALL revert the displayed order to the pre-drag state and display an error toast notification.
5. WHILE a drag interaction is in progress, THE DnD_Controller SHALL provide a visual drag handle indicator on each section row.

---

### Requirement 9: Homepage Dynamic Section Rendering

**User Story:** As a visitor, I want the homepage to dynamically render sections from the selected site's data, so that content changes made in the admin dashboard are immediately reflected on the public site.

#### Acceptance Criteria

1. WHEN the homepage loads, THE Section_Renderer SHALL fetch the selected site from `GET /api/site/selected` and render only sections where `visible: true`, in ascending `order`.
2. THE Section_Renderer SHALL map each section's `key` to the corresponding existing component: `"hero"` → `Banner`, `"skills"` → `Skills`, `"services"` → `Services`, `"footer"` → `Footer`.
3. WHEN a section with `key: "hero"` is rendered, THE Section_Renderer SHALL pass the section's `title` as `heroTitle`, `subtitle` as `heroName`, `content` as `hero`, and `image` as `logohero` to the `Banner` component.
4. WHEN a section with `key: "skills"` is rendered, THE Section_Renderer SHALL pass the section's `title` as `skillsTitle` to the `Skills` component.
5. WHEN a section with `key: "services"` is rendered, THE Section_Renderer SHALL pass the section's `content` as `serviceDescription` to the `Services` component.
6. WHEN a section with `key: "footer"` is rendered, THE Section_Renderer SHALL pass the section's `content` as `footer` to the `Footer` component.
7. IF the selected site has no sections with a matching `key` for a given component, THEN THE Section_Renderer SHALL not render that component.
8. WHILE the homepage is loading site data, THE Section_Renderer SHALL display the existing skeleton loading components (`BannerSkeleton`, `SkillsSkeleton`, `ProjectsSkeleton`).
9. THE `NavBar` component SHALL continue to receive global site fields (`logoheader`, `siteName`, `linkedIn`, `facebook`, `instagram`) directly from the site-level data, not from sections.

---

### Requirement 10: Existing Site-Level API Backward Compatibility

**User Story:** As an admin, I want the existing site creation, update, selection, and deletion endpoints to continue working with the new schema, so that no existing functionality is broken by the refactor.

#### Acceptance Criteria

1. THE API endpoint `POST /api/site` SHALL continue to accept and persist all retained global fields: `siteName`, `logoheader`, `contactEmail`, `selected` (Boolean), `roles`, `linkedIn`, `facebook`, `instagram`.
2. THE API endpoint `PUT /api/site/:id` SHALL continue to accept partial updates to global site fields without affecting the `sections` array.
3. THE API endpoints `PUT /api/site/:id/select`, `PUT /api/site/:id/deselect`, and `DELETE /api/site/:id` SHALL continue to function as before.
4. THE API endpoint `GET /api/site` SHALL return all sites including their `sections` arrays.
5. WHEN `POST /api/site` is called without a `logoheader` file, THE API SHALL return HTTP 400 with the message `"logoheader is required"`.

---

### Requirement 11: Admin Dashboard — Site Selector for Section Manager

**User Story:** As an admin managing multiple sites, I want the Section Manager to operate on a specific site I choose, so that I can manage sections for any site, not just the currently selected one.

#### Acceptance Criteria

1. THE Section_Manager SHALL display a site selector dropdown populated with all available sites from `GET /api/site`.
2. WHEN an admin selects a site from the dropdown, THE Section_Manager SHALL load and display the sections for that site.
3. THE Section_Manager SHALL default to showing the Selected_Site's sections on initial load.
4. IF no sites exist, THEN THE Section_Manager SHALL display an empty state message prompting the admin to create a site first.

---

### Requirement 12: Section Image Upload

**User Story:** As an admin, I want to upload an image for each section, so that visual content like hero images can be managed per section.

#### Acceptance Criteria

1. WHEN an Admin uploads an image file via the section form, THE API SHALL process the upload using multer with Cloudinary storage and store the resulting URL in the section's `image` field.
2. THE API SHALL accept image files in `jpg`, `png`, `jpeg`, and `webp` formats for section image uploads.
3. WHEN a section is updated via `PUT /api/site/:siteId/sections/:sectionId` without a new image file, THE API SHALL retain the section's existing `image` URL unchanged.
4. WHEN a section image is uploaded, THE API SHALL apply a Cloudinary transformation limiting the image width to 800px with `crop: "limit"`.
