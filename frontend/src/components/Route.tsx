export function Route() {
  return (
    <section id="route" className="max-w-5xl mx-auto px-4 py-12 space-y-4">
      <h2 className="text-2xl font-bold">ROUTEBESCHRIJVING</h2>
      <p className="text-slate-300">
        Adres: Noordmolenstraat 84, Rotterdam.
      </p>
      <div className="rounded-xl overflow-hidden border border-slate-800 h-72">
        <iframe
          title="Salon Tropica Google Maps"
          src="https://www.google.com/maps?q=Noordmolenstraat+84,+Rotterdam&output=embed"
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  );
}
