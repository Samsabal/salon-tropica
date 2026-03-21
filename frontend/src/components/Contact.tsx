export function Contact() {
  return (
    <section
      id="contact"
      className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-8"
    >
      <div>
        <h2 className="text-2xl font-bold mb-3">Contact en reservering</h2>
        <ul className="space-y-2 text-slate-300 text-sm">
          <li>
            <span className="font-semibold text-slate-100">Telefoon:</span>{" "}
            010-4652541 / 06-36292282
          </li>
          <li>
            <span className="font-semibold text-slate-100">E-mail:</span>{" "}
            salon.tropica@gmail.com
          </li>
          <li>
            <span className="font-semibold text-slate-100">Adres:</span>{" "}
            Noordmolenstraat 84, Rotterdam
          </li>
        </ul>
        <p className="mt-4 text-slate-400 text-sm">
          Bel of mail ons voor meer informatie of reserveringen. Ideaal voor
          vrijgezellenfeesten, bedrijfsuitjes en verjaardagen.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-slate-300 text-sm">
          (Later kun je hier een echt reserveringsformulier maken met
          bijvoorbeeld Netlify Forms of een externe tool.)
        </p>
      </div>
    </section>
  );
}
