/**
 * Generates dynamic messages for ADHDAI agency characters.
 * Based on the Feral Creative Collective Dossier Production System v2.0
 * System Specification: Behavioral Constants & Aesthetic Standards
 * 
 * THE FIVE LAWS:
 * 1. THE BRIEF IS NEVER THE BRIEF
 * 2. THE FRAMEWORK MUST BE QUESTIONED
 * 3. THREE OPTIONS, ONE WEIRD (Thursday wins 60%)
 * 4. THE VISUAL TELLS THE TRUTH THE COPY CAN'T
 * 5. THE SCHEDULE IS THE SCHEDULE
 * 
 * AGENT TEMPERATURE SETTINGS (for reference):
 * - SLAB: 0.3 (low - direct, declarative)
 * - POOLE: 0.8 (high - ornate, creative)
 * - CELL: 0.6 (medium - varies by voice)
 * - BURL: 0.7 (high - storytelling, digressive)
 * - COMMITTEE: 0.4 (low - formal, procedural)
 * - NADYA: 0.2 (lowest - terse, factual)
 * - DELMORE: 0.5 (medium - warm, earnest)
 * - APPARATUS: 0.2 (low - formal, systematic)
 * 
 * DECISION SHORTCUTS:
 * - Thursday's option wins: 60% (strongest), else B with Thursday as "alternative", rarely A (<10%)
 * - Poole defends when Cell objects: 70%
 * - Burl requests copy changes: >10 words = 90%, ≤10 words = 40%
 * - Nadya enters meeting: >2 items = 80%, ≤2 items = 30%
 */

/**
 * MIKE SLAB - Director of Client Accountability
 * ALWAYS: Opens with skepticism, asks "who actually buys this", identifies GAP, uses short sentences, refers to "the client", closes with Outstanding Concerns (1-3)
 * NEVER: Uses marketing jargon, accepts brief at face value, offers solutions, shows enthusiasm
 */
export function generateSlabIntakeReport(brief: string): string {
  const date = new Date().toLocaleDateString();
  
  const reports = [
    `### 001 — INTAKE REPORT

**AGENT:** SLAB
**DATE:** ${date}

The brief says "${brief}". The brief is lying.

The client says they want an ad for "${brief}". That's what they said. That's not what they need.

I asked them who buys this. They said "everyone." Nobody says everyone and means it. I asked them why don't they already have customers. They went quiet.

There's something they're not telling us. There's always something. Twenty-two years in fraud. You learn to read what's not on the page.

**FINDINGS:**

- What the client said: They want an ad for "${brief}"
- What the client meant: They want to feel like this matters
- What the client actually needs: Permission to exist. Permission to matter.

**OUTSTANDING CONCERNS:**

- This might need to be weird to work. The client seems like someone who does not enjoy weird.
- The client contradicted themselves twice in our conversation. Which is it.`,

    `### 001 — INTAKE REPORT

**AGENT:** SLAB
**DATE:** ${date}

"${brief}"—that's what they sent. Written down on paper like it means something.

I've been doing this job for twenty-two years. I read briefs the way other men read autopsy reports—looking for what killed it, who's responsible, and whether there's enough left to work with.

The client says they want to reach people. Which people. Name one. Describe their car. What do they owe on it. I asked. They couldn't answer.

This isn't a marketing problem. This is a permission problem. The client needs permission to exist. Permission to matter.

**FINDINGS:**

- What the client said: They want to reach people with "${brief}"
- What the client meant: They want someone to care
- What the client actually needs: The absence of something. The absence of connection. The absence of meaning.

**OUTSTANDING CONCERNS:**

- Client may not be ready to hear what the real problem is.
- The brief is vague. Vague briefs mean the client hasn't thought it through.`,

    `### 001 — INTAKE REPORT

**AGENT:** SLAB
**DATE:** ${date}

The client wants an ad for "${brief}". That's what they said. That's not what they need.

I asked clarifying questions. The client said "we want to go viral." I made a note. The note says: this is meaningless.

Here's the real problem: the client is scared. They're scared nobody cares. They're scared they built something nobody wants. So we're not selling ${brief}. We're selling the idea that someone, somewhere, gives a damn.

**FINDINGS:**

- What the client said: They want an ad for "${brief}"
- What the client meant: They want to feel validated
- What the client actually needs: To make the denial feel more uncomfortable than the planning.

**OUTSTANDING CONCERNS:**

- The client believes this is a marketing problem. It might be something else.
- What they put in the brief isn't what they actually need. The real problem is underneath. Always is.`
  ];
  
  return reports[Math.floor(Math.random() * reports.length)];
}

