import React, { useEffect, useState } from "react";
import { HeartHandshake, MessageCircle, Plus, ThumbsUp, UsersRound, Send } from "lucide-react";

const defaultPosts = [
  { id: 1, name: "Aarav", text: "Found an excellent electrician through the community today. Very quick and professional!", likes: 18, replies: [] },
  { id: 2, name: "Meera", text: "Does anyone know a reliable gardener available this weekend?", likes: 7, replies: [] },
  { id: 3, name: "Kabir", text: "Just completed my 50th job on the platform. Thank you for trusting local workers!", likes: 31, replies: [] }
];

export default function Community() {
  const [posts, setPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("communityPosts")) || defaultPosts; }
    catch { return defaultPosts; }
  });
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [openReply, setOpenReply] = useState(null);
  const [liked, setLiked] = useState(() => JSON.parse(localStorage.getItem("communityLiked") || "{}"));

  useEffect(() => localStorage.setItem("communityPosts", JSON.stringify(posts)), [posts]);
  useEffect(() => localStorage.setItem("communityLiked", JSON.stringify(liked)), [liked]);

  const addPost = () => {
    if (!text.trim()) return;
    setPosts([{ id: Date.now(), name: "You", text: text.trim(), likes: 0, replies: [] }, ...posts]);
    setText("");
  };

  const toggleLike = (id) => {
    const key = String(id);
    const alreadyLiked = !!liked[key];
    setLiked(prev => ({ ...prev, [key]: !alreadyLiked }));
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, likes: Math.max(0, p.likes + (alreadyLiked ? -1 : 1)) }
      : p
    ));
  };

  const addReply = (postId) => {
    const reply = (replyText[postId] || "").trim();
    if (!reply) return;
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, replies: [...(p.replies || []), { id: Date.now(), name: "You", text: reply }] }
      : p
    ));
    setReplyText(prev => ({ ...prev, [postId]: "" }));
    setOpenReply(null);
  };

  return <section className="page-section">
    <div className="community-hero">
      <div><span className="eyebrow">COMMUNITY HUB</span><h1>People helping people.</h1><p>Ask questions, share recommendations, celebrate local workers and make your neighborhood stronger.</p></div>
      <div className="community-art"><UsersRound size={70}/><HeartHandshake size={50}/></div>
    </div>

    <div className="community-grid">
      <div className="post-box">
        <h3>Share with the community</h3>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Ask for a recommendation or share your experience..."/>
        <button className="primary-btn" onClick={addPost}><Plus size={16}/> Post</button>
      </div>

      <div className="feed">
        {posts.map(p => <article className="post" key={p.id}>
          <div className="post-avatar">{p.name[0]}</div>
          <div className="post-content">
            <b>{p.name}</b>
            <p>{p.text}</p>

            <div className="post-actions">
              <button className={liked[String(p.id)] ? "liked" : ""} onClick={() => toggleLike(p.id)}>
                <ThumbsUp size={15}/> {p.likes}
              </button>
              <button onClick={() => setOpenReply(openReply === p.id ? null : p.id)}>
                <MessageCircle size={15}/> Reply {p.replies?.length ? `(${p.replies.length})` : ""}
              </button>
            </div>

            {openReply === p.id && (
              <div className="reply-box">
                <input
                  value={replyText[p.id] || ""}
                  onChange={e => setReplyText(prev => ({ ...prev, [p.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addReply(p.id)}
                  placeholder="Write a reply..."
                />
                <button onClick={() => addReply(p.id)} aria-label="Send reply"><Send size={15}/></button>
              </div>
            )}

            {p.replies?.length > 0 && (
              <div className="replies">
                {p.replies.map(r => (
                  <div className="reply" key={r.id}>
                    <div className="reply-avatar">{r.name[0]}</div>
                    <div><b>{r.name}</b><p>{r.text}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
