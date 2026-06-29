import { useState, useEffect, useRef, useCallback } from "react";

interface Result {
  id: number;
  type: "movie" | "tv";
  title: string;
  year: number;
  rating: number;
  posterUrl: string;
}

let debounceTimer: ReturnType<typeof setTimeout>;

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") || "";
    if (q) { setQuery(q); doSearch(q); }
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback((q: string) => {
    clearTimeout(debounceTimer);
    if (!q.trim()) { setResults([]); setLoading(false); setSearched(false); return; }
    setLoading(true);
    debounceTimer = setTimeout(async () => {
      try {
        const lang = localStorage.getItem("netmirror_lang") || "en";
        const langParam = lang !== "en" ? `&lang=${lang}` : "";
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}${langParam}`);
        const data = await res.json();
        setResults(data.items || []);
      } catch { setResults([]); }
      setLoading(false);
      setSearched(true);
    }, 350);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    doSearch(v);
    const params = new URLSearchParams(window.location.search);
    if (v) params.set("q", v); else params.delete("q");
    window.history.replaceState(null, "", params.toString() ? `?${params}` : window.location.pathname);
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: "2rem" }}>
        <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.35)", pointerEvents:"none" }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search movies, shows, anime..."
          style={{
            width: "100%", paddingLeft: 48, paddingRight: query ? 44 : 16,
            paddingTop: 16, paddingBottom: 16,
            borderRadius: 12, border: "2px solid rgba(229,9,20,0.5)",
            background: "rgba(255,255,255,0.04)", color: "#fff",
            fontSize: 17, outline: "none", boxSizing: "border-box" as const,
            fontFamily: "inherit",
          }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.4)", padding:4, display:"flex", alignItems:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {loading && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:16 }}>
          {Array.from({length:10}).map((_,i) => (
            <div key={i}>
              <div style={{ aspectRatio:"2/3", borderRadius:10, background:"rgba(255,255,255,0.06)", animation:"shimmer 1.4s infinite" }} />
              <div style={{ height:13, borderRadius:4, background:"rgba(255,255,255,0.05)", marginTop:8, width:"70%" }} />
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:16 }}>
            {results.length} results for <span style={{ color:"#fff" }}>"{query}"</span>
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:16 }}>
            {results.map(item => (
              <a key={item.id} href={`/detail/?type=${item.type}&id=${item.id}`}
                className="title-card" style={{ display:"block", textDecoration:"none", color:"inherit" }}>
                <div style={{ position:"relative", aspectRatio:"2/3", overflow:"hidden", borderRadius:10 }}>
                  {item.posterUrl && (
                    <img src={item.posterUrl} alt={item.title} loading="lazy" width="180" height="270"
                      style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
                  )}
                  {!item.posterUrl && (
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#1a1a2e,#2d1b69)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:28, fontWeight:800, color:"rgba(255,255,255,0.2)" }}>{item.title.charAt(0)}</span>
                    </div>
                  )}
                  {item.type === "tv" && (
                    <span style={{ position:"absolute", top:6, left:6, fontSize:9, padding:"2px 6px", borderRadius:3, fontWeight:700, background:"#e50914", color:"#fff", textTransform:"uppercase" as const, zIndex:4 }}>SERIES</span>
                  )}
                  {item.rating > 0 && (
                    <span style={{ position:"absolute", top:6, right:6, padding:"2px 6px", borderRadius:4, background:"rgba(0,0,0,0.75)", fontSize:11, fontWeight:600, color:"#f5c518", zIndex:4, display:"flex", alignItems:"center", gap:2 }}>
                      {"★"} {item.rating}
                    </span>
                  )}
                  <div className="card-overlay">
                    <div className="card-overlay-play">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <p className="card-overlay-title">{item.title}</p>
                    <p className="card-overlay-meta">{item.year}{item.rating > 0 ? ` · ★ ${item.rating}` : ""}</p>
                  </div>
                </div>
                <div style={{ padding:"6px 2px" }}>
                  <p style={{ fontSize:13, fontWeight:600, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", margin:0 }}>{item.title}</p>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>{item.year || ""}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {!loading && searched && results.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0" }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color:"rgba(255,255,255,0.2)", margin:"0 auto 16px", display:"block" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <p style={{ fontSize:18, fontWeight:600, color:"#fff", margin:"0 0 8px" }}>No results found</p>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", margin:0 }}>Try a different title or check your spelling</p>
        </div>
      )}

      {!loading && !searched && !query && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(255,255,255,0.25)" }}>
          <p style={{ fontSize:15 }}>Start typing to search 500,000+ movies and shows</p>
        </div>
      )}
    </div>
  );
}
