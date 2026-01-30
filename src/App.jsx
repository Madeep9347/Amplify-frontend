import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";

const client = generateClient();

/* =========================
   GraphQL Operations
========================= */
const listNotesQuery = `
  query {
    getNotes {
      noteId
      title
      content
      createdAt
    }
  }
`;

const createNoteMutation = `
  mutation CreateNote($title: String!, $content: String!) {
    createNote(title: $title, content: $content) {
      noteId
      title
      content
      createdAt
    }
  }
`;

const onCreateNoteSubscription = `
  subscription {
    onCreateNote {
      noteId
      title
      content
      createdAt
    }
  }
`;

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /* =========================
     Load notes ONCE
  ========================= */
  useEffect(() => {
    async function loadNotes() {
      try {
        const result = await client.graphql({
          query: listNotesQuery
        });

        // Defensive: ensure array
        setNotes(result.data?.getNotes ?? []);
      } catch (err) {
        console.error("Error loading notes", err);
      }
    }

    loadNotes();
  }, []);

  /* =========================
     REAL-TIME SUBSCRIPTION
  ========================= */
  useEffect(() => {
    const subscription = client
      .graphql({ query: onCreateNoteSubscription })
      .subscribe({
        next: ({ data }) => {
          const newNote = data?.onCreateNote;
          if (!newNote) return;

          setNotes(prev => {
            // 🔐 Extra safety: avoid duplicates by noteId
            if (prev.some(n => n.noteId === newNote.noteId)) {
              return prev;
            }
            return [newNote, ...prev];
          });
        },
        error: error => console.error("Subscription error", error)
      });

    return () => subscription.unsubscribe();
  }, []);

  /* =========================
     Create note
  ========================= */
  async function createNote() {
    if (!title.trim() || !content.trim()) return;

    try {
      await client.graphql({
        query: createNoteMutation,
        variables: { title, content }
      });

      setTitle("");
      setContent("");
      // ❌ DO NOT reload notes
    } catch (err) {
      console.error("Error creating note", err);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>📝 Real-Time Serverless Notes</h1>

      <h3>Create Note</h3>
      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <br />
      <button onClick={createNote}>Create</button>

      <h3>Notes</h3>

      {notes.length === 0 && <p>No notes yet</p>}

      {notes.map(note => (
        <div
          key={note.noteId}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginTop: 10,
            borderRadius: 4
          }}
        >
          <strong>{note.title || "(no title)"}</strong>
          <br />
          <span>{note.content || "(no content)"}</span>
        </div>
      ))}
    </div>
  );
}
