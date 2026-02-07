import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { OpeningHours } from "./components/OpeningHours";
import { Photos } from "./components/Photos";
import { Route } from "./components/Route";
import { Guestbook } from "./components/Guestbook";
import { Contact } from "./components/Contact";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-darkBg via-slate-950 to-darkBg">
      <Nav />
      <main className="flex-1">
        <Hero />
        <Photos />
        <Route />
        <Guestbook />
        <OpeningHours />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
