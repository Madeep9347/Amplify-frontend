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
     REAL-TIME SUBSCRIPTION
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
       
      <input  style={{display: block,
  width: 100%,
  height: 2.714rem,
  padding: 0.438rem 1rem,
  font-size: 1rem,
  font-weight: 400,
  line-height: 1.45,
  color: #6e6b7b,
  background-color: #fff,
  background-clip: padding-box,
  border: 1px solid #d8d6de,
  border-radius: 0.357rem,
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out}}
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

/* 🔐 Wrap the App with Cognito Auth */
export default withAuthenticator(App);
