export default function MenuLoading() {
  return (
    <div className="skel-page">
      <div className="skel skel-hero" />
      <div className="container skel-menu">
        <div className="skel skel-filterbar" />
        <div className="skel-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skel-card">
              <div className="skel skel-img" />
              <div className="skel skel-line w70" />
              <div className="skel skel-line w40" />
              <div className="skel skel-line w90" />
              <div className="skel skel-line w30" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