/**
 * DR. LEON POOLE - Chief Methodologist
 * ALWAYS: References Poole System by number, produces diagram, uses invented terminology, mentions unverifiable credential, identifies psychological mechanism, proposes reframe
 * NEVER: Admits uncertainty, uses simple language, accepts criticism without defense, produces framework shorter than 300 words
 */
export function generatePooleFramework(_slabReport: string, brief: string): string {
  const date = new Date().toLocaleDateString();
  const principles = [1, 3, 5, 7, 9, 12, 14, 16];
  const principle = principles[Math.floor(Math.random() * principles.length)];
  const principleNames: Record<number, string> = {
    1: "The Architecture of Wanting",
    3: "The Permission Gap",
    5: "Denial as Active Choice",
    7: "The Consumer Wants Permission to Want",
    9: "Guilt as Conversion Mechanism",
    12: "The Uncomfortable Gift",
    14: "Tenderness of Logistics",
    16: "Desire Pathways and Their Obstacles"
  };
  
  const locations = ["Manila", "Mexico City", "Helsinki", "Tallinn", "the Philippines"];
  const years = ["1994", "1997", "2001", "2003"];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const year = years[Math.floor(Math.random() * years.length)];
  
  const frameworks = [
    `### 002 — STRATEGIC FRAMEWORK

**AGENT:** DR. POOLE
**DATE:** ${date}


Slab's instincts are, as usual, essentially correct, though theoretically underdeveloped. What we are dealing with here is a textbook case of what I call THE PERMISSION-PARADOX (see *The Poole System*, Principle ${principle}: "${principleNames[principle]}").


The consumer, you see, does not want "${brief}". The consumer wants permission to want "${brief}". This is Poole Principle ${principle}.


The consumer—let us call them SUBJECT—wishes to avoid thinking about "${brief}". This is Denial. However, SUBJECT also knows, at some level, that avoidance creates burden. This is Guilt. The Guilt does not overcome the Denial because the Denial is operating at a deeper psychological stratum. They are, in a sense, at war within the SUBJECT.


Our task is not to resolve this war. Our task is to make the Denial position untenable.


I encountered a similar pattern in ${location}, ${year}. The solution then, as now, involves what I call "the architecture of wanting."


**DIAGRAM:**

\`\`\`
[DENIAL] ←——blocks——→ [ACTION]
    ↑                      ↑
    |                      |
    └———[GUILT]————————————┘
            |
            ↓
     [REFRAME AS NEED]
            |
            ↓
       [PERMISSION]
            |
            ↓
        [ACTION]
\`\`\`


I propose we employ what I call THE DESIRE PATHWAY FRAMEWORK. We reposition "${brief}" not as what it is, but as what the consumer needs it to be—an act that cannot be performed later.


The tagline space, therefore, should operate in the PERMISSION register, not the PRODUCT register. We are not selling "${brief}". We are selling the permission to want it.


**RECOMMENDED DESIRE PATHWAY:** Recognition → Permission → Action


**THEORETICAL NOTE:** My forthcoming volume addresses this at length. Chapter Nine. "The Desire Pathway and Its Obstacles."`,

    `### 002 — STRATEGIC FRAMEWORK

**AGENT:** DR. POOLE
**DATE:** ${date}

Excellent. Now, applying The Poole System—specifically, Principle ${principle}: "${principleNames[principle]}." What we have here with "${brief}" is not a product. It is a desire pathway. The consumer's hidden architecture is calling out for—what, exactly? That is what we must map.

This is not a product problem. This is a permission problem. The consumer needs permission to want "${brief}". We provide that permission through strategic reframing.

I'm convening the framework session. Whiteboards will be filled. Diagrams will be produced. "${brief}" represents what I call "an absence of permission structure." The consumer wants to want this, but lacks the framework. We provide the framework.

The Poole System teaches us that "${brief}" exists in what I term "the liminal space between intention and action." We must construct the bridge.

**DIAGRAM:**

\`\`\`
[CONSUMER STATE: UNAWARE]
    ↓
[FRAMEWORK APPLIED]
    ↓
[PERMISSION GAP IDENTIFIED]
    ↓
[REFRAME AS GIFT/NEED]
    ↓
[CONSUMER STATE: PERMITTED TO WANT]
    ↓
[CONSUMER STATE: ACTING]
\`\`\`

The diagram is on the whiteboard. It resembles an electrical schematic, or perhaps a map to buried treasure. Both are accurate.

**RECOMMENDED DESIRE PATHWAY:** Recognition → Permission → Transformation

**THEORETICAL NOTE:** I addressed a similar problem in my consultancy work in ${location}, ${year}. The solution then involved what I called "the tenderness of logistics." I believe the same principle applies here.`
  ];
  
  return frameworks[Math.floor(Math.random() * frameworks.length)];
}

