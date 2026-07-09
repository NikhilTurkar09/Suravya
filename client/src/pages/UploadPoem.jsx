import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function UploadPoem() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("गीत/कविता");
  const [ras, setRas] = useState("");
  const [poem, setPoem] = useState("");
  const [audio, setAudio] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleCover = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Revoke old preview before generating a new one
    if (preview) URL.revokeObjectURL(preview);

    setCoverImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title || !ras || !poem) {
      alert("सभी फ़ील्ड भरें");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("ras", ras);
      formData.append("poem", poem);
      formData.append("poet", user?.name || "Anonymous");

      if (audio) {
        formData.append("audio", audio);
      }

      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      const res = await api.post("/poems", formData);

      if (res.data.success) {
        alert(res.data.message);

        setTitle("");
        setCategory("गीत/कविता");
        setRas("");
        setPoem("");
        setAudio(null);
        setCoverImage(null);
        setPreview("");

        navigate("/");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Upload Failed");
    }
  };

  return (
    <div
      style={{
        maxWidth: "950px",
        margin: "40px auto",
        padding: "35px",
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "24px",
        boxShadow: "0 15px 40px rgba(0,0,0,.35)"
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontFamily: "Cormorant Garamond",
          fontSize: "54px",
          color: "#fbbf24",
          marginBottom: "10px"
        }}
      >
        ✍️ नई रचना प्रकाशित करें
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#cbd5e1",
          marginBottom: "35px"
        }}
      >
        अपने शब्दों को सुरों की दुनिया तक पहुँचाइए
      </p>

      {preview && (
        <img
          src={preview}
          alt=""
          style={{
            width: "100%",
            height: "330px",
            objectFit: "cover",
            borderRadius: "18px",
            marginBottom: "25px",
            boxShadow: "0 12px 30px rgba(0,0,0,.35)"
          }}
        />
      )}

      <label style={{ fontWeight: "700", color: "#fbbf24" }}>
        🖼 Poem Cover Image
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleCover}
        style={{
          width: "100%",
          marginTop: "10px",
          marginBottom: "25px",
          color: "white"
        }}
      />

      <input
        type="text"
        placeholder="📖 रचना का शीर्षक"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "white",
          fontSize: "16px",
          marginBottom: "20px",
          outline: "none"
        }}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "white",
          fontSize: "16px",
          marginBottom: "20px",
          outline: "none"
        }}
      >
        <option>गीत/कविता</option>
        <option>मुक्तक</option>
        <option>ग़ज़ल</option>
        <option>शेर-ओ-शायरी</option>
        <option>भजन</option>
        <option>कहानी</option>
        <option>अन्य</option>
      </select>

      <input
        type="text"
        placeholder="🌸 रस"
        value={ras}
        onChange={(e) => setRas(e.target.value)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "white",
          fontSize: "16px",
          marginBottom: "20px",
          outline: "none"
        }}
      />

      <textarea
        rows="14"
        placeholder="✍️ अपनी रचना यहाँ लिखें..."
        value={poem}
        onChange={(e) => setPoem(e.target.value)}
        style={{
          width: "100%",
          padding: "20px",
          borderRadius: "16px",
          border: "1px solid #475569",
          background: "#1e293b",
          color: "white",
          fontSize: "18px",
          lineHeight: "1.8",
          marginBottom: "25px",
          outline: "none",
          resize: "vertical"
        }}
      />

      <label style={{ fontWeight: "700", color: "#fbbf24" }}>
        🎙️ Audio Recitation
      </label>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setAudio(e.target.files[0]);
          }
        }}
        style={{
          width: "100%",
          marginTop: "10px",
          marginBottom: "35px",
          color: "white"
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "16px",
          background: "#fbbf24",
          color: "#0f172a",
          border: "none",
          borderRadius: "12px",
          fontWeight: "700",
          fontSize: "18px",
          cursor: "pointer",
          transition: "background 0.2s"
        }}
      >
        🚀 प्रकाशित करें
      </button>
    </div>
  );
}

export default UploadPoem;