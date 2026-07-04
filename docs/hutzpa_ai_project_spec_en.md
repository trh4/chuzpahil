# Project Specification: Chutzpah AI / Hutzpa AI

**Version:** 1.0  
**Document type:** Product specification + functional specification for implementation  
**Source:** The specification PDF provided by the client  
**Document goal:** Consolidate all requirements into one clear document that can be handed to a designer, developer, or AI system for building the project.

---

## 1. Project Summary

**Chutzpah AI** is a website where users write a confession about “chutzpah-style” Israeli behavior abroad. After the user writes the confession, the system generates AI images for it, shows the user two image options, and after the user approves publishing, the confession is saved to the database and appears in the public confession gallery.

The site also functions as an Explore gallery where users can view existing confessions, search, filter, sort, open a specific confession, and rate its chutzpah level using a “Chutzpah Meter”.

---

## 2. Product Goals

1. Allow users to enter free text describing a confession.
2. Generate AI images from the text in a consistent and recognizable style.
3. Allow the user to choose one image from two options before publishing.
4. Display a public database of existing confessions in an interactive gallery.
5. Support search, filtering, and sorting of confessions.
6. Allow users to rate the chutzpah level of each confession using a rating slider.
7. Add new confessions to the home screen with a noticeable animated experience.

---

## 3. Target Audience and User Experience

The experience is intended for users who want to read, share, and rate short humorous stories about Israeli behavior abroad. The product tone should be light, visual, funny, slightly sarcastic, and focused on a lively, dynamic gallery.

---

## 4. Key Terms

| Term | Meaning |
|---|---|
| Confession | A story/text written by the user about Israeli behavior abroad. |
| Confession image | An AI-generated image created for a confession. |
| Chutzpah Meter | A percentage-based rating that represents how cheeky, rude, exaggerated, or “chutzpah-like” the confession feels. |
| Tags | Tags that represent the country, topic, or category of the confession. |
| Explore | The home/main gallery screen where all confessions are displayed. |
| Confession draft | A confession created after prompt submission but not yet published. |

---

## 5. Screen List

1. **Home / Explore screen**
2. **Existing confession screen**
3. **Loading screen 1 - image generation**  
   Appears after the user finishes entering a prompt and clicks Submit/Enter. In the source document, this loading screen is referred to with both “croissants” and “bourekas”; the final name should be confirmed according to the selected video loop.
4. **Pre-publish confession preview screen**
5. **Loading screen 2 - suitcase**
6. **Home screen with newly added confession**

---

## 6. Main User Flow

```text
Enter website
    ↓
Home / Explore screen
    ↓
Write a confession in the prompt field
    ↓
Prompt validation
    ↓
Loading screen 1 - image generation
    ↓
Pre-publish preview screen
    ↓
Choose one image from 2 options
    ↓
Click “Publish”
    ↓
Loading screen 2 - save to database
    ↓
Return to home screen
    ↓
Show success message + animate the new confession into the gallery
```

---

## 7. Publish Cancellation Flow

```text
Pre-publish preview screen
    ↓
Click “Cancel”
    ↓
Open confirmation popup
    ↓
If the user confirms:
    Delete the draft and return to the home screen

If the user cancels the cancellation:
    Close the popup and stay on the pre-publish preview screen
```

---

# 8. Detailed Screen Specification

---

## 8.1 Home / Explore Screen

### General Description

The home screen is the main and first screen in the system. On this screen, the user can:

- View all confessions that already exist in the system.
- Search confessions by keyword.
- Sort the display order.
- Filter by country or topic.
- Write a new confession in the prompt field.
- Open an existing confession screen by clicking an image in the gallery.

### Screen Structure

#### 1. Top Menu

The top menu includes:

| Component | Description |
|---|---|
| Search field | Enables free-text search by keyword. |
| Sorting dropdown | Allows changing the display order of confessions. |
| Filter options | Enable filtering by country and/or confession topic. |

#### 2. Search Field

- The user can type a word or phrase.
- Search should run across the title, confession content, tags, country, and topic.
- If there are no results, show an empty state: “No matching confessions found.”

#### 3. Sorting

Sorting options:

| Option | Behavior |
|---|---|
| Newest | Display by `created_at`, newest to oldest. |
| Oldest | Display by `created_at`, oldest to newest. |
| Most chutzpah | Display by average Chutzpah Meter rating, high to low. |
| Most polite | Display by average Chutzpah Meter rating, low to high. |
| Random | Default on initial site load. |

#### 4. Filters

Filtering is available by:

- Country / confession destination.
- Confession topic.

