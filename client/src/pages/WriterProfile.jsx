import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function WriterProfile() {
  const { name } = useParams();
  const navigate = useNavigate();

  const [writer, setWriter] = useState({});
  const [stats, setStats] = useState({});
  const [poems, setPoems] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = JSON.parse(
  localStorage.getItem("user")
);
  useEffect(() => {
    loadWriter();
  }, [name]);

  const loadWriter = async () => {
  try {
    const res = await api.get(`/writer/${name}`);

    console.log("WRITER =", res.data.writer);
    console.log("FULL RESPONSE =", res.data);

    if (res.data.success) {
      setWriter(res.data.writer);
      setStats(res.data.stats);
      setPoems(res.data.poems);
      setIsFollowing(res.data.isFollowing);
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.log(err);
  }
};

  const followUser = async () => {
  try {
    const res = await api.post(`/follow/${writer._id}`);

    console.log(res.data);

    if (res.data.success) {
      await loadWriter();
    }
  } catch (err) {
    console.log(err);
  }
};
  const shareProfile = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert("✅ Profile Link Copied");
    } catch (err) {
      prompt("Copy this link:", url);
    }
  };
  console.log(writer);
console.log(isFollowing);
  return (
    <div style={{ padding: "30px" }}>
      {/* Cover */}
      <div
        style={{
          height: "220px",
          background: "#1e293b",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        {writer.cover && (
         <img
  src={`${import.meta.env.VITE_API_URL}${writer.cover}`}
  alt="Cover"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover",
  }}
/>
        )}
      </div>

      {/* Profile */}
      <div
        style={{
          textAlign: "center",
          marginTop: "-70px",
        }}
      >
        {writer.avatar ? (
          <img
  src={`${import.meta.env.VITE_API_URL}${writer.avatar}`}
  alt="Avatar"
  style={{
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    border: "5px solid white",
    objectFit: "cover",
  }}
/>
        ) : (
          <div
            style={{
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "#475569",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "55px",
              margin: "auto",
            }}
          >
            👤
          </div>
        )}

        <h1
  style={{
    marginBottom: "8px",
    fontSize: "42px",
    color: "#f8fafc",
  }}
>
  {writer.name}
</h1>
        <p
  style={{
    color: "#cbd5e1",
    maxWidth: "650px",
    margin: "10px auto",
    fontSize: "17px",
    lineHeight: "28px",
  }}
>
  {writer.bio || "No Bio Available"}
</p>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    marginTop: "25px",
    flexWrap: "wrap",
  }}
>
  <div>
    <h2 style={{ color: "#38bdf8", margin: 0 }}>
      {stats.poems || 0}
    </h2>
    <p>Poems</p>
  </div>

  <div>
    <h2 style={{ color: "#ef4444", margin: 0 }}>
      {stats.likes || 0}
    </h2>
    <p>Total Likes</p>
  </div>
</div>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    margin: "15px 0",
  }}
>
  <p>👥 Followers: {writer.followers?.length || 0}</p>
  <p>➡️ Following: {writer.following?.length || 0}</p>
</div>
<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    marginTop: "30px",
    flexWrap: "wrap",
  }}
>
  {writer._id !== currentUser?._id && (
    <button
      onClick={followUser}
      style={{
        background: isFollowing ? "#dc2626" : "#2563eb",
        color: "white",
        border: "none",
        padding: "12px 28px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
        transition: ".3s",
      }}
    >
      {isFollowing ? "❤️ Unfollow" : "➕ Follow"}
    </button>
  )}

  <button
    onClick={shareProfile}
    style={{
      background: "#16a34a",
      color: "white",
      border: "none",
      padding: "12px 28px",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    🔗 Share Profile
  </button>
</div>

      </div>

      <hr />

<h2
  style={{
    textAlign: "center",
    marginTop: "50px",
    marginBottom: "30px",
    color: "#f8fafc",
    fontSize: "32px",
  }}
>
  📚 Published Poems
</h2>

      {poems.length === 0 ? (
        <p>No Poems Found</p>
      ) : (
        poems.map((poem) => (
          <div
            key={poem._id}
            style={{
  marginTop: "25px",
  border: "1px solid #334155",
  borderRadius: "18px",
  padding: "24px",
  cursor: "pointer",
  background: "#162235",
  transition: ".3s",
  boxShadow: "0 8px 25px rgba(0,0,0,.25)",
}}
            onClick={() => {
  navigate(`/poem/${poem._id}`);
}}
          >
            <div
  style={{
    textAlign: "center",
    marginBottom: "15px",
  }}
>
  <h2
    style={{
      margin: 0,
      color: "#f8fafc",
      fontSize: "24px",
      fontWeight: "bold",
    }}
  >
    📖 {poem.title}
  </h2>

  <div
    style={{
      marginTop: "10px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      color: "#cbd5e1",
      fontSize: "15px",
      fontWeight: "600",
    }}
  >
    <span style={{ color: "#38bdf8" }}>
      ✍️ {poem.poet}
    </span>

    <span>|</span>

    <span style={{ color: "#f59e0b" }}>
      🌸 {poem.ras}
    </span>

    <span>|</span>

    <span style={{ color: "#22c55e" }}>
      📚 {poem.category}
    </span>
  </div>

  <hr
    style={{
      border: "none",
      borderTop: "1px solid #334155",
      marginTop: "15px",
    }}
  />
</div>

            <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "18px",
  }}
>
  {poem.audio && (
    <span
      style={{
        color: "#22c55e",
        fontWeight: "bold",
      }}
    >
      🎙️ Audio Available
    </span>
  )}

  <span
    style={{
      color: "#f87171",
      fontWeight: "bold",
    }}
  >
    ❤️ {poem.likes}
  </span>
</div>
          </div>
        ))
      )}
    </div>
  );
}
export default WriterProfile;