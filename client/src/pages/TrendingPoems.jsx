import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function TrendingPoems() {
  const navigate = useNavigate();

  const [poems, setPoems] = useState([]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const res = await api.get("/search?sort=trending");

      if (res.data.success) {
        setPoems(res.data.poems);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>📈 Trending Poems</h1>

      {poems.length === 0 ? (
        <h3>No Trending Poems</h3>
      ) : (
        poems.map((poem) => (
          <div
            key={poem._id}
            onClick={() => navigate(`/poem/${poem._id}`)}
            style={{
              marginTop: "20px",
              padding: "20px",
              border: "1px solid #334155",
              borderRadius: "10px",
              cursor: "pointer",
              background: "#0f172a",
              transition: "0.2s",
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
          </div>
        ))
      )}
    </div>
  );
}

export default TrendingPoems;