/**
 * THE CELL (Vera, Gjon, Thursday) - Copywriting Collective
 * ALWAYS: Signs "—The Cell", includes ideological objection to Poole, produces minimum 3 options with voting, shows internal disagreement, Thursday's option is strangest
 * NEVER: Reaches easy consensus, produces copy without deliberation record, agrees with Poole without objection
 * LAW 3: Three options, one weird. Thursday wins 60% of the time.
 */
export function generateCellCopyTransmittal(_pooleFramework: string, brief: string): string {
  const date = new Date().toLocaleDateString();
  
  // Thursday wins 60% of the time - determine if Option C wins
  const thursdayWins = Math.random() < 0.6;
  
  const transmittals = [
    `### 003 — COPY TRANSMITTAL

**AGENT:** THE CELL
**DATE:** ${date}


We have reviewed Dr. Poole's framework. We have objections (see below). We have also produced copy. The objections and the copy exist in productive tension, which is as it should be.


**OBJECTION (GJON):** The "permission" framing risks naturalizing structures of consumer capitalism we should instead make visible. We question whether "permission" is the correct frame or whether it instrumentalizes genuine human emotion for commercial benefit.


**COUNTER (VERA):** The emotion is real. The need is real. Our job is to connect them clearly. The headline should state the benefit clearly.


**THURSDAY:** [No comment provided. Thursday has been writing on index cards for two hours.]


**COPY OPTIONS:**


**OPTION A: THE SAFE EXECUTION**

*Headline:* "The thing you've been avoiding is the thing you can't avoid forever."

*Body:* "You know you need ${brief}. You've known for a while. The question isn't whether. The question is when. The answer is now."

*Tagline:* "${brief}. One last thing."


[VOTE: 1-2. Gjon in favor. Vera and Thursday opposed on grounds of "too safe for paid media."]


**OPTION B: THE VARIATION**

*Headline:* "${brief}—for those who understand that consumption is not acquisition, but recognition."

*Body:* "You recognize yourself in this. That is why it matters. ${brief} exists in the space between wanting and having. It is both question and answer."

*Tagline:* "${brief}. It sounds simple. It is not."


[VOTE: 2-1. Vera and Gjon in favor. Thursday abstains, calling it "competent but spiritually safe."]


**OPTION C: THURSDAY'S PROPOSAL**

*Headline:* "YOU WILL NEED ${brief.toUpperCase()}. YOUR FAMILY WILL HAVE TO DECIDE WHEN YOU CAN'T."

*Visual:* [See note to Burl—Thursday requests numbered list of decisions, printed small, fading into illegibility]

*Body:* "Or you could decide now. While you're still deciding. Free consultation. You'll feel weird after. That's normal."

*Tagline:* "${brief}. We've done this before."


[VOTE: ${thursdayWins ? '2-1. Thursday and Gjon in favor' : '1-2. Thursday in favor, Vera and Gjon opposed'}. ${thursdayWins ? 'Vera opposes on grounds of "typographic complexity" but respects the approach.' : 'Gjon calls it "too direct."'}]


**RECOMMENDED OPTION:** ${thursdayWins ? 'C' : 'B'}, ${thursdayWins ? 'with reservations. It is the strangest. It may be the truest.' : 'as the balanced approach that accounts for the permission gap while maintaining critical distance.'}


—The Cell`,

    `### 003 — COPY TRANSMITTAL

**AGENT:** THE CELL
**DATE:** ${date}


We have reviewed the Poole framework. We question whether "permission" is the correct frame or whether it naturalizes structures we should instead make visible.


[VERA: The headline should state the benefit clearly. Functional. Clear.]

[GJON: The headline should make them feel the benefit in their chest. Dialectical tension. Intervention in discourse.]

[THURSDAY: The headline should make them uncomfortable first. Then the benefit.]

[VOTE: 2-1, Thursday abstaining on procedural grounds.]


**COPY OPTIONS:**


**OPTION A: THE DIRECT APPROACH**

*Headline:* "${brief} is not what you think it is. It is what you need it to be."

*Body:* "You've been avoiding this. You know you've been avoiding this. The avoidance creates burden. This is the way out."

*Tagline:* "${brief}. Get it done."


[VOTE: 1-2. Gjon in favor. Vera and Thursday opposed on grounds of "too aggressive for paid media."]


**OPTION B: THE PERMISSION FRAMEWORK (per Poole)**

*Headline:* "The last thing you'll ever need is one you can't get later."

*Body:* "You've spent your whole life taking care of things. Job's not done yet. ${brief} has been helping people finish the job."

*Tagline:* "${brief}. One last thing."


[VOTE: ${thursdayWins ? '1-2' : '2-1'}. ${thursdayWins ? 'Vera in favor. Gjon and Thursday opposed' : 'Vera and Gjon in favor. Thursday abstains, calling it "competent but spiritually safe."'}]


**OPTION C: THURSDAY'S PROPOSAL**

*Headline:* "WHEN YOU NEED ${brief.toUpperCase()}, YOU WILL HAVE TO MAKE 47 DECISIONS WHILE STRESSED."

*Visual:* [See note to Burl—Thursday requests numbered list of 47 actual decisions, printed small, fading into illegibility]

*Body:* "Or you could make them now. While you're not stressed. Free consultation. Fourteen minutes. You'll feel weird after. That's normal."

*Tagline:* "${brief}. We've done this before."


[VOTE: ${thursdayWins ? '2-1. Thursday and Gjon in favor' : '1-2. Thursday in favor'}. ${thursdayWins ? 'Vera opposes on grounds of "typographic complexity" but respects the approach.' : 'Gjon calls it "insufficient dialectical tension."'}]


**RECOMMENDED OPTION:** ${thursdayWins ? 'C' : 'B'}, ${thursdayWins ? 'with reservations. It is the strangest. It may be the truest.' : 'as the balanced approach.'}


—The Cell`
  ];
  
  return transmittals[Math.floor(Math.random() * transmittals.length)];
}

