import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

function PoemDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [poemData, setPoemData] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const [likes, setLikes] = useState(0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    loadPoem();
  }, [id]);

  const loadPoem = async () => {
    try {
      const res = await api.get(`/poems/${id}`);
      if (res.data.success) {
        setPoemData(res.data.poem);
        setLikes(res.data.poem.likes || 0);
        setComments(res.data.poem.comments || []);
        checkFavorite(res.data.poem._id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetchComments = async () => {
    loadPoem();
  };
const handleLike = async () => {
  try {
    const res = await api.put(
      `/poems/${poemData._id}/like`
    );

    if (res.data.success) {

      if (res.data.liked) {
        alert("❤️ You liked the poem");
      } else {
        alert("💔 You removed your like");
      }

      loadPoem();

    } else {
      alert(res.data.message);
    }

  } catch (err) {
    console.log(err);

    alert(
      err.response?.data?.message ||
      "Something went wrong."
    );
  }
};
const toggleFavorite = async () => {
  try {
    const res = await api.put(`/favorites/${poemData._id}`);

    console.log(res.data);

    if (res.data.success) {
      if (res.data.favorite) {
        alert("💚 Added to your favorites");
      } else {
        alert("❌ Removed from your favorites");
      }

      loadPoem();
      window.dispatchEvent(new Event("favoriteChanged"));
    } else {
      alert(res.data.message);
    }

  } catch (err) {
    console.log("FULL ERROR =", err);
    console.log("RESPONSE =", err.response);

    alert(err.response?.data?.message || err.message);
  }
};

  const checkFavorite = async (poemId) => {
    try {
      const res = await api.get(`/favorites/check/${poemId}`);
      if (res.data.success) {
        setFavorite(res.data.favorite);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/poem/${poemData._id}/comment`, {
        text: comment,
      });
      if (res.data.success) {
        setComment("");
        fetchComments();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/poem/${poemData._id}/comment/${commentId}`);
      if (res.data.success) {
        fetchComments();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const replyComment = async (commentId) => {
    const text = prompt("Reply");
    if (!text) return;
    try {
      const res = await api.post(`/poem/${poemData._id}/reply/${commentId}`, {
        text,
      });
      if (res.data.success) {
        fetchComments();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const deletePoem = async () => {
    if (!window.confirm("Delete this poem?")) return;
    try {
      const res = await api.delete(`/poems/${poemData._id}`);
      if (res.data.success) {
        alert("Poem Deleted");
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ maxWidth: "950px", margin: "auto", padding: "35px 20px" }}>
      {poemData.coverImage && (
        <img
          src={`http://localhost:5000${poemData.coverImage}`}
          alt=""
          style={{
            width: "100%",
            height: "420px",
            objectFit: "cover",
            borderRadius: "20px",
            marginBottom: "35px",
            boxShadow: "0 18px 45px rgba(0,0,0,.35)",
          }}
        />
      )}

      <h1
        style={{
          fontFamily: "Cormorant Garamond",
          fontSize: "54px",
          textAlign: "center",
          color: "#fbbf24",
          marginBottom: "10px",
        }}
      >
        {poemData.title}
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#f59e0b",
          fontWeight: "700",
          fontSize: "20px",
          marginBottom: "25px",
        }}
      >
        🌸 {poemData.ras}
      </p>

      <p
        style={{
          color: "#60a5fa",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "20px",
          textAlign: "center",
          marginBottom: "30px",
        }}
        onClick={() => navigate(`/writer/${poemData.poet}`)}
      >
        ✍️ {poemData.poet}
      </p>

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #334155",
          borderRadius: "12px",
          background: "#0f172a",
        }}
      >
        <h3>✍️ कवि परिचय</h3>
        <p>
          <strong>{poemData.poet}</strong>
        </p>
        <p>❤️ Total Likes : {likes}</p>
      </div>

      {/* Cleaned up action buttons container */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={handleLike}
          style={{
            padding: "12px 22px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
            transition: ".3s",
          }}
        >
          ❤️ Like ({likes})
        </button>

        <button
          onClick={toggleFavorite}
          style={{
            padding: "12px 22px",
            background: favorite ? "#09ec5c" : "#1d304f",
            color: "white",
            border: "1px solid #475569",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          {favorite ? "💚Favorited💚" : "☆ Favorite"}
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          style={{
            padding: "12px 22px",
            background: "#e7e71c",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          🔗 Share
        </button>

        {user && user.name === poemData.poet && (
          <button
            onClick={() => {
              localStorage.setItem("selectedPoem", JSON.stringify(poemData));
              navigate("/edit");
            }}
            style={{
              padding: "12px 22px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "15px",
          }}
          >
            ✏ Edit
          </button>
        )}

        {user && user.name === poemData.poet && (
          <button
            onClick={deletePoem}
            style={{
              padding: "12px 22px",
              background: "#7f1d1d",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "15px",
            }}
          >
            🗑 Delete
          </button>
        )}
      </div>

      {poemData.audio && (
        <div
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #334155",
            borderRadius: "12px",
            background: "#1e293b",
          }}
        >
          <h3>🎙️ श्रव्य पाठ</h3>
          <audio controls style={{ width: "100%" }}>
            <source
              src={`http://localhost:5000${poemData.audio}`}
              type="audio/mpeg"
            />
            Your browser does not support audio.
          </audio>
        </div>
      )}

      <hr />

      <div
        style={{
          background: "#172554",
          border: "1px solid #334155",
          borderRadius: "20px",
          padding: "45px",
          marginTop: "35px",
          marginBottom: "40px",
          boxShadow: "0 12px 35px rgba(0,0,0,.25)",
        }}
      >
        <pre
          style={{
            whiteSpace: "pre-wrap",
            fontFamily: "Cormorant Garamond",
            fontSize: "30px",
            lineHeight: "2.15",
            color: "#f8fafc",
            textAlign: "center",
            margin: 0,
          }}
        >
          {poemData.poem}
        </pre>
      </div>

      <hr />

      <h2
        style={{
          fontFamily: "Cormorant Garamond",
          fontSize: "40px",
          color: "#fbbf24",
          marginBottom: "25px",
        }}
      >
        💬 Comments
      </h2>

      <input
        type="text"
        placeholder="अपनी टिप्पणी लिखें..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{
          width: "100%",
          padding: "16px",
          fontSize: "16px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "white",
          outline: "none",
        }}
      />

      <br />
      <br />

      <button className="btn-primary" onClick={addComment}>
        💬 Add Comment
      </button>

      <div style={{ marginTop: "20px" }}>
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              style={{
                marginTop: "20px",
                padding: "22px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "18px",
                boxShadow: "0 10px 25px rgba(0,0,0,.25)",
              }}
            >
              <strong>{c.name}</strong>
              <p style={{ marginTop: "8px" }}>{c.text}</p>

              <button onClick={() => replyComment(c._id)}>
                ↩ Reply
              </button>

              {user && c.user === user._id && (
                <button
                  onClick={() => deleteComment(c._id)}
                  style={{ marginLeft: "10px" }}
                >
                  🗑 Delete
                </button>
              )}

              <div style={{ marginLeft: "30px", marginTop: "15px" }}>
                {c.replies?.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      padding: "14px",
                      marginTop: "12px",
                      background: "#172554",
                      borderRadius: "12px",
                      border: "1px solid #334155",
                    }}
                  >
                    <strong>{r.name}</strong>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PoemDetail;