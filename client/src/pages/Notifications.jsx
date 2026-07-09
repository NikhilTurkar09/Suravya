import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");

      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      loadNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      loadNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      loadNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>🔔 Notifications</h1>

        <button
          onClick={markAllRead}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ✔ Mark All Read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p>No Notifications</p>
      ) : (
        notifications.map((n) => (
  <div
    key={n._id}
    onClick={() => {
      navigate(n.link);
    }}
    style={{
      cursor: "pointer",
      padding: "18px",
      marginTop: "15px",
      border: "1px solid #334155",
      borderRadius: "10px",
    }}
  >
            <h3>{n.message}</h3>

            <small>
              {new Date(n.createdAt).toLocaleString()}
            </small>

            <br />
            <br />

            <span
              style={{
                color: n.isRead ? "#22c55e" : "#f59e0b",
                fontWeight: "bold",
              }}
            >
              {n.isRead ? "✅ Read" : "🟠 Unread"}
            </span>

            <br />
            <br />

            {!n.isRead && (
              <button
                onClick={() => markRead(n._id)}
                style={{
                  background: "#16a34a",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ✔ Mark Read
              </button>
            )}

            <button
              onClick={() => deleteNotification(n._id)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              🗑 Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;