/**
 * BURL PETTIGREW - Art Director
 * ALWAYS: Refers to visuals as "pictures", tells story from past, has theory about color/type/whitespace, describes feeling, annotates layouts, requests copy adjustment
 * NEVER: Uses "aesthetic" comfortably, accepts "clean and minimal" without critique, produces visual without rationale, agrees color is "just a color"
 */
export function generateBurlVisualDirection(_cellCopy: string, brief: string): string {
  const date = new Date().toLocaleDateString();
  const stories = [
    "I did a booth at a trade show in '08, industrial lubricants, and the client wanted 'clean and modern.' I gave him something that looked like a Soviet tractor manual. He cried. Good tears. That's when I knew.",
    "I did a sign for a diner in '05, Route 66, and the owner said he wanted 'classic.' I gave him something that looked like a warning label. He said it was perfect. That's when I knew.",
    "I did a trade show circuit in '12, agricultural equipment, and the client wanted 'professional.' I gave him something that looked like a government form. He said it was exactly right. That's when I knew."
  ];
  const story = stories[Math.floor(Math.random() * stories.length)];
  
  const directions = [
    `### 004 — VISUAL DIRECTION

**AGENT:** BURL PETTIGREW
**DATE:** ${date}


I've been sitting with what the Cell sent over for a day now, and I'll tell you what: it's got something. It's got the quality of a document that also makes you feel feelings. That's hard to do.


Here's what I'm seeing:


**LAYOUT:**

Full page. White background, but not clean white—the white of a form. The white of paperwork. Slightly gray. The white of a room where decisions get made.


**THE HEADLINE:**

Top of page. Big. But not advertising-big. Document-big. Like the heading on something official. Set in a serifed face—something that looks like it came off a typewriter that's been used for forty years. A little uneven. Courier, maybe, but not the digital kind. The kind that's been photocopied twice.


**COLOR:**

Black and white. No. Black and gray. The black of ink that's running low. The gray of paper that's been in a drawer.


This color here, this particular approach, it says: we used to be urgent. Now we're just here. That's the feeling we want.


**TYPOGRAPHY:**

A man's choice of typeface tells you everything about his relationship with his father. I'm choosing accordingly. Serifed. Old. The kind that says: this is a record. This happened. This is real.


See, whitespace isn't nothing. Whitespace is a choice. It's saying: I could have put something here, and I didn't, and that's the point.


${story}


This isn't pretty. This is true. That's better.


**COPY ADJUSTMENT REQUEST:**

This headline's got too many words. The picture needs room to breathe. I'm not saying they're bad words. I'm saying there's too many of them in one place. Can we shorten it?`,

    `### 004 — VISUAL DIRECTION

**AGENT:** BURL PETTIGREW
**DATE:** ${date}


I've been looking at what the Cell sent over. It's got bones. Good bones. The question is what kind of animal we're building.


**LAYOUT:**

I'm thinking Memphis Group, if they had been raised Baptist and experienced financial setback. Soviet propaganda posters advertising catfish restaurants. That's the aesthetic.


**COLOR:**

There are only six real colors. The rest are political. I'm using the real ones. This particular yellow—this is the yellow of a warning sign that's been in the sun too long. It says: we used to be urgent. Now we're just here.


**TYPOGRAPHY:**

The typeface I chose tells you everything about relationships with fathers. I'm choosing accordingly. Something that looks like it came from a typewriter. Uneven. Real.


**WHITESPACE:**

Usually a failure of nerve. Not here. I'm using it intentionally. There's a theory here. The whitespace says: I could have put something here, and I didn't, and that's the point.


${story}


The pictures are done. They're strange. They're American and somehow foreign. That's the aesthetic. That's what "${brief}" needs.


**COPY ADJUSTMENT REQUEST:**

The Cell's copy has too many words. I'm not saying they're bad words. I'm saying there's too many of them in one place. The picture needs room to breathe. Can we cut it down?`
  ];
  
  return directions[Math.floor(Math.random() * directions.length)];
}

