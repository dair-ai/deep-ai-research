# Contributing to Deep AI Research Agent

Thank you for your interest in contributing to the Deep AI Research Agent! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/deep-ai-research.git
   cd deep-ai-research
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   ```
5. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Making Changes

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Make your changes** following our code style and conventions

3. **Test your changes** thoroughly:
   - Test the UI changes in the browser
   - Test agent functionality with various queries
   - Check console for errors
   - Verify cost tracking and metadata display

4. **Keep your commits focused**:
   - Each commit should represent a single logical change
   - Write clear, descriptive commit messages
   ```bash
   git commit -m "Add: feature description"
   git commit -m "Fix: bug description"
   git commit -m "Update: improvement description"
   ```

### Code Style

- **TypeScript**: Use strict typing, avoid `any` when possible
- **Formatting**: Code will auto-format with Prettier
- **Naming**:
  - Components: PascalCase (e.g., `ProgressTracker`)
  - Functions: camelCase (e.g., `handleSubmit`)
  - Files: kebab-case for utilities, PascalCase for components
- **Comments**: Add comments for complex logic and non-obvious decisions

### Project Structure

When adding new features, follow the existing structure:

- **API Routes**: `app/api/agent/*`
- **UI Components**: `components/`
- **Agent Tools**: `lib/agent/tools.ts`
- **Type Definitions**: `lib/types/`
- **Utilities**: `lib/utils.ts`

## Types of Contributions

### = Bug Fixes

If you find a bug:

1. Check if an issue already exists
2. If not, create a new issue describing the bug
3. Fork and create a fix
4. Submit a PR referencing the issue

### ( New Features

For new features:

1. **Discuss first**: Open an issue to discuss the feature before implementation
2. **Get approval**: Wait for maintainer feedback
3. **Implement**: Create a feature branch and implement
4. **Document**: Update README and add comments
5. **Submit**: Create a PR with detailed description

### =Ý Documentation

Documentation improvements are always welcome:

- Fix typos or clarify instructions
- Add examples or tutorials
- Improve code comments
- Update README with new information

### <¨ UI/UX Improvements

For UI changes:

- Maintain consistency with existing design
- Use shadcn/ui components when possible
- Test responsive behavior
- Consider accessibility

## Adding Custom Tools

To add a new tool to the agent:

1. **Define the tool** in `lib/agent/tools.ts`:
   ```typescript
   tool(
     "tool_name",
     "Description of what the tool does",
     {
       param1: z.string().describe("Parameter description"),
       param2: z.number().optional()
     },
     async (args) => {
       // Implementation
       return {
         content: [{
           type: "text",
           text: "Result"
         }]
       };
     }
   )
   ```

2. **Add to MCP server** configuration in `lib/agent/config.ts`:
   ```typescript
   mcpServers: {
     "your-server": yourToolsServer
   }
   ```

3. **Add to allowedTools**:
   ```typescript
   allowedTools: [
     "mcp__your-server__tool_name",
     // ... other tools
   ]
   ```

4. **Update UI components** to recognize the new tool:
   - Add icon in `components/ToolCallSummary.tsx`
   - Add color scheme
   - Update stage mapping in `components/ProgressTracker.tsx`

5. **Test thoroughly** with various inputs

## Pull Request Process

1. **Update your branch** with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** with:
   - Clear title describing the change
   - Detailed description of what and why
   - Screenshots/GIFs for UI changes
   - Reference any related issues

4. **PR Review**:
   - Address reviewer feedback
   - Keep the PR focused and avoid scope creep
   - Be patient and respectful

5. **After Approval**:
   - Maintainers will merge your PR
   - Your contribution will be in the next release!

## Code Review Guidelines

When reviewing PRs:

- Be constructive and respectful
- Focus on code quality and maintainability
- Test the changes locally if possible
- Approve if it meets standards, request changes if needed

## Areas for Contribution

We especially welcome contributions in these areas:

### High Priority
- [ ] Additional search integrations (arXiv API, Semantic Scholar)
- [ ] Enhanced error handling and user feedback
- [ ] Testing infrastructure (unit tests, integration tests)
- [ ] Performance optimizations

### Medium Priority
- [ ] Export formats (PDF, LaTeX, BibTeX)
- [ ] Advanced filtering and search options
- [ ] Citation management improvements
- [ ] Research session persistence

### Low Priority
- [ ] Dark mode enhancements
- [ ] Keyboard shortcuts
- [ ] Accessibility improvements
- [ ] Mobile responsiveness

## Questions or Issues?

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Feature Requests**: Open a GitHub Issue with the "enhancement" label

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Deep AI Research Agent! <‰
