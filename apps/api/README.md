# API

**Prerequisites:**

- **PNPM**: Install PNPM for package management.
- **Python**: Ensure Python is installed.
- **Poetry**: Install Poetry for dependency management.
- Optional: **Nx CLI**: Install Nx CLI globally (allows running commands with `nx` without prefixing with `pnpm` every time).:

```sh
  npm install -g nx
```

**Setup:**

1. **Install Dependencies**:

   ```sh
   pnpm nx install api
   ```

2. **Run the Application**:

   ```sh
   pnpm nx serve api
   ```

**Available Commands:**

- **Lint**:

```sh
  pnpm nx lint api
```

Runs Flake8 to analyze code quality.

- **Fix Linting Issues**:

```sh
  pnpm nx fix-lint api
```

Formats code using Black.

- **Run Unit Tests**:

```sh
  pnpm nx test api
```

Executes unit tests with pytest.

- **Run Integration Tests**:

```sh
  pnpm nx test-integration api
```

Executes integration tests with pytest.

- **Update Dependencies**:

```sh
  pnpm nx lock api
```

Updates the Poetry lock file.

- **Add a Dependency**:

```sh
  pnpm nx add api --package=package_name
```

Adds a new package to the project.
