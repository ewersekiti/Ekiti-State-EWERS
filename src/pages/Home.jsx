import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ReportChannels from "../components/ReportChannels";
import About from "../components/About";
import Partners from "../components/Partners";
import Subscription from "../components/Subscription";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <div className="bg-white text-gray-800 overflow-x-hidden">

      <Navbar />

      <main className="pt-30">

        <section id="home">
          <Hero />
        </section>
        <section id="report">
          <ReportChannels />
        </section>
        <section id="about">
          <About />
        </section>

        <section id="partners">
          <Partners />
        </section>

        <section id="subscription">
          <Subscription />
        </section>

        <section id="faqs">
          <FAQ />
        </section>

      </main>

      <Footer />
    </div>
  );
}
