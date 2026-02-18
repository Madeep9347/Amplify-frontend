import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

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
      processed
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
      processed
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
      processed
    }
  }
`;

const onUpdateNoteSubscription = `
  subscription {
    onUpdateNote {
      noteId
      processed
    }
  }
`;

function App({ signOut, user }) {
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
          query: listNotesQuery,
          authMode: "userPool"
        });

        setNotes(result.data?.getNotes ?? []);
      } catch (err) {
        console.error("Error loading notes", err);
      }
    }

    loadNotes();
  }, []);

  /* =========================
     CREATE SUBSCRIPTION
  ========================= */
  useEffect(() => {
    const subscription = client
      .graphql({
        query: onCreateNoteSubscription,
        authMode: "userPool"
      })
      .subscribe({
        next: ({ data }) => {
          const newNote = data?.onCreateNote;
          if (!newNote) return;

          setNotes(prev => {
            if (prev.some(n => n.noteId === newNote.noteId)) {
              return prev;
            }
            return [newNote, ...prev];
          });
        },
        error: error => console.error("Create subscription error", error)
      });

    return () => subscription.unsubscribe();
  }, []);

  /* =========================
     UPDATE SUBSCRIPTION
  ========================= */
  useEffect(() => {
    const subscription = client
      .graphql({
        query: onUpdateNoteSubscription,
        authMode: "userPool"
      })
      .subscribe({
        next: ({ data }) => {
          const updatedNote = data?.onUpdateNote;
          if (!updatedNote) return;

          setNotes(prev =>
            prev.map(note =>
              note.noteId === updatedNote.noteId
                ? { ...note, processed: updatedNote.processed }
                : note
            )
          );
        },
        error: error => console.error("Update subscription error", error)
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
        variables: { title, content },
        authMode: "userPool"
      });

      setTitle("");
      setContent("");
    } catch (err) {
      console.error("Error creating note", err);
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>📝 Real-Time Serverless Notes</h1>
        <div>
          <span style={{ marginRight: 10 }}>
            Logged in as: {user?.signInDetails?.loginId}
          </span>
          <button onClick={signOut}>Sign Out</button>
        </div>
      </div>

      <h3>Create Note</h3>

      <input
        style={{
          display: "block",
          width: "100%",
          height: "2.714rem",
          padding: "0.438rem 1rem",
          fontSize: "1rem",
          border: "1px solid #d8d6de",
          borderRadius: "0.357rem",
          marginBottom: "10px"
        }}
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        style={{
          display: "block",
          width: "100%",
          minHeight: "100px",
          padding: "0.75rem",
          fontSize: "1rem",
          border: "1px solid #d8d6de",
          borderRadius: "0.357rem",
          marginBottom: "10px"
        }}
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <button
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          borderRadius: "4px"
        }}
        onClick={createNote}
      >
        Create
      </button>

      <h3 style={{ marginTop: 30 }}>Notes</h3>

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
          <br />
          <small>
            {note.processed ? "✅ Processed" : "⏳ Processing..."}
          </small>
        </div>
      ))}
    </div>
  );
}

export default withAuthenticator(App);
