import { useEffect, useState } from "react";
import api from "../api/api";

function AdminPanel() {
  const [poems, setPoems] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPoems, setRecentPoems] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [stats, setStats] = useState({
    users: 0,
    poems: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      console.log("Dashboard =", JSON.stringify(res.data, null, 2));

      if (res.data.success) {
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers || []);
        setRecentPoems(res.data.recentPoems || []);
        setPoems(res.data.pendingPoems || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const approve = async (id) => {
    try {
      const res = await api.put(`/admin/approve/${id}`);

      alert(res.data.message);

      await loadDashboard();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Approve Failed"
      );
    }
  };

  const reject = async (id) => {
    const reason = prompt("Reject Reason");

    if (!reason) return;

    try {
      await api.put(`/admin/reject/${id}`, {
        reason,
      });

      alert("❌ Rejected");

      await loadDashboard();
    } catch (err) {
      console.log(err);
    }
  };
console.log("Stats =", stats);
console.log("Recent Users =", recentUsers);
console.log("Recent Poems =", recentPoems);
console.log("Pending =", poems);
  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <h1>🛡 Admin Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "20px",
          marginTop: "30px",
          marginBottom: "40px",
        }}
      >
        <div
  className="card"
  onClick={() => setFilter("users")}
  style={{
    cursor: "pointer",
    background:
      filter === "users"
        ? "#2563eb"
        : "#1e293b",
    color: "white",
  }}
>
  <h2>👥 Users</h2>
          <h1>{stats.users}</h1>
        </div>

<div
  className="card"
  onClick={() => setFilter("poems")}
  style={{
    cursor: "pointer",
    background:
      filter === "poems"
        ? "#2563eb"
        : "#1e293b",
    color: "white",
  }}
>
<h2>📚 Poems</h2>
<h1>{stats.poems}</h1>
</div>

<div
  className="card"
  onClick={() => setFilter("pending")}
  style={{
    cursor: "pointer",
    background:
      filter === "pending"
        ? "#f59e0b"
        : "#1e293b",
    color: "white",
  }}
>
  <h2>⏳ Pending</h2>
          <h1>{stats.pending}</h1>
        </div>

<div
  className="card"
  onClick={() => setFilter("approved")}
  style={{
    cursor: "pointer",
    background:
      filter === "approved"
        ? "#22c55e"
        : "#1e293b",
    color: "white",
  }}
>
  <h2>✅ Approved</h2>
          <h1>{stats.approved}</h1>
        </div>

<div
  className="card"
  onClick={() => setFilter("rejected")}
  style={{
    cursor: "pointer",
    background:
      filter === "rejected"
        ? "#ef4444"
        : "#1e293b",
    color: "white",
  }}
>
  <h2>❌ Rejected</h2>
          <h1>{stats.rejected}</h1>
        </div>

<div
  className="card"
  onClick={() => setFilter("likes")}
  style={{
    cursor: "pointer",
    background:
      filter === "likes"
        ? "#ec4899"
        : "#1e293b",
    color: "white",
  }}
>
          <h2>❤️ Likes</h2>
          <h1>{stats.totalLikes}</h1>
        </div>
      </div>

      <hr />
{filter && (
  <button
    onClick={() => setFilter("")}
    style={{
      marginBottom: "20px",
      padding: "10px 20px",
      cursor: "pointer",
      borderRadius: "8px",
    }}
  >
    Clear Filter
  </button>
)}
      <h2>⏳ Pending Poems</h2>

      {/* ================= Pending Poems ================= */}

{(filter === "" || filter === "pending") && (
  <>
    <hr />

    <h2>⏳ Pending Poems</h2>

    {poems.length === 0 ? (
      <h3>No Pending Poems</h3>
    ) : (
      poems.map((poem) => (
        <div
          key={poem._id}
          className="card"
          style={{
            marginTop: "20px",
            padding: "20px",
          }}
        >
          <h3>{poem.title}</h3>

          <p>
            <b>Writer:</b> {poem.poet}
          </p>

          <p>
            <b>Category:</b> {poem.category}
          </p>

          <p>
            <b>Ras:</b> {poem.ras}
          </p>

          <p>{poem.poem}</p>

          <button
            onClick={() => approve(poem._id)}
          >
            ✅ Approve
          </button>

          <button
            style={{ marginLeft: "10px" }}
            onClick={() => reject(poem._id)}
          >
            ❌ Reject
          </button>
        </div>
      ))
    )}
  </>
)}

      <hr />

      {(filter === "" || filter === "users") && (
<>
<h2>👥 Recent Users</h2>
            {recentUsers.length === 0 ? (
        <p>No Users Found</p>
      ) : (
        recentUsers.map((u) => (
          <div
            key={u._id}
            className="card"
            style={{
              marginTop: "15px",
              padding: "15px",
            }}
          >
            <h3>{u.name}</h3>

            <p>{u.email}</p>

            <p>
              Followers :{" "}
              {u.followers?.length || 0}
            </p>
          </div>
        ))
      )}
</>)}
      <hr />

      {(filter === "" ||
filter === "poems" ||
filter === "approved" ||
filter === "rejected") && (
<>
<h2>📖 Recent Poems</h2>

      {recentPoems.length === 0 ? (
        <p>No Poems Found</p>
      ) : (
        recentPoems.map((p) => (
          <div
            key={p._id}
            className="card"
            style={{
              marginTop: "15px",
              padding: "15px",
            }}
          >
            <h3>{p.title}</h3>

            <p>
              <b>Writer :</b> {p.poet}
            </p>

            <p>
              <b>Status :</b>{" "}
              <span
                style={{
                  color:
                    p.status === "approved"
                      ? "limegreen"
                      : p.status === "pending"
                      ? "orange"
                      : "red",
                  fontWeight: "bold",
                }}
              >
                {p.status}
              </span>
            </p>
            <p>
              ❤️ {p.likes}
            </p>
          </div>
        ))
      )}
      </>
)}
    </div>
  );
}
export default AdminPanel;