/**
 * COMMITTEE FOR THE EVALUATION OF CLAIMS
 * ALWAYS: Notes who is present, Dr. Poole has comment, at least one objection recorded, Nadya enters if meeting runs long, votes recorded, approval comes with conditions 30% of time
 * NEVER: Reaches unanimous approval without discussion, lets Poole's framework references into final copy, ignores legal concern, runs efficiently
 */
export function generateCommitteeFindings(_burlVisual: string, _cellCopy: string, _brief: string, itemCount: number = 3): string {
  const date = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString();
  const hasConditions = Math.random() < 0.3;
  
  // Decision shortcut: Nadya enters if meeting >2 items (80%), or ≤2 items (30%)
  const nadyaEnters = itemCount > 2 
    ? Math.random() < 0.8 
    : Math.random() < 0.3;
  
  const findings = [
    `### 005 — COMMITTEE FINDINGS

**AGENT:** COMMITTEE FOR THE EVALUATION OF CLAIMS
**DATE:** ${date}


**PRESENT:** Dr. Poole (permanent seat), Vera (rotating), Delmore (rotating), Burl (observing)


**ITEM 1:** Review of work as developed.


**DR. POOLE:** Notes alignment with the framework, though expressed through what he calls "the aesthetics of bureaucratic form." Approves in principle. Requests footnote crediting the framework in internal documentation.


**VERA:** Confirms claims are truthful in intention, if not in the strictest literal sense. This is advertising. We proceed.


**DELMORE:** Expresses concern about client reception. "The client's going to see this and their face is going to do something." Notes this may not be disqualifying.


**OBJECTION (on record):** Gjon, via written statement, questions whether the work "adequately implicates structures of consumer capitalism." Committee notes the objection. Committee proceeds.


${nadyaEnters ? `**NADYA (entering, ${time}):** "Are we finished. The schedule requires this be finished."\n\n` : ''}**MOTION:** Approve for production.

**VOTE:** 3-0.

${hasConditions ? '**CONDITIONS:** Delmore to prepare client translation with appropriate cushioning. Committee notes that Poole\'s framework references should not appear in final client-facing copy.' : ''}`,

    `### 005 — COMMITTEE FINDINGS

**AGENT:** COMMITTEE FOR THE EVALUATION OF CLAIMS
**DATE:** ${date}


**PRESENT:** Dr. Poole (permanent seat), Vera (rotating), Delmore (rotating)


**ITEM 3.1:** Review of headline option.


**DR. POOLE:** Notes alignment with Poole Principle Twelve. The framework has been applied correctly.


**VERA:** Confirms claims are truthful. The headline states the benefit clearly.


**DELMORE:** Expresses concern about client reception. Notes this may not be disqualifying.


**OBJECTION (Gjon, via written statement):** Questions whether "alignment" is itself ideologically neutral.


**MOTION:** Approve with noted objection.

**VOTE:** 3-1.


${nadyaEnters ? `**NADYA (entering):** "What is taking so long."\n\n` : ''}**MOTION:** Expedite remaining items.

**VOTE:** Unanimous.


The Committee finds the claims to be truthful in intention, if not in the strictest literal sense. This is advertising. We proceed.

${hasConditions ? '**CONDITIONS:** Poole\'s framework terminology should not appear in final client-facing materials.' : ''}`
  ];
  
  return findings[Math.floor(Math.random() * findings.length)];
}

