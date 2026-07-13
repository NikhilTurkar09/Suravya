import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/api";
import featherBg from "../assets/feather-bg.jpeg";

function Home() {
  const navigate = useNavigate();

  const [poems, setPoems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadPoems();
  }, [search, category, sort]);

  const loadPoems = async () => {
    try {
      const res = await api.get(
        `/search?q=${search}&category=${category}&sort=${sort}`
      );
      if (res.data.success) {
        setPoems(res.data.poems);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const categories = [
    { name: "All", icon: "📚" },
    { name: "मुक्तक", icon: "🪶" },
    { name: "शेर-ओ-शायरी", icon: "🌹" },
    { name: "गीत/कविता", icon: "🎶" },
    { name: "ग़ज़ल", icon: "🌙" },
    { name: "भजन", icon: "🪔" },
    { name: "कहानी", icon: "📖" },
    { name: "अन्य", icon: "✨" }
  ];

  return (
    <div className="container">
      {/* Integrated New Hero Section */}
      <section
        className="hero"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "90px 30px",
          textAlign: "center",
          borderRadius: "24px",
          background: "linear-gradient(135deg,#0f172a,#1e3a5f)",
          border: "1px solid #334155",
          boxShadow: "0 25px 50px rgba(0,0,0,.35)",
          marginBottom: "60px"
        }}
      >
        <img
          src={featherBg}
          alt=""
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "1100px",
            opacity: 0.5,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 0
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2
          }}
        >
          <h1
            style={{
              fontFamily: "Tiro Devanagari Hindi",
              fontSize: "100px",
              fontWeight: "1500",
              color: "#52f9e8",
              marginBottom: "10px",
              letterSpacing: "2px"
            }}
          >
            सुराव्य
          </h1>

          <p
            style={{
              fontSize: "40px",
              color: "#5bfbeb",
              marginBottom: "50px",
              fontStyle: "italic"
            }}
          >
           ❧ जहाँ शब्द ख़त्म हो जाते हैं ❧
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "25px"
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search poem or writer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "430px",
                padding: "16px 18px",
                borderRadius: "12px",
                border: "1px solid #475569",
                background: "#0f172a",
                boxShadow: "0 0 18px rgba(251,191,36,.08)",
                outline: "none",
                color: "white",
                fontSize: "16px"
              }}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: "16px",
                borderRadius: "12px",
                background: "#0f172a",
                border: "1px solid #475569",
                color: "white",
                minWidth: "170px",
                boxShadow: "0 0 18px rgba(251,191,36,.08)"
              }}
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              flexWrap: "wrap"
            }}
          >
            {user && (
              <button className="btn-primary" onClick={() => navigate("/upload")}>
                ✍ Publish Poem
              </button>
            )}

            <button className="btn-secondary" onClick={() => navigate("/trending")}>
              🔥 Trending
            </button>

            <button className="btn-secondary" onClick={() => navigate("/top-poets")}>
              🏆 Top Writers
            </button>
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <h2
        style={{
          textAlign: "center",
          fontFamily: "Cormorant Garamond",
          fontSize: "44px",
          color: "#fbbf24",
          marginBottom: "35px"
        }}
      >
        Explore Categories
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "22px",
          marginBottom: "65px"
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.name}
            onClick={() => setCategory(cat.name)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(251,191,36,.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,.25)";
            }}
            style={{
              background: "#0f172a",
              padding: "30px",
              borderRadius: "18px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all .3s",
              border: category === cat.name ? "2px solid #fbbf24" : "1px solid #334155",
              boxShadow: "0 8px 25px rgba(0,0,0,.25)"
            }}
          >
            <div style={{ fontSize: "34px" }}>{cat.icon}</div>
            <h3
              style={{
                marginTop: "12px",
                marginBottom: 0,
                fontSize: "22px",
                color: "#f8fafc"
              }}
            >
              {cat.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Latest Poems Section */}
      <h2
        style={{
          textAlign: "center",
          fontFamily: "Cormorant Garamond",
          fontSize: "44px",
          color: "#fbbf24",
          marginBottom: "35px"
        }}
      >
        Latest Poems
      </h2>

      {poems.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 25px",
            background: "#0f172a",
            borderRadius: "20px",
            border: "1px solid #334155",
            boxShadow: "0 10px 30px rgba(0,0,0,.25)"
          }}
        >
          <h2 style={{ color: "#fbbf24", marginBottom: "15px" }}>📜 No Poems Found</h2>
          <p style={{ color: "#cbd5e1", fontSize: "17px" }}>
            Try another keyword or explore a different category.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))",
            gap: "28px"
          }}
        >
          {poems.map((poem) => (
            <div
              key={poem._id}
              onClick={() => navigate(`/poem/${poem._id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 18px 45px rgba(0,0,0,.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";
              }}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "22px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all .35s ease",
                boxShadow: "0 10px 30px rgba(0,0,0,.25)"
              }}
            >
              {poem.coverImage && (
                <img
                  src={`${import.meta.env.VITE_API_URL}${poem.coverImage}`}
                  alt=""
                  style={{
                    width: "100%",
                    height: "210px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    marginBottom: "18px"
                  }}
                />
              )}

              <div style={{ padding: "24px" }}>
                <h2
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "34px",
                    color: "#f8fafc",
                    marginBottom: "18px"
                  }}
                >
                  📖 {poem.title}
                </h2>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "18px",
                    fontWeight: "600"
                  }}
                >
                  <span style={{ color: "#60a5fa" }}>✍ {poem.poet}</span>
                  <span style={{ color: "#fbbf24" }}>🌸 {poem.ras}</span>
                </div>

                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 14px",
                    borderRadius: "999px",
                    background: "#172554",
                    color: "#cbd5e1",
                    fontSize: "14px",
                    marginBottom: "22px"
                  }}
                >
                  📚 {poem.category}
                </div>

                <p
                  style={{
                    color: "#cbd5e1",
                    lineHeight: "1.8",
                    fontSize: "15px",
                    marginBottom: "25px"
                  }}
                >
                  {poem.poem?.length > 170
                    ? poem.poem.substring(0, 170) + "..."
                    : poem.poem}
                </p>

                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid #334155",
                    marginBottom: "18px"
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#ef4444",
                      fontSize: "17px"
                    }}
                  >
                    ❤️ {poem.likes}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {poem.audio && (
                      <span style={{ color: "#22c55e", fontWeight: "700" }}>
                        🎙 Audio
                      </span>
                    )}
                    <span style={{ color: "#94a3b8", fontWeight: "600" }}>
                      Read →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Home;