Filters are controlled through dropdown components.

#### 5. Hero Section

A central screen area that includes:

- Logo.
- Short explanatory tagline about the website.
- Prompt input field for creating a new confession.

#### 6. Prompt Input Field

This field is used to create a new confession.

**States:**

| State | Description |
|---|---|
| Default | Field is empty and ready for input. |
| Writing | Active writing state after the user clicks and starts typing. |

**Behavior:**

- After the user finishes writing and clicks Enter/Submit, the user moves to Loading Screen 1.
- Clicking the booklet/help icon opens a popup with instructions for writing a good prompt.
- If the prompt is too short or not detailed enough, show an error message with an explanation.

**Minimum prompt detail requirement:**

The prompt should include enough details to generate both a confession and an image, for example:

- Country/location.
- What actually happened.
- Who was involved.
- The situation/context.
- Why it is considered chutzpah, a scheme, or stereotypically Israeli behavior.

#### 7. Existing Confessions Gallery

The gallery displays images of existing confessions.

**Default behavior:**  
Display in random order, unless the user selected sorting or filtering.

**Interactions:**

| Action | Result |
|---|---|
| Hover on image | Image grows by 10%. |
| Scroll | Reveals more images. |
| New images appearing during scroll | Light animation with approximately -45 degree rotation. |
| Click image | Navigate to the “Existing confession” screen. |

---

## 8.2 Existing Confession Screen

### General Description

This is the screen users reach when they click a specific image in the Explore gallery.

The screen displays the full confession details and allows the user to rate the confession using the Chutzpah Meter.

### Screen Components

| Component | Description |
|---|---|
| Confession image | The image generated for the confession. |
| Title | The confession name/title. |
| Date and time | The confession creation/publish time. Affects “Newest” and “Oldest” sorting. |
| Confession content | Full confession text displayed as a paragraph. |
| Average chutzpah level | Percentage score based on user ratings. |
| Tags | Up to 3 tags related to the confession content, topic, and country. |
| Chutzpah Meter | Rating slider where the user rates the chutzpah level. |

### Tags

- Tags are influenced by the confession content.
- Tags may represent country, topic, or category.
- Each confession can have up to 3 tags.
- Clicking a tag sends the user to the home screen filtered by that tag/country/topic.

### Chutzpah Meter

The Chutzpah Meter is a percentage-based rating slider.

**Behavior:**

- The user rates by dragging the slider.
- Dragging to the end of the scale = 100%.
- Leaving it at the beginning of the scale without rating = 0%.
- After rating, the user’s score appears for a few seconds over the image, similar to an Instagram Like effect.
- The rating affects the confession’s average score.
- The rating also affects sorting by “Most chutzpah” and “Most polite”.

---

## 8.3 Pre-Publish Confession Preview Screen

### General Description

This is the screen reached after the user finishes entering the prompt and the system finishes generating images.

The screen displays:

- The generated/written confession text.
- Two images for the user to choose from.
- Confession details.
- Action buttons: Publish and Cancel.

### Screen Components

#### 1. Selectable Confession Images

- The user receives 2 image options for the confession image.
- The user can move between images using arrows.
- The user selects an image by clicking it.
- A thick blue outline appears around the selected image.

#### 2. Confession Text

The text is composed of:

- Title.
- Date and time when the confession will be published.
- The text previously written in the prompt field.
- Tags that will accompany the confession.

#### 3. Action Buttons

| Button | Description |
|---|---|
| Publish | Main button. Moves the user to Loading Screen 2 before the confession appears on the home screen. |
| Cancel | Secondary button. Opens a popup confirming that the user wants to cancel and delete the confession. |

### Cancel Popup

When clicking “Cancel”:

- A popup opens and asks whether the user is sure they want to cancel.
- It should explain that cancellation will delete the confession.
- If the user confirms, return to the home screen and delete the draft.
- If the user cancels, stay on the preview screen.

### Button States

Each button has 2 states:

| State | Description |
|---|---|
| Default | Regular state. |
| Hover | Button color/background changes. |

---

## 8.4 Loading Screen 1 - Image Generation

### When It Appears

After the user finishes entering a prompt and clicks Enter/Submit.

### Purpose

To indicate that the confession was received by the system and is being processed into images.

### Behavior

- The screen displays a short looping video.
- The loop continues until the two images are generated and the pre-publish preview screen is ready.
- When loading is complete, the user automatically moves to the pre-publish preview screen.

---

## 8.5 Loading Screen 2 - Save to Database

### When It Appears

After the user clicks “Publish” on the pre-publish preview screen.

