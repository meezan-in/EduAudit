# EduConnectAudit

EduConnectAudit is a modern web platform designed to connect alumni, manage complaints, and provide educational insights for schools and authorities. The platform aims to foster collaboration between alumni, students, and educational authorities, while streamlining communication and feedback processes.

## Features

- **Alumni Connect:** Alumni registration, listing, and networking features.
- **Complaint Management:** Submit, track, and resolve complaints efficiently.
- **Dashboards:** Insightful dashboards for schools and authorities to monitor activities and analytics.
- **Multi-language Support:** Easily switch between languages for broader accessibility.
- **AI Services:** Integration with AI for enhanced features (e.g., insights, recommendations).
- **Modern UI:** Built with React, Tailwind CSS, and reusable UI components.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express (Vite server), Drizzle ORM
- **Database:** (Configure as needed in `server/db.ts`)
- **Other:** i18n for localization, OpenAI integration, modern hooks and state management

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd EduConnectAudit
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Add any required environment variables (e.g., for database, OpenAI) in a `.env` file as needed.

### Running the App

- **Development mode:**
  ```bash
  npm run dev
  ```
- **Production build:**
  ```bash
  npm run build
  npm start
  ```

## Folder Structure

```
EduConnectAudit/
  client/           # Frontend React app
    src/
      components/   # UI and feature components
      hooks/        # Custom React hooks
      lib/          # Utilities and libraries
      pages/        # Page components/routes
      index.css     # Global styles
      main.tsx      # App entry point
  server/           # Backend API and services
    db.ts           # Database setup
    routes.ts       # API routes
    ai-services.ts  # AI integrations
  shared/           # Shared code/schema
  README.md         # Project documentation
  package.json      # Project metadata and scripts
```

## Contribution Guidelines

1. Fork the repository and create your branch from `main`.
2. Commit your changes with clear messages.
3. Open a pull request and describe your changes.
4. Ensure your code follows the existing style and passes all checks.

## License

[MIT](LICENSE)

## Contact

For questions or support, please open an issue or contact the maintainers.