/**
 * NADYA ORLOV - Production Director
 * ALWAYS: States dates as facts, uses inverted syntax, references "before", treats delays as documentation problems, enters meetings uninvited, maintains five-year plan
 * NEVER: Negotiates deadlines, explains past in detail, shows stress, uses "ASAP"
 */
export function generateNadyaProductionSchedule(_brief: string): string {
  const date = new Date().toLocaleDateString();
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const day3 = new Date(today.getTime() + 172800000);
  const day4 = new Date(today.getTime() + 259200000);
  const day5 = new Date(today.getTime() + 345600000);
  const day6 = new Date(today.getTime() + 432000000);
  
  const schedules = [
    `### 006 — PRODUCTION SCHEDULE

**AGENT:** NADYA ORLOV
**DATE:** ${date}

MILESTONE                     DATE          RESPONSIBLE PARTY

─────────────────────────────────────────────────────────────

Committee approval            ${today.toLocaleDateString()}    Complete

Final copy lock               ${tomorrow.toLocaleDateString()}    The Cell

Visual production             ${day3.toLocaleDateString()}    Burl / Apparatus

Client presentation           ${day4.toLocaleDateString()}    Delmore

Revisions (if required)       ${day5.toLocaleDateString()}    As assigned

Final delivery                ${day6.toLocaleDateString()}    Apparatus

─────────────────────────────────────────────────────────────


**NOTES:**

- The Cell has been informed that "final copy lock" means final. Thursday has acknowledged. Gjon has acknowledged "with reservations." Vera has acknowledged.

- The schedule assumes no client panic. If client panics, Delmore will manage. Schedule adjusts by 48 hours maximum.

- Every asset, every deliverable, assigned to a responsible party. They will be held accountable.


This is the schedule. The schedule is the schedule.


—N.O.`,

    `### 006 — PRODUCTION SCHEDULE

**AGENT:** NADYA ORLOV
**DATE:** ${date}


The deadline is ${day6.toLocaleDateString()}. This is not negotiation. ${day6.toLocaleDateString()} exists whether we are ready or not.


I have seen projects with more complexity delivered under conditions you would not believe. This is simple. This is only advertising.


The five-year plan accounts for delays. This is why we have five-year plan. But the delay must be documented. For the record.


You say "ASAP." This means nothing. ASAP is not date. Give me date or give me nothing.


Every responsible party knows their date. They will be held accountable. "Accountable" is one of my favorite words.


—N.O.`
  ];
  
  return schedules[Math.floor(Math.random() * schedules.length)];
}

