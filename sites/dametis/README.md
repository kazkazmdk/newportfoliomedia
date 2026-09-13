For session saving :
- give an ID to every session (routing)
- same all messages (indexedDB or anything else), can maybe use zustand
- when entering an old session, get all messages, and create the session with an array of all the messages as initialPrompts
- on close (delete), signal destroy, and remove from local storage
