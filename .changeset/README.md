# Changesets

This directory contains [changesets](https://github.com/changesets/changesets) which are used to manage versioning and changelogs for the packages in this monorepo.

## What are changesets?

Changesets are a way to manage versioning and changelogs for monorepos. They allow you to:

1. Record changes to packages in your monorepo
2. Automatically determine the appropriate version bump (major, minor, patch)
3. Generate changelogs based on the changes
4. Publish packages to npm

## How to use changesets

### Adding a changeset

When you make changes to a package, you should add a changeset to describe the changes:

```bash
npm run changeset
```

This will prompt you to:

1. Select the packages that have changed (use space to select, enter to confirm)
2. Choose the type of version bump for each package:
    - `major`: Breaking changes
    - `minor`: New features (non-breaking)
    - `patch`: Bug fixes and small changes
3. Write a summary of the changes

The summary will be included in the changelog when the packages are published.

### Versioning packages

When you're ready to release new versions of packages:

```bash
npm run version-packages
```

This will:

1. Consume all changesets
2. Update package versions
3. Update changelogs
4. Create a new commit with these changes

### Publishing packages

To publish the packages to npm:

```bash
npm run release
```

This will:

1. Build all packages
2. Publish the packages to npm

## CI/CD Integration

This repository is configured with a GitHub workflow that:

1. Creates a PR with version updates when changesets are added to the main branch
2. Publishes packages to npm when the PR is merged

The workflow runs automatically when changes are pushed to the main branch.

## Best Practices

1. **Create changesets as you work**: Add a changeset for each significant change to make the changelog more detailed and useful.

2. **Write meaningful changeset messages**: Describe what changed and why, not just what files were modified.

3. **Use the appropriate bump type**:

    - `major`: Breaking changes that require users to update their code
    - `minor`: New features that don't break existing functionality
    - `patch`: Bug fixes and small changes that don't add features or break existing code

4. **Review changesets before versioning**: Make sure all changes are properly documented before running `version-packages`.

5. **Keep packages in sync**: For tightly coupled packages, consider using the `fixed` option in the config to ensure they're always versioned together.

## Troubleshooting

- **Empty changeset list**: If `npm run changeset` shows no packages, make sure your packages have proper `package.json` files with `name` and `version` fields.

- **Publish errors**: If publishing fails, check that you have the correct npm credentials and that the package name is available.

- **Merge conflicts in changelogs**: Resolve conflicts by keeping all entries and fixing any formatting issues.

For more information, see the [official changesets documentation](https://github.com/changesets/changesets).
