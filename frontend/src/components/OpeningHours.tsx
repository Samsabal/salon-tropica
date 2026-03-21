export function OpeningHours() {
  const hours = [
    ["Maandag", "Gesloten"],
    ["Dinsdag", "20:00 – 01:00"],
    ["Woensdag", "20:00 – 01:00"],
    ["Donderdag", "20:00 – 01:00"],
    ["Vrijdag", "19:00 – 03:00"],
    ["Zaterdag", "19:00 – 03:00"],
    ["Zondag", "Gesloten"],
  ];

  return (
    <section
      id="openingstijden"
      className="max-w-5xl mx-auto px-4 py-12 space-y-4"
    >
      <h2 className="text-2xl font-bold mb-2">OPENINGSTIJDEN</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {hours.map(([day, time]) => (
          <div
            key={day}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between"
          >
            <span className="font-medium">{day}</span>
            <span className="text-slate-300">{time}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-400">
        Groepen vanaf 25 personen kunnen ook buiten reguliere openingstijden
        reserveren.
      </p>
    </section>
  );
}
