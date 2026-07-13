import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function EditPoem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [poem, setPoem] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("गीत");
  const [ras, setRas] = useState("");
  const [text, setText] = useState("");
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);
  
  useEffect(() => {
    loadPoem();
  }, [id]); 

  const loadPoem = async () => {
    try {
      const res = await api.get(`/poems/${id}`);

      if (res.data.success) {
        const poemData = res.data.poem;
        setPoem(poemData);
        setTitle(poemData.title || "");
        setCategory(poemData.category || "गीत");
        setRas(poemData.ras || "");
        setText(poemData.poem || ""); 
      }
    } catch (err) {
      console.log("Error loading poem:", err);
    }
  };

  const updatePoem = async () => {
    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("category", category);
      formData.append("ras", ras);
      formData.append("poem", text);

      formData.append("removeAudio", removeAudio);
      formData.append("removeCover", removeCover);

      if (audio) {
        formData.append("audio", audio);
      }

      if (cover) {
        formData.append("coverImage", cover);
      }

      const res = await api.put(`/poems/${id}`, formData);

      if (res.data.success) {
        alert("Poem Updated ✅");
        navigate(`/poem/${id}`);
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto", color: "white" }}>
      <h1>✏️ Edit Poem</h1>

      {/* --- करंट कवर इमेज प्रीव्यू --- */}
      {poem?.coverImage && !removeCover && (
        <div style={{ marginBottom: "20px", padding: "15px", background: "#1e293b", borderRadius: "12px" }}>
          <h3 style={{ marginTop: 0 }}>Current Cover</h3>
          <img
  src={`${import.meta.env.VITE_API_URL}${poem.coverImage}`}
  alt="Current Cover"
  style={{
    width: "260px",
    maxHeight: "180px",
    objectFit: "cover",
    borderRadius: "12px"
  }}
/>
          <br /><br />
          <button
            onClick={() => setRemoveCover(true)}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ❌ Delete Cover
          </button>
        </div>
      )}
      <h3>Upload New Cover</h3>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setCover(e.target.files[0]);
            setRemoveCover(true); 
          }
        }}
        style={{ marginBottom: "20px", display: "block" }}
      />
      {poem?.audio && !removeAudio && (
        <div style={{ marginTop: "25px", marginBottom: "20px", padding: "15px", background: "#1e293b", borderRadius: "12px" }}>
          <h3 style={{ marginTop: 0 }}>Current Audio</h3>
          <audio controls>
  <source src={`${import.meta.env.VITE_API_URL}${poem.audio}`} />
  Your browser does not support the audio element.
</audio>
          <br /><br />
          <button
            onClick={() => setRemoveAudio(true)}
            style={{
              padding: "6px 12px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ❌ Delete Audio
          </button>
        </div>
      )}
      <h3>Upload New Audio</h3>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setAudio(e.target.files[0]);
            setRemoveAudio(true); // नया ऑडियो आते ही पुराना रिमूव फ्लैग एक्टिव
          }
        }}
        style={{ marginBottom: "25px", display: "block" }}
      />

      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white"
        }}
      />

      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white"
        }}
      >
        <option>गीत</option>
        <option>मुक्तक</option>
        <option>शेर-ओ-शायरी</option>
        <option>ग़ज़ल</option>
      </select>

      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Ras (रस)</label>
      <input
        value={ras}
        onChange={(e) => setRas(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white"
        }}
      />

      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Poem Text</label>
      <textarea
        rows="12"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "6px",
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white",
          fontFamily: "inherit"
        }}
      />

      <button 
        onClick={updatePoem}
        style={{
          padding: "12px 24px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "16px",
          width: "100%"
        }}
      >
        💾 Save Changes
      </button>
    </div>
  );
}
export default EditPoem;