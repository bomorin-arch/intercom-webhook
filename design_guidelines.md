# Intercom Canvas Kit Application Design Guidelines

## Design Approach
**System-Based Approach**: This Canvas Kit application follows Intercom's native UI patterns and conventions to ensure seamless integration within the Intercom messenger/inbox interface. The design prioritizes clarity, efficiency, and familiar interaction patterns.

## Core Design Principles
1. **Minimalist Focus**: Single-purpose interface - collect user input efficiently
2. **Visual Hierarchy**: Clear distinction between labels, inputs, and actions
3. **Contextual Integration**: Design feels native to Intercom's ecosystem
4. **Immediate Clarity**: User understands the action required instantly

## Typography System

**Text Components**:
- Header text: Bold, larger scale for introductory messages
- Paragraph text: Regular weight, standard reading size for instructions
- Input labels: Medium weight, slightly smaller than paragraphs
- Placeholder text: Lighter weight, clear distinction from entered values
- Muted text: Lighter weight for helper text and secondary information

**Hierarchy Rules**:
- Headers establish context (if needed)
- Labels identify input purpose
- Placeholders guide input format
- Helper text provides additional context below inputs

## Layout & Spacing

**Vertical Rhythm**:
- Use Tailwind spacing units: 3, 4, 6, 8 for consistency
- Component spacing: 6 units between distinct components
- Internal spacing: 3 units between label and input field
- Tight grouping: 4 units for related elements (input + button pair)

**Component Width**:
- Full-width inputs for single-column layouts
- Maintain consistent left/right alignment throughout canvas

## Component Structure

**Input Field**:
- Clear, descriptive label positioned above input
- Generous input height for touch-friendly interaction
- Placeholder text demonstrates expected format
- Rounded corners for approachable feel

**Send Button**:
- Primary style for clear call-to-action emphasis
- Positioned directly below input (minimal gap)
- Full-width or right-aligned based on context
- Label should be action-oriented ("Send", "Submit", "Continue")

**Optional Text Elements**:
- Brief introductory header if context needed
- Helper text below input for format guidance
- Success/error messages with appropriate styling

## Interaction Patterns

**Input Focus**:
- Clear visual feedback on field selection
- Maintains accessibility standards
- Smooth transitions between states

**Button States**:
- Distinct hover state
- Disabled state when input empty (optional)
- Loading state for async operations

**Response Flow**:
- Success message replaces form or displays above
- Error messages appear inline with helpful guidance
- Option to reset/try again after completion

## Canvas Layouts

**Minimal Layout** (Essential only):
- Input field with label
- Send button
- Total: 2 components

**Standard Layout** (Recommended):
- Brief header text explaining purpose
- Input field with label and placeholder
- Send button
- Optional: Helper text
- Total: 3-4 components

**Enhanced Layout** (Conversational):
- Header establishing context
- Paragraph with instructions
- Input field with label
- Helper text with format example
- Send button
- Total: 5 components

## Best Practices

1. **Label Clarity**: Use specific, actionable labels ("Enter your email" vs "Email")
2. **Placeholder Examples**: Show format, not instructions ("name@company.com" not "Type your email")
3. **Button Copy**: Action verbs that indicate next step ("Send Message", "Submit Request")
4. **Concise Headers**: One clear sentence maximum
5. **Progressive Disclosure**: Show only what's needed for current step
6. **Accessible Naming**: All inputs have meaningful IDs and labels

## Success/Error States

**Success Response**:
- Clear confirmation message
- Brief next steps if applicable
- Option to submit another response or close

**Error Handling**:
- Specific error description, not generic "Error occurred"
- Actionable guidance to fix issue
- Retry mechanism built in

This Canvas Kit app integrates seamlessly into Intercom's interface while maintaining clarity and efficiency for single-purpose user input collection.