import { Link } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">ADHDAI</Link>
          <div className="nav-links">
            <Link to="/agency" className="nav-link">Agency</Link>
            <Link to="/team" className="nav-link">Who We Are</Link>
          </div>
        </div>
      </nav>
      <div className="landing-container">
        <header className="landing-header">
          <h1 className="landing-title">ADHDAI</h1>
          <p className="landing-tagline">we are the best at the worst</p>
          <p className="landing-description">
            The feral creative collective. Proactive apology campaigns for Fortune 500 companies. We apologize for disasters before they happen.
          </p>
          <Link to="/agency" className="cta-button">
            Enter the Agency
          </Link>
        </header>

        <main className="landing-content">
          <section className="landing-section">
            <h2>Origin</h2>
            <p>
              The agency was not founded. It was assembled. In the back room of a nightclub on Schoenhauser Allee that no longer exists, during a winter that went on too long.
            </p>
            <p>
              Mike Slab had been fired from three insurance investigation firms. Dr. Leon Poole had been expelled from the University of Ljubljana's Department of Applied Semiotics, a department he himself had created, and which the university later denied ever existed. The Copywriting Cell (Vera, Gjon, and Thursday) had been operating as an unlicensed pamphlet collective in a basement in Novi Sad, producing unsigned copy for causes they wouldn't name. Burl Pettigrew had been making pictures for whoever asked, living out of a duffel bag and a darkroom in Friedrichshain that smelled like fixative and regret.
            </p>
            <p>
              Nadya Orlov brought the schedule. She always brings the schedule. She had been running production for a state publishing house that printed almanacs for a country that had recently ceased to be a country. Her five-year plans were legendary. Her cigarettes were worse. She arrived with a clipboard, a photograph of Valentina Tereshkova, and a complete production timeline for an agency that did not yet exist.
            </p>
            <p>
              Delmore Frank Krepps showed up last. He brought hard candies and a risograph. Nobody remembers who invited him. He was just there, explaining things in a warm voice, making pamphlets about pamphlets. He has never left.
            </p>
          </section>

          <section className="landing-section">
            <h2>The Doctrine</h2>
            <p>
              In 1971, the Soviet semiotician Grigori Vashenko published a paper titled "On the Structural Impossibility of Sincerity in State Communication" at a conference in Tartu that was later redacted from all proceedings. The paper argued that all institutional speech is, by its nature, a performance of sincerity rather than sincerity itself. That the apology, the promise, the corporate commitment: these are not acts of honesty. They are <em>choreographies of honesty</em>. And like all choreography, they can be rehearsed.
            </p>
            <p>
              Vashenko's student, Mila Drobnjak, took the theory further during a series of smoke-filled seminars at the University of Sarajevo's now-dissolved Institute for Applied Rhetoric. She proposed the concept of <em>Preventivna Isprika</em> — the Preemptive Apology. If institutional sincerity is always already a performance, she argued, then the performance can precede the event. You can apologize for a disaster before the disaster occurs. The apology creates a rhetorical space in which the institution has already acknowledged its failure, making the actual failure, when it arrives, feel like old news.
            </p>
            <p>
              Drobnjak's work was dismissed. The institute was closed. The university restructured. The country split into several smaller countries, none of which claimed her research.
            </p>
            <p>
              Poole found the papers in a box at a flea market in Belgrade. He read them on a train to Berlin. By the time he arrived, he had a framework.
            </p>
          </section>

          <section className="landing-section">
            <h2>The Fall Guy Economy</h2>
            <p>
              Here is the future as we understand it: every corporation will need a department of preemptive accountability. Not crisis management — that is reactive, embarrassing, and always too late. Not public relations — that is a profession built on the assumption that people believe press releases. No. What is needed is a new discipline. A new role.
            </p>
            <p>
              <strong>The Fall Guy.</strong>
            </p>
            <p>
              Not a scapegoat. Not a spokesperson. The Fall Guy is the person — or the agency — who takes the hit before the hit exists. Who apologizes before the disaster. Who stands before the public and says: <em>we know what's coming, and we're sorry in advance</em>. It is the most honest form of corporate communication ever invented, because it admits the one thing no corporation has ever been willing to say out loud: that they know, right now, today, that they will fail you.
            </p>
            <p>
              ADHDAI is the first agency built entirely around this premise. We are the Fall Guys. We make the apology before the crime. We build the campaign before the crisis. We create the sincerity before the insincerity that necessitates it.
            </p>
            <p>
              We are proactive. We are preemptive. We are, in every meaningful sense, too early.
            </p>
          </section>

          <section className="landing-section">
            <h2>What We Do</h2>
            <p>
              You give us a Fortune 500 company. We analyze their potential doomsday scenarios across four time horizons — one year, five years, ten years, fifty years. Environmental collapse. Regulatory catastrophe. Technological obsolescence. Reputational implosion. The things that keep the C-suite awake but that no one puts in the annual report.
            </p>
            <p>
              Then we build the apology campaign. Full creative. Headlines, taglines, manifestos. Print, out-of-home, video, social, digital. A complete brand campaign disguised as an act of corporate contrition. The kind of work that wins awards — not because it sells anything, but because it finally tells the truth.
            </p>
          </section>

          <section className="landing-section">
            <h2>The Method</h2>
            <p>
              Slab conducts the interrogation. He finds the thing the company won't say about itself. The tension underneath the brand promise.
            </p>
            <p>
              Poole builds the framework. The Poole System. Diagrams, arrows, principles with numbers. He calls it the "architecture of wanting." Most of it is incomprehensible. Some of it is profound. He cannot tell the difference, and neither can we.
            </p>
            <p>
              The Cell writes the copy. Three writers in a room. They argue about ideology, vote on headlines, and produce work that is either brilliant or unhinged. Thursday's option always wins. Nobody knows why.
            </p>
            <p>
              Burl makes the pictures. Ugly-beautiful. Documentary feeling. He calls it "evidence, not advertisement." He has theories about color that take forty minutes to explain and three seconds to see.
            </p>
            <p>
              Nadya makes the schedule. The schedule is the schedule. It does not negotiate. It does not wait. It arrives like a train, and you are either on it or you are not.
            </p>
            <p>
              Delmore translates for the client. He takes everything dangerous and makes it sound safe. Everything confrontational becomes "culturally relevant." He distributes hard candies. He has never lost an account.
            </p>
            <p>
              The Apparatus compiles. It does not create. It does not judge. It assembles. When the work is done, it logs the timestamp and waits for the next brief. It is the most reliable member of the agency. It is also the least alive.
            </p>
          </section>

          <section className="landing-section">
            <h2>Provenance</h2>
            <p>
              The agency operates out of a location that shifts depending on who is telling the story. Slab says it's a converted insurance office. Poole insists it's a former semiotics laboratory. The Cell claims it's an anarchist bookshop that also does light printing. Burl says it doesn't matter what it is — what matters is the light, and the light is bad, which is good, because good light makes bad pictures.
            </p>
            <p>
              Nadya says the location is classified. Delmore says it's wherever the client needs it to be. The Apparatus logs the GPS coordinates but has been instructed not to share them.
            </p>
            <p>
              What is known: the walls are covered in diagrams. There is always coffee. There is always smoke, even though no one admits to smoking. The risograph is always warm. And somewhere, in a drawer that no one opens, there is a copy of Vashenko's original paper, annotated in three languages, with a coffee stain on page seven that Poole insists is "part of the document."
            </p>
          </section>

          <section className="landing-section">
            <h2>Terms</h2>
            <p>
              This is satire. This is research. This is an art project that got out of hand. Any resemblance to actual corporate crisis communications is entirely intentional.
            </p>
            <p>
              We are not responsible for companies that deploy our campaigns before the disasters occur. We are not responsible for disasters that occur on schedule. We are not responsible.
            </p>
            <p>
              That, of course, is the whole point.
            </p>
            <p className="landing-credits">
              Brought to you by <a href="https://www.hottalkllc.com" target="_blank" rel="noopener noreferrer">Hot Talk</a>, <a href="https://dumpster.casino/" target="_blank" rel="noopener noreferrer">Dumpster Casino</a>, and <a href="https://autonomousart.org" target="_blank" rel="noopener noreferrer">Autonomous Art</a>.
            </p>
          </section>
        </main>
        <footer className="landing-footer">
          <div className="footer-container">
            <p>ADHDAI 2025 — The Feral Creative Collective</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