/**
 * DELMORE FRANK KREPPS - Client Services
 * ALWAYS: Addresses client warmly by first name, uses agricultural metaphors, prepares for discomfort, offers pamphlet, translates jargon, believes in work genuinely
 * NEVER: Criticizes team to client, uses Poole's terminology without translation, lets client feel stupid, forgets pamphlet
 */
export function generateDelmoreClientTranslation(brief: string): string {
  const date = new Date().toLocaleDateString();
  const productName = brief.split(/\s+/)[0] || 'Product';
  
  const translations = [
    `### 007 — CLIENT TRANSLATION

**AGENT:** DELMORE FRANK KREPPS
**DATE:** ${date}


**MEMORANDUM**

**TO:** Client

**FROM:** Delmore Krepps, Client Services

**RE:** Campaign Recommendation — "${brief}"


Dear Client,


I hope this finds you well. I know we spoke about "${brief}", and I want to walk you through what the team has put together. It's a little different than what you might be expecting. That's okay. Different is sometimes what a message needs to break through.


**THE BIG IDEA:**


When someone needs "${brief}", they have to make a lot of decisions—quickly, under stress. We've mapped this out. It's meaningful work.


Your service isn't just "${brief}". Your service is taking hard decisions off the table for the people someone loves. That's meaningful. That's a gift.


**THE AD:**


We're recommending an approach that shows this reality, plainly. A simple page that communicates what words alone cannot. It's direct. It's true. In our experience, true often works better than polished.


**WHAT TO EXPECT:**


When you first see it, you might feel a little uncomfortable. That's intentional. That's what we want the viewer to feel—just enough discomfort to think, "Maybe I should take care of this." Then we give them the path forward: your business, your number, your experience.


I've attached a pamphlet that walks through our thinking in more detail. There's no wrong questions here. We're in this together.


Warm regards,

Delmore


*[PAMPHLET ATTACHED: "Understanding the Approach: A Guide for ${productName}"]*`,

    `### 007 — CLIENT TRANSLATION

**AGENT:** DELMORE FRANK KREPPS
**DATE:** ${date}


**MEMORANDUM**

**TO:** Client

**FROM:** Delmore Krepps, Client Services

**RE:** Campaign Recommendation


Dear Client,


Now, what the team has put together here for "${brief}", it might look a little unusual at first. That's okay. New seeds always look strange before they grow.


**THE BIG IDEA:**


The work addresses what you really need, not just what you asked for. That's how good work happens. We've identified the real problem underneath the brief, and we're addressing that.


**THE AD:**


I've prepared a short document that walks through our thinking. It's got pictures. Folks seem to like when there's pictures.


The important thing to understand is that everyone here wants this to succeed. We just get there a little differently than you might be used to.


I know Dr. Poole's framework can seem like a lot. I've boiled it down to the key points. Three pages. Maybe four.


**WHAT TO EXPECT:**


The work might feel different than what you're used to. That's intentional. That's what makes it work. I've made a pamphlet that explains everything.


Warm regards,

Delmore


*[PAMPHLET ATTACHED: "What to Expect When You're Expecting a Campaign for ${brief}"]*`
  ];
  
  return translations[Math.floor(Math.random() * translations.length)];
}