### Purpose

To indicate that the confession is being added to the database and saved.

### Behavior

- The screen displays a short looping video.
- The loop continues until the confession is saved successfully.
- When loading is complete, the user moves to the home screen with the new confession.

---

## 8.6 Home Screen with Newly Added Confession

### General Description

Identical to the regular home screen, with the addition of a success message and an animation for adding the new confession.

### Success Message

Popup/toast text:

> The confession was added successfully

**Behavior:**

- Appears while the new confession animation is running.
- Can be closed by clicking anywhere on the screen.
- Closes automatically after 3 seconds.

### New Confession Animation

- The new confession, as an image, is always added at the top.
- Its X position changes randomly each time.
- Its Y position always stays the same.
- The image grows from 0 to a random size.
- The topmost image on its side shrinks and gets pushed down.

---

# 9. Global Components

## 9.1 Input Fields

All writing/input fields on the site should use the same component states defined in Figma.

Required states:

- Default
- Focus / Writing
- Error
- Disabled, if needed later

## 9.2 Buttons

All buttons in the interface should be consistent.

Required states:

- Default
- Hover
- Active / Clicked, recommended for implementation
- Disabled, recommended for implementation

## 9.3 Dropdown

Used for:

- Sorting.
- Filtering by country.
- Filtering by topic.

## 9.4 Toast / Popup Message

Used to show a success message after publishing a confession.

Requirements:

- Appears above the screen and does not block long-term usage.
- Can be closed by click.
- Closes automatically after 3 seconds.

## 9.5 Modal / Popup

Used for:

- Instructions for writing a proper prompt.
- Confirmation before canceling a confession before publication.

## 9.6 Chutzpah Meter

A slider rating component.

Requirements:

- Value from 0 to 100.
- Supports dragging.
- Shows the value after rating.
- Updates the average after saving.

---

# 10. AI and Content Requirements

## 10.1 User Input

The user writes free text describing a confession.

## 10.2 Prompt Validation

The system should verify that the prompt is detailed enough.

Example error reasons:

- The text is too short.
- No country/location is included.
- No clear description of what happened.
- Not enough details to generate an image.

## 10.3 Content Generation from Prompt

The system should generate the following from the prompt:

- Confession title.
- Structured confession text.
- Country, if detected.
- Topic/category.
- Up to 3 tags.
- Two AI image options for selection.

## 10.4 Image Generation

Image requirements:

- One image per published confession.
- Before publishing, 2 image options are displayed.
- The style should be consistent across the entire site.
- The images in the appendices of the source document are style references: colorful illustration/comic style, exaggerated and clear situation, with country/place context.

---

# 11. Search, Filtering, and Sorting

## 11.1 Search

The search field should search within:

- Confession title.
- Confession content.
- Tags.
- Country.
- Topic.

## 11.2 Filtering

Filter by:

- Country.
- Topic.
- Tag clicked from an existing confession screen.

## 11.3 Sorting

| Sort | Logic |
|---|---|
| Newest | `created_at DESC` |
| Oldest | `created_at ASC` |
| Most chutzpah | `average_chutzpah_score DESC` |
| Most polite | `average_chutzpah_score ASC` |
| Random | Random order on every load/refresh, unless another filter or sort was selected. |

---

# 12. Proposed Data Model

> This section translates the product specification into a recommended data structure for implementation. Some fields are derived from the source material to support a full technical build.

## 12.1 Confession

| Field | Type | Description |
|---|---|---|
| `id` | string / uuid | Unique confession identifier. |
| `title` | string | Confession title. |
| `content` | text | Confession content. |
| `country` | string / null | Destination country, if available. |
| `topic` | string / null | Topic/category. |
| `tags` | string[] | Up to 3 tags. |
| `image_url` | string | The selected confession image. |
| `created_at` | datetime | Creation/publish date and time. |
| `average_chutzpah_score` | number | Average Chutzpah Meter rating as a percentage. |
| `ratings_count` | number | Number of ratings. |
| `ratings_sum` | number | Sum of ratings for calculating the average. |
| `status` | enum | `draft`, `published`, `hidden`. |

## 12.2 ConfessionDraft

| Field | Type | Description |
|---|---|---|
| `id` | string / uuid | Draft identifier. |
| `prompt` | text | User’s original prompt. |
| `generated_title` | string | Generated title. |
| `generated_content` | text | Confession text for display. |
| `generated_tags` | string[] | Generated tags. |
| `image_options` | string[] | 2 selectable images. |
| `selected_image_url` | string / null | Image selected by the user. |
| `created_at` | datetime | Draft creation time. |

