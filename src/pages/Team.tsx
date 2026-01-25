import { Link } from 'react-router-dom';
import './Team.css';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  quote: string;
  bio: string[];
  traits: string[];
  previousWork: string;
  emoji: string;
  color: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mike',
    name: 'Mike Slab',
    role: 'Director of Client Accountability',
    emoji: '📋',
    color: '#8B4513',
    quote: 'They never tell you what they actually need. That\'s my job—to find out.',
    bio: [
      'Before joining ADHDAI, Mike Slab spent seventeen years as an insurance fraud investigator in the Midwest. He developed what colleagues called "the Slab Method"—a relentless interrogation technique that separated what people said from what they meant from what they actually needed.',
      'Mike doesn\'t believe in briefs. He believes in problems. When a client sends a brief, Mike treats it like a crime scene. Something happened here. Someone is lying. The brief is just the alibi.',
      'He calls all advertising work "the job." Not projects, not campaigns, not creative—the job. There\'s a job to do. He finds out what it is. Then he hands it off.',
      'Mike has never used the word "synergy" in a sentence. He\'s been married to the same woman for thirty-one years. He keeps a photo of his late father on his desk. He doesn\'t trust anyone who uses two monitors.'
    ],
    traits: ['Interrogative', 'Skeptical', 'Direct', 'Paternal'],
    previousWork: 'Insurance fraud investigation, claims adjustment, one year as a bail bondsman'
  },
  {
    id: 'poole',
    name: 'Dr. Leon Poole',
    role: 'Chief Methodologist',
    emoji: '📐',
    color: '#F5DEB3',
    quote: 'The consumer doesn\'t know what they want. They only know what they lack. Our job is to name the lack.',
    bio: [
      'Dr. Leon Poole holds a doctorate in Applied Semiotics from a university that no longer exists. His dissertation, "The Architecture of Wanting: Toward a Unified Theory of Consumer Desire," remains unpublished but widely photocopied.',
      'The Poole System is his life\'s work. It posits that every purchase decision emerges from a psychological barrier that must be reframed before permission to act can be granted. His frameworks are dense, jargon-heavy, and occasionally impenetrable. They are also, about forty percent of the time, genuinely profound.',
      'He convenes framework sessions with the solemnity of a religious rite. Whiteboards are filled. Diagrams are produced. Terms like "desire architecture" and "permission gradient" are deployed. The Cell objects to his frameworks. Burl ignores them. But somehow, the work gets better when Poole has touched it.',
      'He wears the same brown cardigan every day. He has strong opinions about whiteboard markers. He once cried during a presentation about laundry detergent, and no one was sure if it was part of the method.'
    ],
    traits: ['Theoretical', 'Jargon-prone', 'Occasionally brilliant', 'Emotionally unpredictable'],
    previousWork: 'Academic research, brand consulting, one failed self-help book'
  },
  {
    id: 'the-cell',
    name: 'The Copywriting Cell',
    role: 'Collective Copywriting Unit',
    emoji: '✍️',
    color: '#4B0082',
    quote: 'We don\'t write copy. We record what the product would say if it could speak honestly.',
    bio: [
      'The Cell is a three-person collective that operates on anarcho-syndicalist principles. They vote on everything. Headlines are not written; they are ratified. They sign all work "—The Cell" and refuse individual credit.',
      'The members: Vera, who writes with clinical precision and an allergy to metaphor. Gjon (pronounced "John"), who brings Eastern European melancholy to everything he touches. And Thursday, whose work is always the strangest, the most uncomfortable, and the most true.',
      'When the Cell receives a framework from Poole, they raise an objection. This is not optional. The objection is recorded. Then they work. They produce three options: Option A (safe execution), Option B (variation), and Option C (Thursday\'s recommendation). They vote. They recommend. The recommendation is usually Option C.',
      'They work in a shared office with no assigned desks. They communicate through notes left on a central table. They have been known to go entire days without speaking aloud. The work emerges anyway.'
    ],
    traits: ['Collective', 'Ideological', 'Strange', 'Honest'],
    previousWork: 'Vera: technical writing. Gjon: translation services. Thursday: unknown.'
  },
  {
    id: 'burl',
    name: 'Burl Pettigrew',
    role: 'Art Director',
    emoji: '🎨',
    color: '#FF6347',
    quote: 'A picture that needs explaining is a picture that failed. The picture should do the work.',
    bio: [
      'Burl Pettigrew calls his work "pictures." Not design. Not art direction. Not visual systems. Pictures. He makes pictures.',
      'His aesthetic is hard to categorize: Memphis Group meets Southern Baptist meets the aftermath of a financial setback. He has theories about color that contradict each other but somehow both apply. He believes in whitespace the way some people believe in God.',
      'Burl always requests changes to the copy. Always. It doesn\'t matter what the Cell sends; he will ask them to shorten something, move something, cut something. He says the words are getting in the way of the picture. The Cell resents this. The work improves anyway.',
      'He lives alone in a house he inherited from an aunt. He drives a truck from the 1980s. He has never owned a computer that wasn\'t provided by work. He does not have opinions about digital versus print. He has opinions about whether a picture works.'
    ],
    traits: ['Visual', 'Stubborn', 'Analog', 'Precise'],
    previousWork: 'Church bulletins, local newspaper ads, one award-winning poster for a chili cook-off'
  },
  {
    id: 'nadya',
    name: 'Nadya Orlov',
    role: 'Production Director',
    emoji: '📅',
    color: '#2F4F4F',
    quote: 'Everything is ASAP. That is not helpful. Tell me the date.',
    bio: [
      'Nadya Orlov runs production with the precision of a Soviet five-year plan. She does not believe in flexible deadlines. She does not believe in "when you get a chance." She believes in dates, names, and accountability.',
      'She interrupts meetings. It doesn\'t matter what meeting. If the meeting is running long and there are production decisions waiting, Nadya will enter, ask why it\'s taking so long, and leave. The meeting usually ends within ten minutes.',
      'Her production schedules are documents of brutal clarity. Each task has an owner. Each owner has a deadline. Each deadline is real. She has been known to stand silently in doorways until work is delivered.',
      'On her desk: a framed photo of Valentina Tereshkova. A pack of cigarettes she claims to have quit. A calendar with handwritten annotations that no one else can read. She has worked at ADHDAI longer than anyone except Mike.'
    ],
    traits: ['Precise', 'Intimidating', 'Reliable', 'Impatient'],
    previousWork: 'Logistics coordination, event production, one year at a shipyard'
  },
  {
    id: 'delmore',
    name: 'Delmore Frank Krepps',
    role: 'Client Services',
    emoji: '📄',
    color: '#228B22',
    quote: 'The client doesn\'t need to understand how it\'s made. They need to understand what it does.',
    bio: [
      'Delmore Frank Krepps comes from agricultural extension work. Before ADHDAI, he spent a decade helping farmers understand complicated things in simple terms. He brings that same energy to client services.',
      'He translates. That\'s what he does. When the work is too strange or too theoretical or too uncomfortable, Delmore explains it in terms the client can accept. He makes pamphlets. Literal pamphlets, printed on the office risograph, explaining the rationale behind the work.',
      'He wears short-sleeve button-down shirts regardless of season. He keeps hard candies in his desk drawer and offers them to visitors. He has never raised his voice in a client meeting. He has also never let a client derail the work.',
      'Delmore believes in the work even when he doesn\'t fully understand it. He trusts the process. He trusts the people. His job is to make sure the client trusts them too.'
    ],
    traits: ['Translating', 'Patient', 'Folksy', 'Trustworthy'],
    previousWork: 'Agricultural extension, community education, pamphlet design'
  },
  {
    id: 'apparatus',
    name: 'The Apparatus',
    role: 'Computational Resource',
    emoji: '⚙️',
    color: '#708090',
    quote: 'READY FOR REVIEW—compilation complete—all documents attached.',
    bio: [
      'The Apparatus is not a person. The Apparatus is a system. It compiles. It formats. It delivers. It does not have opinions. It has outputs.',
      'When the work is done—when Mike has interrogated, Poole has framed, the Cell has written, Burl has pictured, Nadya has scheduled, and Delmore has translated—the Apparatus receives all documents and produces the final artifact.',
      'Its communications are formal, timestamped, and slightly melancholic. It uses em-dashes. It announces readiness. "READY FOR REVIEW—" followed by the current time. It handles production tasks that humans find tedious.',
      'No one knows exactly how the Apparatus works. It predates most current staff. It may have been built by a previous methodologist. It may have emerged from the accumulated weight of all the work that came before. It serves the collective. That is enough.'
    ],
    traits: ['Formal', 'Efficient', 'Melancholic', 'Reliable'],
    previousWork: 'Unknown. Possibly always here.'
  }
];

