# Project memory

## Product intent & audience

- App for uploading/receiving AI feedback on artwork (visual art analysis).
- Users can ask follow-up questions about feedback they received on their artwork.
- Has a chat-based follow-up flow tied to specific artwork/feedback results.

## Brand personality & voice

- Art-focused, creative context; tone supports critique and discussion about artwork.

## Visual design & UX direction

- Chat interface pattern: input bar + send button, message list, suggested question chips.
- FollowupChat component: input bar and send button must always be visible (not gated on existing messages).
- Suggested-question chips should send immediately rather than only filling the input field.
- Icons via lucide-react; styling via Tailwind; imports via `@/` alias.

## Decisions, constraints & rationale

- Backend uses edge functions with a "followup mode" for handling follow-up chat messages.
- AI detection/analysis flow exists server-side, feeding into the feedback and follow-up chat.
- Bug fixed: follow-up input was only rendered after a message existed (chicken-and-egg); now always rendered.
- Suggested questions changed from fill-input to immediate-send behavior.

## Open questions & assumptions

- Edge function platform not yet confirmed (likely Supabase).
- Full scope of artwork analysis features beyond follow-up chat is unclear.
- Unknown whether multiple artworks/sessions are persisted per user.