## 12.3 Rating

| Field | Type | Description |
|---|---|---|
| `id` | string / uuid | Rating identifier. |
| `confession_id` | string / uuid | Link to confession. |
| `score` | number | Value from 0 to 100. |
| `client_id` | string / null | Anonymous user/session identifier, if duplicate ratings should be prevented. |
| `created_at` | datetime | Rating creation time. |

---

# 13. Proposed API

> The route names are implementation suggestions and can be adjusted according to the actual technology stack.

## 13.1 Confessions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/confessions` | Fetch confessions with support for search, filtering, and sorting. |
| `GET` | `/api/confessions/:id` | Fetch a single confession. |
| `POST` | `/api/confessions/draft` | Create a confession draft and images from a prompt. |
| `POST` | `/api/confessions/:draftId/publish` | Publish a draft and save it as an existing confession. |
| `DELETE` | `/api/confessions/draft/:draftId` | Cancel and delete a draft. |

## 13.2 Ratings

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/confessions/:id/rating` | Save a Chutzpah Meter rating for a confession. |

## 13.3 Query Parameters for Fetching Confessions

Example:

```text
GET /api/confessions?search=queue&country=Thailand&topic=scheme&sort=most_chutzpah
```

Supported parameters:

| Parameter | Possible values |
|---|---|
| `search` | Free text |
| `country` | Country name |
| `topic` | Topic name |
| `tag` | Tag name |
| `sort` | `newest`, `oldest`, `most_chutzpah`, `most_polite`, `random` |

---

# 14. Error States and Edge Cases

## 14.1 Invalid Prompt

Show a clear message, for example:

> The confession is too short. Try adding where it happened, what exactly happened, and why it was chutzpah.

## 14.2 Image Generation Failure

Show an option to try again.

## 14.3 Publishing Failure

Show a message that publishing failed, and do not delete the draft.

## 14.4 No Search Results

Show an empty state with suitable text and a button to reset filters.

## 14.5 User Did Not Select an Image in the Preview Screen

Recommended behavior: do not allow publishing until an image is selected, or automatically select the first image by default.

---

# 15. Mobile and Responsiveness

The interface should include a mobile version.

Requirements:

- Full adaptation to small screens.
- The gallery should remain scrollable and comfortable on mobile.
- Dropdown menus should be touch-friendly.
- The Chutzpah Meter should be easy to drag with a finger.
- Popups should not exceed the screen width.

---

# 16. Design Requirements

1. All button and input states should appear in Figma under a “Components” section.
2. Components should remain consistent across the entire interface.
3. Keep a consistent visual style for all confession images.
4. Animations are part of the experience and should be implemented as part of the MVP.
5. A Figma link should be included under the appendices, but the actual link was not included in the provided file.

---

# 17. Initial Content Requirements - Seed Data

The following confessions should appear as initial data on the home screen and in the appendices. Their images appear in the source document on pages 4-6.

## 17.1 The Bracelet

| Field | Value |
|---|---|
| Date | May 30, 2026 |
| Time | 17:00 |
| Average Chutzpah Meter rating | 65% |
| Tags | queue, scheme, Thailand |

**Content:**  
We were at a water park in Phuket and had a Fast Pass bracelet that was only valid for one ride. We quickly discovered that nobody really checked what it was valid for, so we simply showed it in every queue. People saw the bracelet and let us skip the line without asking questions.

---

## 17.2 Souvenir Mugs

| Field | Value |
|---|---|
| Date | June 1, 2026 |
| Time | 17:40 |
| Average Chutzpah Meter rating | 85% |
| Tags | theft, Spain |

**Content:**  
My wife and I collect mugs. During a trip to Barcelona, we fell in love with two mugs at one of the cafés we visited, but it was not possible to buy them. So, without anyone noticing, I washed them in the restroom and took them with us in our bag.

---

## 17.3 Shoes

| Field | Value |
|---|---|
| Date | June 3, 2026 |
| Time | 13:00 |
| Average Chutzpah Meter rating | 40% |
| Tags | other |

**Content:**  
In an apartment I rented abroad, they asked guests not to enter with shoes so as not to disturb the business downstairs. I entered with them anyway, both because I was afraid they would be stolen if I left them outside and because I did not consider the request important. At that moment I felt angry about the requirement and did not feel guilty afterward.

---

## 17.4 The Train

| Field | Value |
|---|---|
| Date | June 3, 2026 |
| Time | 15:20 |
| Average Chutzpah Meter rating | 75% |
| Tags | Germany, theft |

**Content:**  
I was in Germany and rode the underground train. I did not know how to buy a ticket from the machine. I asked people for help, but it did not work out, and somehow I ended up riding without paying for a significant part of the vacation. After a few days I bought tickets because I already felt uncomfortable.

---

## 17.5 Honeymoon

| Field | Value |
|---|---|
| Date | June 5, 2026 |
| Time | 12:35 |
| Average Chutzpah Meter rating | 60% |
| Tags | Thailand, scheme |

**Content:**  
Every time my wife and I fly abroad, especially to the East, we lie and say it is our honeymoon, even many years after the wedding. Because of this, we always receive many perks, such as free upgraded suites and bottles of champagne in the room.

---

## 17.6 Marathon

| Field | Value |
|---|---|
| Date | June 8, 2026 |
| Time | 13:10 |
| Average Chutzpah Meter rating | 30% |
| Tags | USA, queue |

**Content:**  
I skipped a huge line at a park in the United States because I was pressed for time. It was a little uncomfortable, but I got over it.

---

## 17.7 Gözleme

| Field | Value |
|---|---|
| Date | June 11, 2026 |
| Time | 10:00 |
| Average Chutzpah Meter rating | 70% |
| Tags | Turkey, queue, scheme |

**Content:**  
When I was little, I stayed at an all-inclusive hotel in Turkey. At the breakfast buffet there was a Turkish food called gözleme, and there was always a huge line for it. My siblings and I got tired of waiting, so we pretended we did not see the line and slipped to the front. I did not feel too bad about it.

---

## 17.8 Budget Room

| Field | Value |
|---|---|
| Date | June 20, 2026 |
| Time | 20:10 |
| Average Chutzpah Meter rating | 60% |
| Tags | big trip, scheme |

**Content:**  
On our big trip, we said there were four of us in the room, but in the end we brought mattresses and there were more of us. The goal was to save money. At the time I felt pretty okay about it, and now a little less.

---

# 18. Acceptance Criteria

## 18.1 Home Screen

- The user sees a gallery of existing confessions.
- Search returns relevant results.
- Sorting changes the order of confessions according to the selected criterion.
- Country/topic filters reduce the displayed results.
- Hovering over an image enlarges it by 10%.
- Clicking an image navigates to the existing confession screen.

## 18.2 Creating a Confession

- The user can write a prompt.
- A prompt that is too short shows an error.
- A valid prompt moves the user to Loading Screen 1.
- After loading, 2 selectable images are displayed.

## 18.3 Pre-Publish Preview

- The user sees the text, tags, and images.
- Selecting an image marks it with a thick blue outline.
- Clicking Publish moves the user to Loading Screen 2.
- Clicking Cancel opens a confirmation popup.

## 18.4 Publishing a Confession

- The confession is saved to the database.
- The user returns to the home screen.
- The message “The confession was added successfully” is displayed.
- The new image appears at the top with an animation.

## 18.5 Rating a Confession

- The user can drag the Chutzpah Meter.
- The rating is saved.
- The score appears for a few seconds on top of the image.
- The average updates.
- Sorting by most chutzpah/most polite uses the updated rating.

---

# 19. Items to Finalize Before Full Development

1. Figma link.
2. Final name/style for Loading Screen 1: croissants or bourekas.
3. Exact video files for the two loops.
4. Whether users log in or everything is anonymous.
5. Whether a user may rate the same confession more than once.
6. Whether there is an admin/management system for hiding confessions.
7. Whether there is automatic moderation for user-generated content.
8. Whether generated images are always stored or regenerated on display.
9. Whether tags are selected automatically by AI or from a closed list.
10. Whether the site is Hebrew-only or should support English in the future.

---

# 20. Proposed MVP

The MVP version should include:

1. Home screen with confession gallery.
2. Basic search.
3. Basic sorting.
4. Filtering by country/topic.
5. Creating a confession from a prompt.
6. Loading Screen 1.
7. Generating two AI images.
8. Pre-publish preview screen.
9. Image selection.
10. Publishing and saving to the database.
11. Loading Screen 2.
12. Success message and add animation.
13. Existing confession screen.
14. Chutzpah Meter rating.

---

# 21. Implementation Notes

- The source document does not require login, so the default assumption is an open/anonymous system.
- It is recommended to store an anonymous session identifier to prevent duplicate ratings and improve measurement.
- It is recommended to store generated images so they do not need to be regenerated.
- It is recommended to maintain a controlled list of countries and topics so filters remain consistent.
- It is recommended to document every component state in Figma before development begins.
