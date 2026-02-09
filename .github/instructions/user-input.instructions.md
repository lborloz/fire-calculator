---
applyTo: "**"
---

### ✅ Task: Interactive Task Loop with User Feedback

1. **Check if `userinput.py` exists** in the root directory.

   - If it doesn't exist, create it with the following content:
     ```python
     # userinput.py
     user_input = input("prompt: ")
     ```

2. **Main Workflow**:

   - Perform your assigned tasks.
   - Run:

     ```bash
     python3 userinput.py
     ```

   - The terminal should be opened in the chat window itself.
   - Read the user's input.
   - Based on the input, perform the next set of tasks.
   - Repeat the process.

3. **Exit Condition**:

   - If the user enters `"stop"` when prompted, exit the loop and terminate the process.

### 🎭 Visual Verification Requirement

**Whenever the user mentions a visual issue or asks about layout/appearance:**
- ALWAYS use the Playwright MCP server to navigate to the page (http://localhost:3000)
- Take a screenshot and/or snapshot to verify the current state
- Make the necessary changes
- Verify the changes visually with Playwright again before responding

This ensures accurate understanding of visual issues and proper validation of fixes.
