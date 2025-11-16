# Tips for Working with Cursor on Faculty Portal

## Cursor Shortcuts

### Code Editing
- `Cmd/Ctrl + K` - Open AI prompt to modify selected code
- `Cmd/Ctrl + L` - Open chat sidebar
- `Cmd/Ctrl + I` - Inline AI edit
- `Tab` - Accept AI suggestion

### Navigation
- `Cmd/Ctrl + P` - Quick file search
- `Cmd/Ctrl + Shift + F` - Search across all files
- `Cmd/Ctrl + Click` - Go to definition

### Cursor AI Features
- **Chat with Codebase**: Ask questions about any file
- **Generate Code**: Select area, press `Cmd+K`, describe what you want
- **Explain Code**: Select code, ask "Explain this"
- **Fix Bugs**: Select error, press `Cmd+K`, say "fix this"

## Common Cursor AI Prompts for This Project

### When Adding Features:
\`\`\`
Add a delete button for assignments in the feedback analyzer tab
\`\`\`

\`\`\`
Create an API route to update course syllabus
\`\`\`

### When Fixing Bugs:
\`\`\`
The chatbot isn't using the syllabus context, fix it
\`\`\`

\`\`\`
PDF upload is failing, add error handling
\`\`\`

### When Styling:
\`\`\`
Make this card look more like Canva's design
\`\`\`

\`\`\`
Add a hover animation to course cards
\`\`\`

### When Refactoring:
\`\`\`
Move this database logic to lib/db.ts
\`\`\`

\`\`\`
Extract this form into a separate component
\`\`\`

## Best Practices with Cursor

1. **Be Specific**: Instead of "fix this", say "add error handling for database connection timeout"
2. **Use Context**: Select relevant code before asking questions
3. **Iterative**: Make small changes, test, then continue
4. **Review AI Code**: Always review generated code before accepting
5. **Use Terminal**: Cursor's terminal shows real-time errors

## Project-Specific Tips

### Database Queries
When writing SQL queries, ask Cursor:
\`\`\`
Write a query to fetch all courses with their assignments and submission counts
\`\`\`

### Component Creation
\`\`\`
Create a reusable FileUpload component that accepts PDFs and returns extracted text
\`\`\`

### API Routes
\`\`\`
Create an API route to handle assignment submission with file upload
\`\`\`

### Styling
\`\`\`
Apply Canva-style design to this login form with gradient accents
