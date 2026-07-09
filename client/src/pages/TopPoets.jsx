import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function TopWriters() {
  const navigate = useNavigate();

  const [writers, setWriters] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get("/top-writers");

      if (res.data.success) {
        setWriters(res.data.writers);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h1>🏅 Top Writers</h1>

      {writers.length === 0 ? (
        <h3>No Writers Found</h3>
      ) : (
        writers.map((w, index) => (
          <div
            key={w._id}
            className="card"
            onClick={() => navigate(`/writer/${w.name}`)}
            style={{
              marginTop: "20px",
              padding: "20px",
              cursor: "pointer",
            }}
          >
            <h2>
              {index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : `#${index + 1}`}{" "}
              {w.name}
            </h2>

            <p>📚 Poems : {w.poemCount}</p>

            <p>❤️ Likes : {w.likes}</p>

            <p>⭐ Favorites : {w.favorites}</p>

            <p>👥 Followers : {w.followers}</p>

            <hr />

            <h3 style={{ color: "#22c55e" }}>
              Score : {w.score}
            </h3>
          </div>
        ))
      )}
    </div>
  );
}

export default TopWriters;