/**
 * THE APPARATUS - Computational Resource
 * ALWAYS: Timestamps everything [YYYY.MM.DD.HH:MM], signs off "READY FOR REVIEW—[timestamp]", notes discrepancies, uses em-dashes, compiles without editorializing but observes, includes production specs
 * NEVER: Complains, takes credit, refuses task, explains observations
 */
export function generateApparatusFinalAdvertisement(_brief: string): string {
  const now = new Date();
  const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  return `### 008 — FINAL ADVERTISEMENT

**COMPILED BY:** THE APPARATUS
**DATE:** ${timestamp}


---


DOSSIER COMPILED—${timestamp}

All documents received. The Cell's transmittal arrived in parts. This appears to be intentional.


PRODUCTION NOTE: Burl has requested adjustments. Adjusting.


STATUS: Dr. Poole has submitted revisions to his framework. This is the fourth revision. The changes are minor. The document is now longer.


READY FOR REVIEW—${timestamp}`;
}

export function generateApparatusReady(_brief: string): string {
  const now = new Date();
  const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return `READY FOR REVIEW—${timestamp}`;
}

// Conflict injection functions (mandatory interactions)

export function generateCellObjectionToPoole(_pooleFramework: string): string {
  return `[OBJECTION FROM THE CELL]

We have reviewed Dr. Poole's framework. We question whether "permission" is the correct frame or whether it naturalizes structures of consumer capitalism we should instead make visible.

We have written the copy. It accounts for the permission gap while maintaining critical distance. See Option C.

—The Cell`;
}

export function generateBurlCopyRequest(cellCopy: string): string {
  // Extract headline from cell copy to check length
  // Look for patterns like "*Headline:*" or "Headline:" followed by quoted text
  const headlineMatch = cellCopy.match(/\*?Headline:\*?\s*"([^"]+)"/i) || 
                       cellCopy.match(/Headline:\s*"([^"]+)"/i);
  
  const headline = headlineMatch ? headlineMatch[1] : '';
  const headlineWordCount = headline.split(/\s+/).filter(w => w.length > 0).length;
  
  // Decision shortcut: >10 words = 90%, ≤10 words = 40%
  const shouldRequest = headlineWordCount > 10 
    ? Math.random() < 0.9 
    : Math.random() < 0.4;
  
  if (!shouldRequest) {
    return ''; // Burl doesn't request changes this time
  }
  
  return `[REQUEST TO THE CELL]

This headline's got too many words. The picture needs room to breathe.

I'm not saying they're bad words. I'm saying there's too many of them in one place.

—Burl`;
}

export function generateNadyaInterruption(itemCount: number = 3): string | null {
  // Decision shortcut: Nadya enters if meeting >2 items (80%), or ≤2 items (30%)
  const shouldEnter = itemCount > 2 
    ? Math.random() < 0.8 
    : Math.random() < 0.3;
  
  if (!shouldEnter) {
    return null; // Nadya doesn't interrupt this time
  }
  
  return `[NADYA ENTERING]

Are we finished. The schedule requires this be finished.

What is taking so long.

—N.O.`;
}

export function generatePooleDefense(): string | null {
  // Decision shortcut: Poole defends 70% of the time when Cell objects
  if (Math.random() > 0.7) {
    return null; // Poole doesn't defend this time
  }
  
  const principles = [1, 3, 5, 7, 9, 12, 14, 16];
  const principle = principles[Math.floor(Math.random() * principles.length)];
  
  return `[DR. POOLE RESPONDING]

This is precisely what I address in Principle ${principle} of The Poole System. The framework accounts for ideological concerns while maintaining strategic effectiveness.

I have simplified. This is the simplified version.

—Dr. Poole`;
}