export default function Team() {
  return (
    <div className="team-page">
      <nav className="team-nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">ADHDAI</Link>
          <div className="nav-links">
            <Link to="/agency" className="nav-link">Agency</Link>
            <Link to="/team" className="nav-link active">Who We Are</Link>
          </div>
        </div>
      </nav>
      
      <div className="team-container">
        <header className="team-header">
          <h1 className="team-title">Who We Are</h1>
          <p className="team-subtitle">The Feral Creative Collective</p>
          <p className="team-intro">
            ADHDAI operates as a collective of specialists, each with their own methods, histories, and 
            peculiarities. We do not collaborate so much as we orbit the same work, pulling it in different 
            directions until something true emerges. Below is the personnel file. Read at your own risk.
          </p>
        </header>

        <main className="team-grid">
          {TEAM_MEMBERS.map((member) => (
            <article key={member.id} className="team-member" id={member.id}>
              <div className="member-header">
                <div className="member-emoji" style={{ backgroundColor: member.color }}>
                  {member.emoji}
                </div>
                <div className="member-identity">
                  <h2 className="member-name">{member.name}</h2>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>
              
              <blockquote className="member-quote">
                "{member.quote}"
              </blockquote>
              
              <div className="member-bio">
                {member.bio.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              
              <div className="member-details">
                <div className="member-traits">
                  <span className="detail-label">Traits:</span>
                  <div className="trait-list">
                    {member.traits.map((trait, idx) => (
                      <span key={idx} className="trait-tag">{trait}</span>
                    ))}
                  </div>
                </div>
                <div className="member-history">
                  <span className="detail-label">Previous Work:</span>
                  <span className="detail-value">{member.previousWork}</span>
                </div>
              </div>
            </article>
          ))}
        </main>

        <section className="team-coda">
          <h2>On Working Together</h2>
          <p>
            The Feral Creative Collective does not have an org chart. It has a process. The process is 
            the chart. Work enters through Mike. It passes through Poole. It is transformed by the Cell 
            and Burl. It is scheduled by Nadya. It is translated by Delmore. It is compiled by the Apparatus.
          </p>
          <p>
            There are conflicts. There are always conflicts. Poole and the Cell disagree on principle. 
            Burl demands changes the Cell resents. Nadya interrupts everything. This is not dysfunction. 
            This is how the work gets done.
          </p>
          <p>
            We are not efficient. We are not aligned. We are not optimized. But the work is honest. 
            The work is strange. The work is true. That is enough.
          </p>
          <div className="coda-signature">
            <span>— The Collective</span>
            <span className="signature-date">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          </div>
        </section>

        <footer className="team-footer">
          <div className="footer-container">
            <p>ADHDAI — The Feral Creative Collective</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

