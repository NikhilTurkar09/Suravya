import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState({});
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [stats, setStats] = useState({});
  const [poems, setPoems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [cover, setCover] = useState(null);
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    loadFavorites();
  }, []);

  useEffect(() => {
    const refresh = () => loadFavorites();

    window.addEventListener("favoriteChanged", refresh);

    return () => window.removeEventListener("favoriteChanged", refresh);
  }, []);

  // मेमोरी लीक्स से बचने के लिए ऑब्जेक्ट URLs का क्लीन-अप
  useEffect(() => {
    return () => {
      if (avatar && typeof avatar !== "string") URL.revokeObjectURL(avatar);
      if (cover && typeof cover !== "string") URL.revokeObjectURL(cover);
    };
  }, [avatar, cover]);

  const loadProfile = async () => {
    try {
      const res = await api.get("/profile");

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setStats(res.data.stats);
        setPoems(res.data.poems);
        setBio(res.data.user.bio || "");
        setName(res.data.user.name);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await api.get("/favorites");

      if (res.data.success) {
        setFavorites(res.data.poems);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadFollowers = async () => {
    try {
      const res = await api.get(`/followers/${user._id}`);

      if (res.data.success) {
        setFollowers(res.data.users);
        setShowFollowers(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadFollowing = async () => {
    try {
      const res = await api.get(`/following/${user._id}`);

      if (res.data.success) {
        setFollowing(res.data.users);
        setShowFollowing(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const saveProfile = async () => {
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("email", user.email);
      formData.append("bio", bio);

      if (avatar) {
        formData.append("avatar", avatar);
      }
      if (cover) {
        formData.append("cover", cover);
      }

      const res = await api.put("/profile", formData);

      if (res.data.success) {
        alert("Profile Updated ✅");
        loadProfile();
        window.dispatchEvent(new Event("profileUpdated"));
      }
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("RESPONSE:", err.response);

      if (err.response) {
        alert(err.response.data.message);
      } else {
        alert(err.message);
      }
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/writer/${user.name}`;

    try {
      await navigator.clipboard.writeText(url);
      alert("✅ Profile Link Copied");
    } catch (err) {
      prompt("Copy this link:", url);
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1100px",
        margin: "auto",
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: "260px",
          overflow: "visible",
          position: "relative",
          borderRadius: "18px",
          background: "#1e293b",
        }}
      >
        {(cover || user.cover) && (
          <img
            src={
              cover
                ? URL.createObjectURL(cover)
                : `http://localhost:5000${user.cover}`
            }
            alt="cover"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "18px",
            }}
          />
        )}
      </div>

      {/* Avatar */}
      <div
        style={{
          textAlign: "center",
          marginTop: "-45px",
        }}
      >
        {avatar || user.avatar ? (
          <img
            src={
              avatar
                ? URL.createObjectURL(avatar)
                : `http://localhost:5000${user.avatar}`
            }
            alt="avatar"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: "5px solid white",
              objectFit: "cover",
              position: "relative",
              zIndex: 10,
            }}
          />
        ) : (
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "#475569",
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "60px",
              border: "5px solid white",
            }}
          >
            👤
          </div>
        )}

        <br />
        <br />
        <br />

        <label
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📷 Change Photo
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files[0])}
          />
        </label>

        &nbsp;&nbsp;&nbsp;

        <label
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🖼 Change Cover
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files[0])}
          />
        </label>

        <br />
        <br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Username"
          style={{
            marginTop: "20px",
            fontSize: "38px",
            fontWeight: "bold",
            textAlign: "center",
            background: "transparent",
            color: "white",
            border: "none",
            outline: "none",
            width: "100%",
          }}
        />

        <p>{user.email}</p>

        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write something about yourself..."
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "10px",
          }}
        />

        <br />
        <br />

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <button
            onClick={saveProfile}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            💾 Save Profile
          </button>

          <button
            onClick={shareProfile}
            style={{
              background: "#16a34a",
              color: "white",
              border: "none",
              padding: "12px 25px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🔗 Share Profile
          </button>
        </div>
      </div>

      <hr style={{ margin: "40px 0" }} />

      <h2>📊 Statistics</h2>
      <p>📚 Poems : {stats.poems || 0}</p>
      <p>❤️ Total Likes : {stats.likes || 0}</p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          margin: "20px 0",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        <p
          onClick={loadFollowers}
          style={{
            cursor: "pointer",
            color: "#38bdf8",
            fontWeight: "bold",
          }}
        >
          👥 Followers : {user.followers?.length || 0}
        </p>

        <p
          onClick={loadFollowing}
          style={{
            cursor: "pointer",
            color: "#38bdf8",
            fontWeight: "bold",
          }}
        >
          ➡️ Following : {user.following?.length || 0}
        </p>
      </div>

      <hr style={{ margin: "40px 0" }} />
      <h2>⭐ My Favorite Poems</h2>

      {favorites.length === 0 ? (
        <p>No Favorite Poems</p>
      ) : (
        favorites.map((p) => (
          <div
            key={p._id}
            onClick={() => {
              navigate(`/poem/${p._id}`);
            }}
            style={{
              marginTop: "15px",
              padding: "20px",
              border: "1px solid #334155",
              borderRadius: "10px",
              background: "#0f172a",
              cursor: "pointer",
            }}
          >
            <h3>{p.title}</h3>
            <p>✍️ {p.poet}</p>
            <p>❤️ {p.likes}</p>
          </div>
        ))
      )}

      <hr style={{ margin: "40px 0" }} />
      <h2>📖 My Poems</h2>

      {poems.length === 0 ? (
        <p>No Poems Yet.</p>
      ) : (
        poems.map((p) => (
          <div
            key={p._id}
            onClick={() => navigate(`/poem/${p._id}`)}
            className="card"
            style={{
              cursor: "pointer",
              marginTop: "15px",
              padding: "20px",
              border: "1px solid #334155",
              borderRadius: "10px",
              background: "#0f172a",
            }}
          >
            {p.coverImage && (
              <img
                src={`http://localhost:5000${p.coverImage}`}
                alt=""
                style={{
                  width: "100%",
                  height: "220px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
              />
            )}

            <h3>{p.title}</h3>

            <p
              style={{
                color: "#ef4444",
                fontWeight: "bold",
              }}
            >
              {p.ras}
            </p>

            <p>❤️ {p.likes}</p>

            {p.audio && (
              <p
                style={{
                  color: "#22c55e",
                  fontWeight: "bold",
                }}
              >
                🎙️ Audio Available
              </p>
            )}

            {/* यहाँ आपकी कंडीशन और नए बटन्स को सही से सेट कर दिया गया है */}
            {currentUser?._id === user._id && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${p._id}`);
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={async (e) => {
                    e.stopPropagation();

                    if (!window.confirm("Delete this poem?")) return;

                    try {
                      const res = await api.delete(`/poems/${p._id}`);

                      if (res.data.success) {
                        alert("Poem Deleted Successfully");
                        loadProfile();
                      }
                    } catch (err) {
                      alert(err.response?.data?.message || "Delete Failed");
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Followers Modal */}
      {showFollowers && (
        <div className="modal">
          <div className="modal-content">
            <h2>Followers</h2>
            <button onClick={() => setShowFollowers(false)}>Close</button>

            {followers.map((u) => (
              <div
                key={u._id}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid gray",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/writer/${u.name}`)}
              >
                <h3>{u.name}</h3>
                <p>{u.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="modal">
          <div className="modal-content">
            <h2>Following</h2>
            <button onClick={() => setShowFollowing(false)}>Close</button>

            {following.map((u) => (
              <div
                key={u._id}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid gray",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/writer/${u.name}`)}
              >
                <h3>{u.name}</h3>
                <p>{u.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;