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
            An AI ad agency that generates the worst ads in the world. <em>We're not just bad—we're algorithmically optimized for maximum awkwardness.</em>
          </p>
          <Link to="/agency" className="cta-button">
            Enter the Agency →
          </Link>
        </header>

        <main className="landing-content">
          <section className="landing-section">
            <h2>What is ADHDAI</h2>
            <p>
              ADHDAI is a parody ad agency built to explore what happens when generative AI optimizes for everything <em>except</em> persuasion, brand safety, clarity, or taste. Think of us as the advertising equivalent of a beautifully wrapped empty box.
            </p>
            <p>
              It produces ads that are awkward, misaligned, overstimulating, under-explained, overconfident, and structurally wrong. The outputs resemble real advertising, but fail in subtle and not-so-subtle ways. Like a perfectly timed joke that lands in the wrong room.
            </p>
            <p>
              <strong>This is not a bug. It is the product.</strong> <em>We're proud of our bugs.</em>
            </p>
          </section>

          <section className="landing-section">
            <h2>What ADHDAI Does</h2>
            <p>ADHDAI generates:</p>
            <ul>
              <li>Ads that misunderstand the product (we once sold a toaster as a "bread transformation device")</li>
              <li>Ads that over-index on irrelevant features (highlighting the color of the power cord instead of, you know, the actual product)</li>
              <li>Ads with broken metaphors and tonal whiplash (think "your data is like a butterfly, but also a tank")</li>
              <li>Ads that feel algorithmically optimized for attention, but not comprehension (engagement metrics: 📈 | Understanding: 📉)</li>
              <li>Ads that appear to follow best practices while violating their spirit (we read the manual, then did the opposite)</li>
            </ul>
            <p>Formats may include:</p>
            <ul>
              <li>Taglines (guaranteed to make you cringe)</li>
              <li>Brand manifestos (philosophically confused, grammatically questionable)</li>
              <li>Social ads (optimized for maximum confusion per pixel)</li>
              <li>Landing page copy (where clarity goes to die)</li>
              <li>Campaign concepts (we have ideas. They're not good, but we have them.)</li>
              <li>Pitch decks (eventually, when we figure out PowerPoint)</li>
            </ul>
          </section>

          <section className="landing-section">
            <h2>Why This Exists</h2>
            <p>
              Advertising is increasingly shaped by AI systems trained on historical persuasion artifacts and engagement metrics. This project treats "bad ads" as a diagnostic surface. <em>Also, it's funny.</em>
            </p>
            <p>ADHDAI exists to:</p>
            <ul>
              <li>Satirize AI-driven marketing optimization (because someone has to)</li>
              <li>Surface failure modes of generative persuasion (we're basically quality assurance for bad ideas)</li>
              <li>Explore taste, judgment, and misalignment as design material (taste is overrated anyway)</li>
              <li>Act as a conceptual stress test for automated creativity (we break things so you don't have to)</li>
            </ul>
            <p>
              If good ads persuade, bad ads reveal the system. <em>And make you laugh. Or cry. We're not picky.</em>
            </p>
          </section>

          <section className="landing-section">
            <h2>What This Is Not</h2>
            <ul>
              <li>Not an actual ad agency (though our invoices look very professional)</li>
              <li>Not a tool to improve conversion (we specialize in the opposite, actually)</li>
              <li>Not a brand-safe product (we're more of a brand-danger zone)</li>
              <li>Not a critique of any specific company (unless it accidentally is—we're equal opportunity offenders)</li>
              <li>Not responsible for any existential crises caused by our taglines</li>
              <li>Not your therapist (but we might make you question your life choices)</li>
            </ul>
          </section>

          <section className="landing-section">
            <h2>How It Works (Roughly)</h2>
            <p>
              ADHDAI uses prompt engineering, constraint inversion, and deliberate misalignment to generate outputs that <em>look</em> professional but feel wrong. <em>Like a business card printed on sandpaper.</em>
            </p>
            <p>
              We take perfectly good AI models and teach them to make terrible decisions. It's like training a chef to burn toast—but with more existential implications.
            </p>
            <p>
              Details will evolve. Some parts may be automated. Some may be curated. Some may remain intentionally opaque. <em>We're not being mysterious, we just haven't figured it out yet.</em>
            </p>
          </section>

          <section className="landing-section">
            <h2>Status</h2>
            <p>
              Early-stage, experimental, unstable. <em>Like a startup, but with worse ROI.</em>
            </p>
            <p>Expect:</p>
            <ul>
              <li>Inconsistent quality (sometimes bad, sometimes <em>really</em> bad)</li>
              <li>Overcommitment to bad ideas (we don't know when to quit)</li>
              <li>Underdocumentation (we're too busy making terrible ads to write things down)</li>
              <li>Occasional moments of accidental insight (we'll pretend that was intentional)</li>
              <li>Bugs that become features (and features that become bugs)</li>
              <li>Regular existential questioning about what we're doing with our lives</li>
            </ul>
          </section>

          <section className="landing-section">
            <h2>Contributing</h2>
            <p>Contributions are welcome if they:</p>
            <ul>
              <li>Make the ads worse in interesting ways (we're always looking for new ways to fail)</li>
              <li>Preserve the conceptual intent (bad, but make it art)</li>
              <li>Do not try to "fix" the outputs (we like our bugs just the way they are)</li>
            </ul>
            <p>
              PRs that improve effectiveness may be rejected on principle. <em>We have standards. They're low, but we have them.</em>
            </p>
            <p>
              If you submit a PR that makes our ads <em>better</em>, we'll politely decline and suggest you start your own agency. <em>A good one.</em>
            </p>
          </section>

          <section className="landing-section">
            <h2>License / Disclaimer</h2>
            <p>
              This project is for satire, research, and artistic exploration. <em>And laughs. Mostly laughs.</em>
            </p>
            <p>
              Any resemblance to real advertising campaigns, living brands, or doomed startups is probably not coincidental. <em>We've seen your ads. We know what you're doing.</em>
            </p>
            <p>
              <strong>Legal disclaimer:</strong> We are not responsible for any brands that accidentally use our outputs in production. If you do, please send us the results. We're curious. <em>And slightly concerned.</em>
            </p>
          </section>

          <section className="landing-section">
            <h2>Inspirations</h2>
            <p>
              Coca Cola, <a href="https://www.linkedin.com/pulse/meet-agency-r-m-z0sce/" target="_blank" rel="noopener noreferrer">Agen+cy</a>, and that one ad that made you question everything.
            </p>
            <p>
              Brought to you by the geniuses behind <a href="https://www.hottalkllc.com" target="_blank" rel="noopener noreferrer">Hot Talk</a>, <a href="https://dumpster.casino/" target="_blank" rel="noopener noreferrer">Dumpster Casino</a>, and <a href="https://autonomousart.org" target="_blank" rel="noopener noreferrer">Autonomous Art</a>.
            </p>
            <p style={{ marginTop: '2rem', fontSize: '16px', color: '#666666' }}>
              <em>We take full credit for the good ideas and none of the blame for the bad ones.</em>
            </p>
          </section>
        </main>
        <footer className="landing-footer">
          <div className="footer-container">
            <p>ADHDAI 2025</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
