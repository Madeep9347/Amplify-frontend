import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/api";

const client = generateClient();

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
      const result = await client.graphql({
        query: listNotesQuery
      });
      setNotes(result.data.getNotes);
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
          const newNote = data.onCreateNote;
          setNotes(prev => [newNote, ...prev]);
        },
        error: error => console.error("Subscription error", error)
      });

    return () => subscription.unsubscribe();
  }, []);

  /* =========================
     Create note
  ========================= */
  async function createNote() {
    if (!title || !content) return;

    await client.graphql({
      query: createNoteMutation,
      variables: { title, content }
    });

    setTitle("");
    setContent("");
    // ❌ Do NOT reload notes
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
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
      {notes.map(note => (
        <div
          key={note.noteId}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginTop: 10
          }}
        >
          <strong>{note.title}</strong>
          <br />
          {note.content}
        </div>
      ))}
    </div>
  );
}
