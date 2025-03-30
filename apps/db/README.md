# DB

**Prerequisites:**

- **PNPM**: Install PNPM for package management.
- **Python**: Ensure Python is installed.
- **Poetry**: Install Poetry for dependency management.
- Optional: **Nx CLI**: Install Nx CLI globally for simplified command execution:

  ```sh
  npm install -g nx
  ```

**Setup:**

1. **Install Dependencies**:

   ```sh
   pnpm nx install db
   ```

**Available Commands:**

- **Initialize Database**:

  ```sh
  pnpm nx init db
  ```

  Runs the main database initialization script.

- **Initialize PostgreSQL**:

  ```sh
  pnpm nx init-pg db
  ```

  Executes the PostgreSQL-specific initialization script.

- **Initialize MongoDB**:

  ```sh
  pnpm nx init-mongo db
  ```

  Executes the MongoDB-specific initialization script.

- **Start Database Services**:

  ```sh
  pnpm nx up db
  ```

  Starts both PostgreSQL and MongoDB services using Docker Compose.

- **Stop Database Services**:

  ```sh
  pnpm nx down db
  ```

  Stops both PostgreSQL and MongoDB services.

- **Start PostgreSQL Service**:

  ```sh
  pnpm nx pg-up db
  ```

  Starts the PostgreSQL service using Docker Compose.

- **Stop PostgreSQL Service**:

  ```sh
  pnpm nx pg-down db
  ```

  Stops the PostgreSQL service.

- **Start MongoDB Service**:

  ```sh
  pnpm nx mongo-up db
  ```

  Starts the MongoDB service using Docker Compose.

- **Stop MongoDB Service**:

  ```sh
  pnpm nx mongo-down db
  ```

  Stops the MongoDB service.

- **Lint**:

  ```sh
  pnpm nx lint db
  ```

  Analyzes code quality using Flake8.

- **Fix Linting Issues**:

  ```sh
  pnpm nx fix-lint db
  ```

  Formats code using Black.

- **Run Unit Tests**:

  ```sh
  pnpm nx test db
  ```

  Executes unit tests with pytest.

- **Run Integration Tests**:

  ```sh
  pnpm nx test-integration db
  ```

  Executes integration tests with pytest.

- **Update Dependencies**:

  ```sh
  pnpm nx lock db
  ```

  Updates the Poetry lock file.
