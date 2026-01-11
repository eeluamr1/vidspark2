import React, { useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "./api.js";

function Button({ children, ...props }) {
  return (
    <button {...props} style={{
      padding: "10px 14px",
      borderRadius: 12,
      border: "1px solid #ddd",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 700
    }}>
      {children}
    </button>
  );
}
function Input(props){
  return <input {...props} style={{ padding:"10px 12px", borderRadius: 12, border:"1px solid #ddd", width:"100%" }} />
}
function Card({ children }){
  return <div style={{ border:"1px solid #eee", borderRadius: 16, padding: 14, background:"#fff", boxShadow:"0 8px 30px rgba(0,0,0,0.03)" }}>{children}</div>
}

export default function App() {
  const [view, setView] = useState("feed");
  const [feed, setFeed] = useState([]);
  const [q, setQ] = useState("");
  const [watch, setWatch] = useState(null);
  const [err, setErr] = useState("");

  const apiBase = api.apiBase;

  const loggedIn = useMemo(()=> !!getToken(), []);

  async function refreshFeed() {
    const data = await api.feed(q);
    setFeed(data.videos);
  }

  useEffect(() => {
    refreshFeed().catch(e=> setErr(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openWatch(id){
    setView("watch");
    const data = await api.video(id);
    setWatch(data);
  }

  function logout(){
    setToken("");
    window.location.reload();
  }

  return (
    <div style={{ fontFamily: "system-ui, Arial", background:"#fafafa", minHeight:"100vh" }}>
      <div style={{ maxWidth: 980, margin:"0 auto", padding: 16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap: 12, marginBottom: 12 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background:"#111" }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>VidSpark</div>
              <div style={{ color:"#666", fontSize: 12 }}>MVP: مولد فيديو + فيد اجتماعي</div>
            </div>
          </div>
          <div style={{ display:"flex", gap: 8, alignItems:"center" }}>
            <Button onClick={()=> { setView("feed"); refreshFeed().catch(()=>{}); }}>Feed</Button>
            <Button onClick={()=> setView("upload")}>Upload</Button>
            <Button onClick={()=> setView("generate")}>Generate</Button>
            {!!getToken()
              ? <Button onClick={logout}>Logout</Button>
              : <>
                  <Button onClick={()=> setView("login")}>Login</Button>
                  <Button onClick={()=> setView("register")}>Register</Button>
                </>
            }
          </div>
        </div>

        {err ? <div style={{ color:"crimson", marginBottom: 10 }}>{err}</div> : null}

        {view === "feed" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap: 12 }}>
            <Card>
              <div style={{ display:"flex", gap: 10, alignItems:"center" }}>
                <Input placeholder="ابحث عن caption أو hashtag" value={q} onChange={e=> setQ(e.target.value)} />
                <Button onClick={()=> refreshFeed().catch(e=> setErr(e.message))}>Search</Button>
              </div>
            </Card>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
              {feed.map(v => (
                <Card key={v.id}>
                  <div style={{ fontWeight: 800, marginBottom: 6 }}>{v.owner.displayName} <span style={{ color:"#666", fontWeight: 600 }}>@{v.owner.username}</span></div>
                  <div style={{ color:"#333", marginBottom: 8 }}>{v.caption}</div>
                  <video
                    src={v.videoUrl}
                    controls
                    style={{ width:"100%", borderRadius: 12, background:"#000" }}
                  />
                  <div style={{ display:"flex", justifyContent:"space-between", gap: 8, marginTop: 10 }}>
                    <Button onClick={()=> openWatch(v.id).catch(e=> setErr(e.message))}>Watch</Button>
                    <a href={v.videoUrl} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                      <Button>Open</Button>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(v.videoUrl)}`}
                      target="_blank" rel="noreferrer"
                      style={{ textDecoration:"none" }}
                    >
                      <Button>Share</Button>
                    </a>
                  </div>
                  <div style={{ marginTop: 8, color:"#666", fontSize: 12 }}>
                    API base: {apiBase}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {view === "login" && <AuthForm mode="login" onDone={()=> { setView("feed"); refreshFeed().catch(()=>{});} } setErr={setErr} />}
        {view === "register" && <AuthForm mode="register" onDone={()=> { setView("feed"); refreshFeed().catch(()=>{});} } setErr={setErr} />}

        {view === "upload" && <UploadPanel setErr={setErr} onDone={()=> { setView("feed"); refreshFeed().catch(()=>{});} } />}
        {view === "generate" && <GeneratePanel setErr={setErr} onDone={()=> { setView("feed"); refreshFeed().catch(()=>{});} } />}

        {view === "watch" && watch && (
          <Card>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>{watch.video.caption || "Video"}</div>
                <div style={{ color:"#666" }}>by {watch.video.owner.displayName} @{watch.video.owner.username}</div>
              </div>
              <Button onClick={()=> setView("feed")}>Back</Button>
            </div>

            <div style={{ marginTop: 12 }}>
              <video src={watch.video.videoUrl} controls style={{ width:"100%", borderRadius: 12, background:"#000" }} />
            </div>

            <div style={{ display:"flex", gap: 8, marginTop: 12, flexWrap:"wrap" }}>
              <Button onClick={()=> api.like(watch.video.id).then(()=> openWatch(watch.video.id)).catch(e=> setErr(e.message))}>Like</Button>
              <Button onClick={()=> api.unlike(watch.video.id).then(()=> openWatch(watch.video.id)).catch(e=> setErr(e.message))}>Unlike</Button>
              <a href={watch.video.videoUrl} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                <Button>Open</Button>
              </a>
            </div>

            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>Comments</div>
              <CommentBox videoId={watch.video.id} onSent={()=> openWatch(watch.video.id)} setErr={setErr} />
              <div style={{ display:"grid", gap: 10, marginTop: 10 }}>
                {watch.comments.map(c => (
                  <div key={c.id} style={{ border:"1px solid #eee", borderRadius: 12, padding: 10, background:"#fff" }}>
                    <div style={{ fontWeight: 800 }}>{c.user.displayName} <span style={{ color:"#666", fontWeight: 600 }}>@{c.user.username}</span></div>
                    <div>{c.text}</div>
                    <div style={{ color:"#999", fontSize: 12, marginTop: 4 }}>{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        <div style={{ color:"#999", fontSize: 12, marginTop: 18 }}>
          ⚠️ ده MVP تعليمي. قبل الإنتاج: أمان + ترميز + تخزين + CDN + سياسات محتوى.
        </div>
      </div>
    </div>
  );
}

function AuthForm({ mode, onDone, setErr }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function submit() {
    try {
      setErr("");
      const data = mode === "login"
        ? await api.login(username, password)
        : await api.register(username, password, displayName);

      setToken(data.token);
      onDone();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin:"0 auto" }}>
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>
          {mode === "login" ? "Login" : "Register"}
        </div>
        <div style={{ display:"grid", gap: 10 }}>
          <Input placeholder="username" value={username} onChange={e=> setUsername(e.target.value)} />
          {mode === "register" && (
            <Input placeholder="display name" value={displayName} onChange={e=> setDisplayName(e.target.value)} />
          )}
          <Input placeholder="password" type="password" value={password} onChange={e=> setPassword(e.target.value)} />
          <Button onClick={submit}>{mode === "login" ? "Login" : "Create account"}</Button>
        </div>
      </Card>
    </div>
  );
}

function UploadPanel({ setErr, onDone }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");

  async function submit(){
    try{
      if (!getToken()) throw new Error("لازم تعمل Login الأول");
      if (!file) throw new Error("اختار فيديو");
      await api.uploadVideo(file, caption, hashtags);
      onDone();
    } catch(e){
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin:"0 auto" }}>
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>Upload video</div>
        <div style={{ display:"grid", gap: 10 }}>
          <input type="file" accept="video/*" onChange={e=> setFile(e.target.files?.[0] || null)} />
          <Input placeholder="caption" value={caption} onChange={e=> setCaption(e.target.value)} />
          <Input placeholder="hashtags (مثال: #fun,#shorts)" value={hashtags} onChange={e=> setHashtags(e.target.value)} />
          <Button onClick={submit}>Upload</Button>
        </div>
      </Card>
    </div>
  );
}

function GeneratePanel({ setErr, onDone }) {
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [secondsPerImage, setSecondsPerImage] = useState("2");

  async function submit(){
    try{
      if (!getToken()) throw new Error("لازم تعمل Login الأول");
      if (!images.length) throw new Error("اختار صور");
      await api.generate({ images, audio, caption, hashtags, secondsPerImage });
      onDone();
    } catch(e){
      setErr(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin:"0 auto" }}>
      <Card>
        <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 10 }}>Generate video (slideshow)</div>
        <div style={{ display:"grid", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Images</div>
            <input type="file" accept="image/*" multiple onChange={e=> setImages(Array.from(e.target.files || []))} />
          </div>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Audio (optional)</div>
            <input type="file" accept="audio/*" onChange={e=> setAudio(e.target.files?.[0] || null)} />
          </div>
          <Input placeholder="caption" value={caption} onChange={e=> setCaption(e.target.value)} />
          <Input placeholder="hashtags (مثال: #meme,#edit)" value={hashtags} onChange={e=> setHashtags(e.target.value)} />
          <Input placeholder="seconds per image" value={secondsPerImage} onChange={e=> setSecondsPerImage(e.target.value)} />
          <Button onClick={submit}>Generate</Button>
        </div>
      </Card>
    </div>
  );
}

function CommentBox({ videoId, onSent, setErr }){
  const [text, setText] = useState("");
  async function send(){
    try{
      if (!getToken()) throw new Error("لازم تعمل Login الأول");
      if (!text.trim()) return;
      await api.comment(videoId, text.trim());
      setText("");
      onSent();
    } catch(e){
      setErr(e.message);
    }
  }
  return (
    <div style={{ display:"flex", gap: 8 }}>
      <input value={text} onChange={e=> setText(e.target.value)} placeholder="اكتب تعليق..." style={{ flex: 1, padding:"10px 12px", borderRadius: 12, border:"1px solid #ddd" }} />
      <button onClick={send} style={{ padding:"10px 14px", borderRadius: 12, border:"1px solid #ddd", background:"#fff", cursor:"pointer", fontWeight: 800 }}>Send</button>
    </div>
  );
}
