# TMZN

Barebones menu bar app to see the time for your teammates in different timezones.

## How to use

- The implementation pulls data from a Notion database. To use this app, create a Notion database with the following fields:

  - `Name` of type `title`. The primary field in the database.
  - `Image` of type `file`. Basically a file upload field.
  - `tz` of type `rich_text`. Example: `Asia/Dubai`, `Europe/London`.

- Next, create a Notion API token by visiting your [integrations page](https://www.notion.so/my-integrations).

- Grant the integration access to the database by clicking the three dots on the top-right section of the page and selecting `Add connections` and choosing the integration.

- When you open the app for the first time, you will be asked to enter your Notion API token and your database ID.
  - [Where to find my database ID?](https://stackoverflow.com/questions/67728038/where-to-find-database-id-for-my-database-in-notion)
  - I do not get access to either your Database ID or API token. These stay on your machine at all times.

## Credits

- The app was setup using the [quick start guide for NextJS](https://tauri.app/v1/guides/getting-started/setup/next-js).
- Most of the menu-bar related setup was copied from [this blog post](https://betterprogramming.pub/create-menubar-app-with-tauri-510ab7f7c43d).
