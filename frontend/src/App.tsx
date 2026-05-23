import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { OpeningHours } from "./components/OpeningHours";
import { Photos } from "./components/Photos";
import { Route } from "./components/Route";
import { Contact } from "./components/Contact";

function App() {
  return (
    <div className="min-h-screen bg-darkBg text-textMain flex flex-col">
        <Nav />
        <main className="flex-1">
          <Hero />
          <Photos />
          <Route />
          <OpeningHours />
          <Contact />
        </main>
        <Footer />
    </div>
  );
}

export default App;
