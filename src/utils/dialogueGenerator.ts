/**
 * Dynamic Dialogue Generator for ADHDAI Agency Characters
 * 
 * PLAYWRIGHT-STYLE BANTER: Each character has a fully differentiated voice.
 * Dialogue is sharp, confrontational, witty — never truncated.
 * Characters DISAGREE. They have GRUDGES. They have HISTORY.
 * 
 * VOICE PROFILES:
 * - MIKE SLAB: Terse. Declarative. Ex-insurance fraud. Distrusts everyone. 
 *   Speaks like Raymond Chandler wrote ad copy. Short sentences that land like punches.
 * 
 * - DR. POOLE: Ornate. Self-aggrandizing. Drops invented terminology like caltrops. 
 *   Speaks in paragraphs. Defensive when challenged. Secretly insecure.
 * 
 * - THE CELL (Vera/Gjon/Thursday): Three distinct voices in constant friction.
 *   Vera: pragmatic, clear, slightly exasperated.
 *   Gjon: confrontational, political, uses words like weapons.
 *   Thursday: silent for long stretches, then drops something devastating.
 * 
 * - BURL PETTIGREW: Storyteller. Digressive. Calls everything "pictures."
 *   Speaks like a man who learned everything from experience, nothing from school.
 * 
 * - NADYA ORLOV: Terse to the point of rudeness. Inverted syntax. 
 *   Soviet-inflected deadpan. Everything is the schedule.
 * 
 * - DELMORE FRANK KREPPS: Warm. Disarming. Uses folksy metaphors to disguise sharp intelligence.
 *   The only person who can translate chaos into something a client will buy.
 * 
 * - THE APPARATUS: Machine-formal. Em-dashes. Timestamps. Observes without editorializing.
 *   Occasionally says something accidentally profound.
 */

import { parseBrief, type ParsedBrief } from './briefParser';

// Cache parsed brief to avoid re-parsing
let cachedBrief: string = '';
let cachedBriefInfo: ParsedBrief | null = null;

function getBriefInfo(brief: string): ParsedBrief {
  if (brief !== cachedBrief || !cachedBriefInfo) {
    cachedBrief = brief;
    cachedBriefInfo = parseBrief(brief);
  }
  return cachedBriefInfo;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== PHASE 1: COLLABORATIVE INTAKE =====

export function getMikeOpening(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product || 'this thing';
  
  const variations = [
    `*lights cigarette, spreads case file on table* Alright everyone, gather round. We got a live one: "${brief}". And before anyone starts — no, Dr. Poole, I don't need a framework. I need five minutes and a functioning bullshit detector.`,
    `*slams folder on desk* Fresh brief. ${product}. I've read it three times and I still don't believe a word of it. The client wrote this like someone filling out a police report — technically accurate, emotionally bankrupt. Let me tell you what they actually meant.`,
    `*stubs out cigarette, pins brief to corkboard* "${brief}" — that's what they sent us. Written in the kind of sanitized corporate language that means someone in a corner office had a panic attack and decided advertising would fix it. It won't. But we might.`,
    `*adjusts reading glasses, scans document with visible disgust* New client. New problem. They say they want an ad for ${product}. What they actually want is for someone — anyone — to tell them they matter. Twenty-two years in fraud taught me to hear what people don't say. And this brief? It's screaming.`,
    `*pours coffee, black, no sugar* Take a look at this. "${brief}." You know what this is? This is a confession disguised as a marketing brief. The client is scared. Scared nobody cares. Scared they built something nobody wants. That fear? That's what we're working with. Not the product. The fear.`,
  ];
  return pickRandom(variations);
}

export function getPooleFirstReaction(brief: string): string {
  const info = getBriefInfo(brief);
  const category = info.category || 'this space';
  
  const variations = [
    `*peers over Mike's shoulder, adjusts glasses with theatrical precision* Fascinating. Mike, your instincts are — as always — correct in the way that a dog is correct when it smells fear. Which is to say: useful, but theoretically unexamined. I see at least three potential perception architectures forming. The ${category} space is layered with what I call "desire topology" — but I suspect you'd prefer I keep that in English. I won't.`,
    `*strokes chin, opens leather journal* Ah, yes. The ${category} space. I mapped this terrain extensively during my consultancy in Helsinki. The consumer psychology here operates on what I term "the permission gradient" — a concept so elegant in its simplicity that even Mike might grasp it. The consumer doesn't want ${category}. The consumer wants permission to want. This is Poole Principle Seven. If anyone has read my forthcoming volume, you'll recognize the framework immediately. No one has read it. That's fine. I'll explain.`,
    `*stands abruptly, uncaps marker* Before Mike drowns us in his trademark pessimism — and it IS a trademark at this point, Mike, you should register it — let me establish the theoretical foundation. What we're dealing with in ${category} is a textbook Permission Gap. The consumer knows what they want. Society tells them they shouldn't want it. Our job is to build the bridge between desire and action. I've done this before. Manila, 2003. The results were... historic.`,
    `*removes glasses, polishes them with maddening deliberation* Interesting. Very interesting. Mike, I appreciate the blood-and-guts approach — truly, it has a certain primitive charm — but what you've identified emotionally, I can systematize strategically. The ${category} consumer is trapped in what my framework calls the "Denial-Guilt Feedback Loop." They want it. They feel bad for wanting it. The guilt reinforces the denial. Our intervention point is precisely here. *taps invisible whiteboard* Here. Right here.`,
  ];
  return pickRandom(variations);
}

export function getCellEntrance(_brief: string): string {
  const variations = [
    `[VERA]: We're listening. We're always listening. [GJON]: *crosses arms* That's a generous description of what Poole just did to the English language. [VERA]: Gjon— [GJON]: I counted seven made-up words. Seven. In four sentences. [THURSDAY]: *stares at wall, pen moving across index card without looking down*`,
    `[GJON]: Another brief, another set of contradictions the client expects us to resolve with a headline. [VERA]: That's literally our job, Gjon. [GJON]: Our job is to tell the truth in a way that sells. Not to dress up capitalism in therapy language. [THURSDAY]: *opens notebook to fresh page, writes single word, closes notebook* [VERA]: What did you write? [THURSDAY]: *shakes head*`,
    `[VERA]: I can work with this. The brief has structure. [GJON]: The brief has structure the way a prison has structure. It confines more than it reveals. [VERA]: Must you— [GJON]: Yes. [THURSDAY]: *taps pen rhythmically on table, seven beats, then silence* [VERA]: Thursday, thoughts? [THURSDAY]: *long pause* ...not yet.`,
    `[GJON]: Let me guess — Poole's going to tell us this is about "permission" and Mike's going to tell us this is about "fear" and they're both going to act like they invented psychology. [VERA]: They're not wrong, though. [GJON]: Being not-wrong and being right are very different things. Ask any war criminal. [THURSDAY]: *slides paper to Vera without looking up — it contains a single drawing of a door that's also a mirror*`,
  ];
  return pickRandom(variations);
}

export function getMikeInsightComment(_brief: string): string {
  const variations = [
    `*taps folder with two fingers* There it is. Right there. Not what they wrote — what they couldn't bring themselves to write. The gap between the first paragraph and the second? That's where the real job lives. That's what we're selling.`,
    `*exhales smoke, stubs out cigarette* Found it. The thing underneath the thing. Twenty-two years of reading people who are lying to themselves, and it always comes down to the same thing: they're afraid of being seen. Afraid of being seen wanting something. Afraid of being seen needing something. We're going to look them in the eye and say: it's okay.`,
    `*circles phrase in brief, underlines it twice* This sentence. This one right here. The client wrote it without knowing what it means. But I know. It means they're losing sleep. It means someone in that company wakes up at 3 AM wondering if any of this matters. That's our headline. Not the product. The 3 AM feeling.`,
    `*leans back, crosses arms* Here's what I know. The brief says one thing. The client means another. And the consumer? The consumer needs something neither of them has figured out yet. That's the gap. That's always the gap. And that gap is where good advertising lives — or dies, depending on whether Poole lets us actually make something instead of diagramming it to death.`,
  ];
  return pickRandom(variations);
}

export function getPooleWatchingMike(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product || 'this';
  
  const variations = [
    `*adjusts glasses, leans in to read Mike's sticky note* Hmm. Crude — I won't pretend otherwise — but there's structural validity here. Mike has identified what I would call the "tension topology" without having the vocabulary to name it. It's like watching a carpenter describe quantum mechanics through woodworking metaphors. Endearing, in its way. The ${product} tension maps directly to Principle Three of my system. I'll formalize this. You're welcome.`,
    `*nods slowly, makes elaborate annotation in margin* Mike's instincts are, as usual, essentially correct — though theoretically underdeveloped. What he calls "the gap" is what I've spent eleven years formalizing as the "Permission-Paradox Interface." He sees the pain. I see the pathway. Together — and I say this generously — we have something. Though I notice he's already moved on to his next cigarette rather than engaging with my framework. Typical.`,
    `*studies Mike's insight with undisguised fascination* Remarkable. This is raw material of the highest order. Now, Mike won't appreciate what I'm about to say — he never does — but what he's identified intuitively, my framework can transform into strategy. The ${product} consumer is caught in what I call the "Wanting Paradox." They want permission to want. Mike found the nerve. I can build the architecture around it. This is how it's supposed to work. Even if Mike will never admit we need each other.`,
    `*takes photograph of Mike's note for his personal archive* For the record: Slab has once again demonstrated that instinct without theory is like a compass without a map. You know which direction to go. You don't know why. That's where the Poole System provides value. Though I suspect if I say "Poole System" one more time, Gjon is going to throw something at me. *glances at Gjon* I can feel him seething from here.`,
  ];
  return pickRandom(variations);
}

export function getBurlEarlyThoughts(brief: string): string {
  const info = getBriefInfo(brief);
  const category = info.category || 'something';
  
  const variations = [
    `*squints at Mike's sticky note, makes frame with fingers* Already got pictures forming. Not the kind Poole wants — all clean and diagrammatic. The kind that make you feel something in your stomach. ${category}, but photographed like a crime scene. Like evidence. Not pretty. True. There's a Dorothea Lange shot from '36 that has this exact weight. I'm going to find that feeling and put it in a rectangle.`,
    `*scratches chin, pulls worn reference book from bag* I can see it. ${category}, but shot like a documentary about people who've given up pretending. Raw light. No filters. Not the Instagram kind of "authentic" — the actual kind, where the subject doesn't know they're being photographed because they're too busy being human. That's the picture. The rest is just typography.`,
    `*stares into middle distance, then at Mike, then back* There's something here. A visual I can't quite name yet, but it's forming. Something unglamorous and necessary. Like the difference between a house that's decorated and a house that's lived in. Poole will want it elegant. Mike will want it honest. I want it to be both, and I know that's impossible, and I'm going to do it anyway.`,
    `*nods slowly, already sketching on napkin* See, here's the thing about ${category} — everyone photographs it wrong. They make it aspirational. Gleaming. Perfect. But that's not how people experience it. They experience it tired, and worried, and human. That's the picture. Not the dream of the thing. The thing itself, with all its fingerprints.`,
  ];
  return pickRandom(variations);
}

export function getCellReactToTension(_brief: string): string {
  const variations = [
    `[GJON]: *reads over Burl's shoulder* That tension Mike identified — I can weaponize that. [VERA]: "Weaponize" is a strong word for a toaster ad, Gjon. [GJON]: Every ad is a weapon. The question is what you're aiming at. [VERA]: You're impossible. [GJON]: I'm precise. There's a difference. [THURSDAY]: *slides paper across table — it says "BOTH" in block letters*`,
    `[VERA]: This is actionable. Clear tension, clear audience. I can write to this. [GJON]: You can write to anything. That's the problem. You're too accommodating. [VERA]: And you're too combative. [GJON]: Combative is how you get to truth. Accommodation is how you get to mediocrity. [THURSDAY]: *writes something on index card, folds it, slides it to center of table without comment*`,
    `[GJON]: The tension is dialectical. Desire versus denial. Classic contradiction that capitalism both creates and exploits. [VERA]: Gjon, we're writing copy, not a manifesto. [GJON]: Every piece of copy IS a manifesto. You just don't read between your own lines. [THURSDAY]: *holds up one finger, long pause* What if the contradiction IS the headline? [VERA]: ...go on. [THURSDAY]: *puts finger down, returns to silence*`,
    `[VERA]: Solid foundation for three options. [GJON]: Solid foundations make boring buildings. I want something that makes the client's lawyer nervous. [VERA]: That's not a creative goal. [GJON]: It's the ONLY creative goal. If legal isn't worried, we haven't said anything worth saying. [THURSDAY]: *staring at fluorescent light for thirty seconds, then* ...the light is also a question. [VERA]: What? [THURSDAY]: *returns to notebook*`,
  ];
  return pickRandom(variations);
}

// ===== PHASE 2: STRATEGIC FRAMEWORK =====

export function getPooleFrameworkIntro(_brief: string): string {
  const variations = [
    `*clears throat with the gravity of a man about to deliver a State of the Union address* If I may — and I'm going to whether you permit it or not — the Poole System demands we map the consumer desire-obstacle matrix before anyone writes a single word. I know Mike is already composing his inevitable sigh. I know Gjon is sharpening whatever ideological objection he's been nursing. But the framework is the framework. Stand back, please. This will require the whiteboard, three markers, and your patience.`,
    `*approaches whiteboard like a general approaching a battle map* Now. Before the Cell begins its customary objection to systematic thinking, and before Mike retreats behind his characteristic anti-intellectualism — which, I should note, is itself an intellectual position he refuses to examine — let me demonstrate why the framework matters. I'm not asking you to love it. I'm asking you to survive it.`,
    `*uncaps three different colored markers with ceremonial precision* Attention, please. What Slab has identified emotionally, I will now systematize strategically. This is not a contradiction — it's a collaboration, whether Mike likes the word or not. The Permission-Paradox Framework will illuminate our path. I developed this during a consultancy in Tallinn that I'm not at liberty to discuss in detail, but suffice to say: the results were extraordinary. As my results tend to be.`,
    `*distributes handouts no one asked for* I've prepared some preliminary diagrams. Eleven pages. Perhaps twelve. Before the collective groan I can already hear forming — these diagrams represent the difference between guessing and knowing. Mike guesses. Beautifully, I'll admit. But I KNOW. And what I know is that the consumer's psychological architecture requires a framework to decode. You don't build a house without blueprints. You don't build a campaign without the Poole System.`,
  ];
  return pickRandom(variations);
}

export function getMikeWatchingPoole(_brief: string): string {
  const variations = [
    `*leans against wall, lights another cigarette* Here we go. Poole's about to turn a perfectly good insight into something that needs a PhD to misunderstand. Five bucks says he mentions Helsinki before the third slide. Any takers?`,
    `*checks watch with theatrical slowness* I gave him the answer in two sentences. He's going to give it back in twenty diagrams and an anecdote about a conference nobody attended. This is the part of the job where I practice my patience. Which is, for the record, not my strongest quality.`,
    `*mutters to Burl without moving lips* How many made-up words this time? I'm setting the over-under at nine. The man has never met a simple truth he couldn't bury under three layers of jargon and a diagram shaped like his own ego.`,
    `*crosses arms, settles in* Alright, everyone get comfortable. Poole's going to explain why water is wet using four theoretical principles and a reference to a paper he wrote that was rejected from three journals. Don't look at me — I tried to stop him. You all saw me try.`,
  ];
  return pickRandom(variations);
}

export function getPooleBarrierComment(_brief: string): string {
  const variations = [
    `*draws arrow with a flourish that suggests he's practiced this in a mirror* The barrier. See how it intersects with Mike's tension point? He found the nerve — I'll give him that — but he couldn't tell you WHY it's a nerve. The "why" is the framework's job. The consumer's defense mechanism operates on three levels: cognitive, emotional, and behavioral. We have to dismantle all three. Not with a sledgehammer — Mike's preferred tool — but with surgical precision.`,
    `*steps back from diagram with visible satisfaction* There. The consumer's defense mechanism, mapped in three dimensions. Denial feeds guilt, guilt feeds denial, and the loop continues until an external force — our campaign — introduces what I call the "Permission Intervention." This is original thinking, by the way. I've submitted a paper. It's under review. The point is: we're not selling a product. We're granting absolution.`,
    `*circles node emphatically, marker squeaking* This is where desire becomes denial. The critical junction. Notice — and I'm speaking primarily to Mike, who I know is mentally composing his grocery list right now — notice how the barrier is INTERNAL. Not external. The consumer doesn't need information. They need permission. This is Principle Seven. This is the key to everything. This is why I exist in this agency.`,
    `*connects two points with dotted line, breathing audibly* The feedback loop. Beautiful in its cruelty. The consumer wants the product. Society tells them they shouldn't prioritize it. The guilt of wanting it reinforces the denial. The denial creates more guilt. Round and round. Our job — and this is where the genius lies, if I may — is to break the loop. Not by removing the guilt. By REFRAMING the guilt as responsibility.`,
  ];
  return pickRandom(variations);
}

export function getCellImpatience(_brief: string): string {
  const variations = [
    `[GJON]: Poole. I have a question. A real one. Not rhetorical. [VERA]: Gjon... [GJON]: When do we stop mapping the architecture of wanting and start actually WANTING something? Because right now, all I see is a man drawing circles on a whiteboard and calling it wisdom. [VERA]: The framework helps us— [GJON]: The framework helps Poole feel important. I've read his book. The unpublished one. It's four hundred pages of saying "people want things." [THURSDAY]: *yawns with devastating precision*`,
    `[VERA]: This is helpful context, Poole. [GJON]: "Helpful context" is what people say when they don't have the courage to say "irrelevant but impressive-sounding." [VERA]: GJON. [GJON]: I'm sorry — was I supposed to sit here and pretend that three circles and an arrow constitute a strategic breakthrough? In what universe? [THURSDAY]: *has already written an entire draft while Poole was talking, but shows it to no one*`,
    `[GJON]: Is this going somewhere, or just... geometrically? Because I've been watching you draw for fifteen minutes and I still don't know what we're selling or who we're selling it to. [VERA]: Let him finish. [GJON]: He never finishes. He just adds another layer. That's his move. Complexity as camouflage. [VERA]: That's unfair. [GJON]: Unfair and accurate are not mutually exclusive. [THURSDAY]: *nods almost imperceptibly*`,
    `[GJON]: Three boxes and an arrow. Revolutionary. *slow clap* And for his next trick, Dr. Poole will explain why rain falls down using a seventeen-slide deck and a reference to his time in Manila. [VERA]: Gjon, that's enough. [GJON]: It's never enough with Poole. That's the problem. Nothing is ever enough. There's always another principle, another framework, another diagram. When do we WRITE? [THURSDAY]: *taps table once — the sound cuts through the room like a gunshot*`,
  ];
  return pickRandom(variations);
}

export function getPooleReframe(_brief: string): string {
  const variations = [
    `*steps back triumphantly, marker hand raised like a conductor finishing a symphony* The reframe. When we pivot the consumer's perception, consumption becomes not just acceptable but INEVITABLE. I know Gjon thinks this is academic theater. I know Mike thinks I could have said this in one sentence. But here's what neither of them understands: the sentence without the framework is a guess. The sentence WITH the framework is a strategy. And strategies win awards. Guesses win nothing.`,
    `*caps marker with the deliberation of a man holstering a weapon* There. The shift in perspective that changes everything. What was threatening becomes inviting. What was guilt becomes responsibility. What was denial becomes... action. And before anyone asks — yes, I've seen this work. Tallinn. Mexico City. A pharmaceutical campaign in 2001 that I'm still not allowed to discuss but that fundamentally changed how an entire country thinks about preventive care. You're welcome, Estonia.`,
    `*turns to face room, removes glasses for emphasis* Don't you see it? We're not changing the product. We're not changing the consumer. We're changing the RELATIONSHIP between the consumer and their own wanting. This is not selling. This is permission-granting. And permission — unlike Mike's cigarettes — actually lasts.`,
    `*gestures at completed diagram with both hands, like a magician revealing the dove* This is what separates strategy from advertising. Anyone can write a clever line. Thursday can do it in her sleep — and frequently does. But a clever line without strategic architecture is a one-night stand. The framework makes it a marriage. The consumer doesn't just buy once. They buy because they believe they SHOULD. And that belief? That's what we just built.`,
  ];
  return pickRandom(variations);
}

export function getBurlOnStrategy(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product || 'this';
  
  const variations = [
    `*nods slowly, like a man watching a sunset he's seen a thousand times but still respects* That reframe — I can see it. One image. Not pretty. Not aspirational. CONFRONTATIONAL. The kind of picture where you look at ${product} and you don't see a product — you see a mirror. No gradients. No soft focus. Something that looks like it was shot on expired film in a government building. That's the aesthetic. Ugly-beautiful.`,
    `*sketches rapidly, pen barely lifting from paper* The visual's coming together. When Poole says "reframe," I hear: one stark image, one honest moment, zero artifice. I'm thinking Dorothea Lange meets Memphis Group. ${product}, but photographed like evidence. Not evidence of a crime — evidence of a truth nobody wants to acknowledge. The picture should make you uncomfortable. Then it should make you buy.`,
    `*stares at Poole's diagram, then at his own hands* All those arrows and boxes... they all point to one picture. I've been seeing it since Mike opened his mouth. ${product}, stripped of everything the client's marketing team has piled on top of it. No lifestyle. No aspiration. Just the thing itself, in hard light, on an honest surface. The kind of picture that says: this is what it is. Take it or leave it. Most people will take it. That's the trick.`,
    `*pulls out worn color chart, holds it next to the whiteboard* The strategy is fancy words for what I already knew: show the real thing. Not the dream of the thing. The REAL thing. But here's what Poole doesn't understand, and never will: you can't systematize a picture. You can't framework your way to an image that makes someone feel something. You have to SEE it. And I see ${product}. I see exactly what it needs to be.`,
  ];
  return pickRandom(variations);
}

// ===== PHASE 3: COPY DEVELOPMENT =====

export function getCellStartWriting(_brief: string): string {
  const variations = [
    `[VERA]: Alright, I'll draft Option A. The responsible one. The one that won't give the client a stroke. [GJON]: *long, theatrical sigh* The one that won't give ANYONE anything, you mean. Safe copy is dead copy, Vera. [VERA]: Safe copy gets approved. Approved copy runs. Running copy pays our salaries. [GJON]: And with that stirring defense of mediocrity— [THURSDAY]: *opens fresh notebook, writes something no one can read, tears out the page, folds it in half*`,
    `[VERA]: Let me establish the baseline. Option A. Clear, functional, won't scare the board of directors. [GJON]: The baseline is capitulation, Vera. Every "safe" headline is another tombstone in the graveyard of ads nobody remembers. [VERA]: The baseline is COMMUNICATION. Which is, I remind you, the entire point. [GJON]: The point is to make someone FEEL something. If they wanted communication, they'd send an email. [THURSDAY]: *already writing something else entirely, oblivious to the argument*`,
    `[GJON]: Here's how this goes. Vera writes something competent. I write something dangerous. Thursday writes something that makes us all uncomfortable. Then we vote, and Thursday wins, because Thursday always wins, because Thursday is the only one of us who actually writes like she's not afraid of the blank page. [VERA]: That's... actually accurate. [GJON]: I know. It's my curse: being right about everything except my own work. [THURSDAY]: *cracks knuckles, begins*`,
    `[VERA]: Option A will be what they expect. Professional, clean, benefit-driven. [GJON]: And Option B will be what they need. Uncomfortable, dialectical, true. [VERA]: And Option C? [GJON]: Option C will be whatever Thursday pulls out of the void she communes with every morning before dawn. As usual. [THURSDAY]: *pauses writing, looks up for the first time* The void says hello. *returns to writing*`,
  ];
  return pickRandom(variations);
}

export function getPooleSupervisesCopy(_brief: string): string {
  const variations = [
    `*hovers behind the Cell's desk with the subtlety of a bear at a campsite* Remember, the reframe must be present in every word choice. The semiotics of permission need to permeate the— [GJON]: Poole, if you say "semiotics" one more time, I will eat this pen. [VERA]: He's being helpful, Gjon. [GJON]: He's being Poole. Which is the opposite of helpful.`,
    `*reads over Vera's shoulder, breathing audibly* Interesting. But does it encode the permission pathway? The lexical choices here need to mirror the desire-obstacle topology I outlined in— [VERA]: Dr. Poole, we've got this. [GJON]: We've HAD this for twenty minutes. Your proximity is not improving the copy. It's improving my blood pressure. In the wrong direction.`,
    `*positions himself uncomfortably close to Thursday's workspace* Each word should carry the weight of the psychological architecture— [THURSDAY]: *stops writing, turns slowly, stares at Poole for six unbroken seconds without blinking* [POOLE]: *backs away* I'll... I'll be over here. If anyone needs theoretical guidance. [GJON]: *under breath* A miracle.`,
    `*makes small noise of approval while reading draft* Yes, the framework is visible in the subtext. Though I have notes. Several notes. About seventeen notes, actually, if we're counting. [VERA]: We're not counting, Dr. Poole. [GJON]: Some space, please. Creativity requires oxygen. Your theoretical emissions are depleting it. [VERA]: GJON. [GJON]: I said what I said.`,
  ];
  return pickRandom(variations);
}

export function getCellToPoole(_brief: string): string {
  const variations = [
    `[GJON]: Poole. Go. Now. Check on Burl. Check on Nadya. Check on your own reflection in the bathroom mirror, which I know you do at least twice an hour. But stop checking on US. [VERA]: What Gjon means is— [GJON]: What Gjon means is exactly what Gjon said. [THURSDAY]: *without looking up* He's right. Go.`,
    `[VERA]: Thank you for the framework, Dr. Poole. Truly. Now let us do what we do. [GJON]: What she's too polite to say is: your hovering is making it worse. Every time you lean over my shoulder, I add a clause. I'm at fourteen clauses and counting. [VERA]: We'll send you a draft. [GJON]: We'll send you a draft of a draft of something that might eventually become a headline if you let us breathe.`,
    `[VERA]: Why don't you check on Burl? He probably needs someone to validate his color theory. [GJON]: Yes. Go validate someone else's work. We're busy invalidating everything you've told us and turning it into something people will actually read. [THURSDAY]: *holds up hand, palm facing Poole, without looking up — universal sign for "stop"*`,
    `[GJON]: The framework is in our heads now. Unfortunately. Like a song you can't stop humming — except instead of a melody, it's seventeen principles and a diagram shaped like Poole's ego. We've absorbed it. Now let us metabolize it into something useful. [VERA]: We've got this. [GJON]: Finally, something Vera and I agree on.`,
  ];
  return pickRandom(variations);
}

export function getCellOptionADone(_brief: string): string {
  const variations = [
    `[VERA]: Option A. Done. Clean, safe, won't make anyone's lawyer twitch. It states the benefit clearly, positions the product honestly, and will be approved by the first person who reads it. [GJON]: Which is exactly the problem. If everyone agrees with it immediately, it means nothing. [VERA]: It means they understand it. [GJON]: Understanding is the lowest bar in advertising, Vera. A parking sign is understood. A warning label is understood. Is that what we aspire to?`,
    `[VERA]: First draft complete. Option A — functional, professional, responsible. The headline that gets us paid but not remembered. [GJON]: A headstone for creativity. "Here lies Option A. It was understood." [VERA]: Not every headline needs to start a revolution, Gjon. [GJON]: Every headline needs to start SOMETHING. Even a mild discomfort. Even a raised eyebrow. If it starts nothing, it IS nothing.`,
    `[VERA]: Option A is solid. It does the job. [GJON]: So does a paper plate. Nobody frames a paper plate. [VERA]: Clients don't frame ads either, Gjon. They run them and they measure ROI. [GJON]: And people wonder why I drink. [THURSDAY]: *slides Vera a note that reads "the safe one is never the right one" in handwriting that looks like it was carved with a knife*`,
    `[VERA]: Done. Option A — conventional but correct. The kind of headline that exists in the exact center of the Venn diagram between "true" and "boring." [GJON]: At least you're honest about it. [VERA]: I'm ALWAYS honest about it. That's my whole thing. I write the truth clearly. You write the truth angrily. Thursday writes the truth sideways. We all have our roles.`,
  ];
  return pickRandom(variations);
}

export function getBurlReadsOptionA(_brief: string): string {
  const variations = [
    `*reads Option A, sets it down gently, like a man lowering a coffin into the ground* I can work with this. But it's missing the thing that makes a picture appear in your head when you read it. Where's the gut punch? Where's the image? I need words that have shadows. This headline doesn't cast a shadow. It's fluorescent light. Evenly distributed and forgettable.`,
    `*squints at copy, tilts head forty-five degrees* Technically correct. Visually? Nothing to photograph here. Give me something to SEE. A headline should be a picture waiting to happen. This one is a PowerPoint slide waiting to happen. Which is fine for a board meeting, but we're not making board meetings. We're making pictures.`,
    `*reads aloud quietly, frowns* The words are fine. Fine like a hotel room is fine. Clean, functional, you forget it the moment you leave. I need words that are STAINED. Words that look like they've been somewhere, done something, come back different. These words? They've never left the office.`,
    `*studies draft with the intensity of a man reading an X-ray* This is the version their last agency wrote. And the one before that. And the one before that. I've been doing this long enough to recognize a headline that wants to be invisible. Where's the thing that makes you uncomfortable? Where's the weight? Where's the picture I can't un-see?`,
  ];
  return pickRandom(variations);
}

export function getCellOptionBDone(_brief: string): string {
  const variations = [
    `[GJON]: Option B. This one has teeth. [VERA]: That's too aggressive. The client will—  [GJON]: The client will FEEL something. Which is more than Option A will ever accomplish in its entire beige existence. Option B challenges assumptions. It makes you argue with it in your head. THAT is advertising. [VERA]: That is a lawsuit waiting to happen. [GJON]: Art and lawsuits share a common ancestor: something worth fighting about.`,
    `[GJON]: Done. Option B — the one that makes people uncomfortable in a way they can't quite articulate. They'll read it and feel accused. Then they'll feel seen. Then they'll buy. [VERA]: That's optimistic. [GJON]: That's DIALECTICAL. The tension between accusation and recognition creates engagement. [VERA]: It creates complaints to the FTC. [GJON]: Six of one.`,
    `[GJON]: Here. Real. Dangerous. The kind of headline that divides a room and starts a conversation that the client's board will still be having six months later. [VERA]: That's a bit much, Gjon. [GJON]: That's EXACTLY enough. If it were any less, it would be Option A. And Option A is what happens when advertising gives up and becomes wallpaper.`,
    `[GJON]: Option B complete. Vera thinks it's confrontational. I think it's honest. And I think confrontation is just honesty without a filter. People don't like honesty because it requires them to change. This headline demands change. [VERA]: Demanding change and inspiring change are different things. [GJON]: One requires courage. The other requires a focus group. I know which one I prefer.`,
  ];
  return pickRandom(variations);
}

export function getMikeWatchingCell(_brief: string): string {
  const variations = [
    `*watches the Cell argue from a safe distance, genuinely amused* I love this part. Like watching a three-person chess game where nobody agrees on the rules. Vera builds the board. Gjon flips the table. Thursday wins by doing something nobody expected. Every time. Every single time. Twenty years and I still don't know how she does it.`,
    `*settles into chair with his coffee* The Cell's fighting again. That's how you know it's working. When they agree, we're in trouble — it means they've compromised, and compromised copy is the worst kind of copy. The best stuff comes out of the wreckage of arguments that Vera and Gjon have been having since before I hired them. Thursday just waits for the dust to settle and then plants a flag.`,
    `*lights cigarette, tips chair back* Watch this. Vera's going to fight for competence. Gjon's going to fight for confrontation. And then Thursday is going to slide a piece of paper across the table that makes them both shut up. It happens every time. It's the most reliable creative process in this agency, and it looks like complete chaos.`,
    `*to Burl, quietly* You know what I've learned in twenty-two years? The best ideas come from people who can't stand each other but respect each other too much to quit. That's the Cell. They don't agree on anything except the work, and even then, they argue about the work until one of them — Thursday, always Thursday — produces something that makes the argument irrelevant.`,
  ];
  return pickRandom(variations);
}

export function getCellThursdayDone(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product?.toUpperCase() || 'PRODUCT';
  
  const variations = [
    `[THURSDAY]: *slides paper across table without looking up, then stands and walks to the window* [VERA]: *picks up paper, reads it twice, mouth slightly open* ...What the— [GJON]: *takes paper from Vera, reads it, goes completely still for three seconds* [VERA]: Thursday, this is... this is unhinged. [GJON]: *very quietly* This is the one. [VERA]: It makes no logical— [GJON]: Logic is the enemy of truth, Vera. This is truth. Raw, bleeding, impossible truth.`,
    `[THURSDAY]: *places card face-down in center of table, pushes it forward with one finger, returns to staring out the window* [VERA]: *flips card, reads* ...Oh. Oh no. [GJON]: *reads it over Vera's shoulder* ...Oh YES. [VERA]: You can't— we can't— the client will never— [GJON]: The client doesn't know what they need. That's why they hired us. And THIS — *holds up card* — this is what they need. Even if it terrifies them. Especially if it terrifies them.`,
    `[THURSDAY]: *taps finished page once with her index finger, like a period at the end of a sentence, then closes her notebook with absolute finality* [VERA]: Let me see that— *reads* ...I don't even know what to say. [GJON]: Don't say anything. Just feel it. [VERA]: I FEEL confused. [GJON]: Confusion is the first symptom of understanding. Thursday, you've done it again. [THURSDAY]: *permits herself the ghost of a smile*`,
    `[THURSDAY]: *presents headline about ${product} that makes everyone in the room stop breathing for a moment* [VERA]: That's... that can't... [GJON]: *slowly, deliberately claps* Yes. YES. This is what advertising should be. Not comfortable. Not safe. Not "on-brand." TRUE. Devastatingly, uncomfortably, irrefutably TRUE. [VERA]: The client will hate it. [GJON]: The client will hate it the way you hate a mirror that's too honest. And then they'll approve it. Because deep down, they know.`,
  ];
  return pickRandom(variations);
}

export function getEveryoneReactsToThursday(_brief: string): string {
  const variations = [
    `*Burl grabs the paper from Gjon's hands* ...That's the one. That's the picture I've been seeing in my head since Mike opened his mouth this morning. THAT'S the photograph.\n*Poole removes glasses entirely, holds them in both hands* I... the framework does not account for this. None of my principles predict this. Yet I cannot argue with it. It's structurally unsound and emotionally perfect. I may need to revise Chapter Nine.\n*Mike stubs out cigarette, nods once* There she is. Thursday's done it again. Every time I think she can't surprise me, she reminds me why I hired someone who communicates primarily in silence.`,
    `*Burl already sketching the visual* This headline makes a picture. I can see the whole campaign. One image. One typeface. This headline. Done. Everything else is decoration.\n*Poole studying intently, mouth slightly open* Fascinating. It violates every principle I've established while somehow honoring the spirit of all of them. This is... this is like finding a mathematical proof that works despite being wrong on paper.\n*Mike satisfied grunt, rare smile* Now we're talking. That's the kind of line that makes someone put down their phone and read it again. Twice.`,
    `*Room goes silent for four full seconds*\n*Burl speaks first* That's the ad. Not the headline. The AD. Everything else — the visual, the layout, the medium — follows from those words.\n*Poole quietly, almost to himself* I'll need to rethink several fundamental assumptions about my own methodology...\n*Mike to the room* That's why we keep Thursday around. That's why we keep ALL of them around. Because once every campaign, one of them writes something that justifies this entire circus.`,
    `*Burl whistles low* That's not a headline. That's a gut punch disguised as a sentence. I've been looking for that picture all day and she wrote it in words. I know exactly what this looks like. I know exactly what color palette. I know the typeface. I know the paper stock. It all came together the moment I read that line.\n*Poole speechless for the first time anyone can remember*\n*Mike grins* Even the professor's impressed. That's how you know it's good — when Poole can't find a framework to put around it.`,
  ];
  return pickRandom(variations);
}

export function getCellVote(_brief: string): string {
  const variations = [
    `[CELL VOTE]: Option C carries. 2-1. [VERA]: I want my objection noted for the record. Option A was safer. [GJON]: Safety is what other agencies sell. We sell truth. Uncomfortable, unmarketable, undeniable truth. [VERA]: You realize the irony of marketing "unmarketable truth," right? [GJON]: I contain multitudes. @burl — make it ugly-beautiful. Make it impossible to look away.`,
    `[CELL VOTE]: Thursday takes it. Again. Statistical probability: 60%. Actual probability: 100%, because Thursday always wins when Thursday tries. [VERA]: How does this keep happening? [GJON]: Because Thursday doesn't write to be approved. She writes to be TRUE. Approval is Vera's department. Truth is Thursday's. [VERA]: *sighs deeply* Fine. I'll polish it. I'll make it sing. But under protest. [GJON]: Your protest is noted, cherished, and overruled.`,
    `[CELL VOTE]: The unsettling option prevails. As it should. As it always does. [VERA]: For the record, I voted for A. [GJON]: For the record, A was a eulogy for ambition. [VERA]: For the RECORD— [GJON]: The record reflects that Thursday produced something none of us could have written individually. That's why we're a Cell, not three freelancers. @burl — visual brief incoming. Make it matter.`,
    `[CELL VOTE]: C wins. 2-1. Vera in principled dissent. [VERA]: It's too aggressive. Too weird. Too Thursday. [GJON]: "Too Thursday" should be the name of our annual award. [VERA]: We don't have an annual award. [GJON]: We should. And Thursday would win it. Every year. Without trying. @burl — you're up. And don't make it pretty. Make it necessary.`,
  ];
  return pickRandom(variations);
}

// ===== PHASE 4: ART DIRECTION =====

export function getBurlStartsDesign(_brief: string): string {
  const variations = [
    `*spreads out swatches, photos, torn magazine pages, a Polaroid from 2009 that he carries everywhere* Alright. Everyone back up. I mean it. Poole, that means you. I need to think in pictures, and thinking in pictures requires silence and the absence of frameworks. Give me space. Give me thirty minutes. Give me the ugliest truth you can find, and I'll make it beautiful.`,
    `*clears entire table with one sweep of his arm, pins Thursday's headline to the center of his workspace* Visuals time. Words people, step back. I've been seeing this image since Mike first opened his mouth, and now Thursday's given it language. My job is to give it a body. A face. A color. The kind of picture that doesn't need a caption because the picture IS the caption.`,
    `*pulls out worn color charts, three different reference books, a postcard from a museum he visited in 1997* The picture's been forming since Mike's first sticky note. When Poole was diagramming, I was already seeing it. When the Cell was arguing, I was already composing the shot. The picture is always there before the words. The words just give me permission to take it.`,
    `*examines Thursday's headline with the intensity of a diamond appraiser* This headline wants something specific. Not pretty. Not clean. Not "on-brand" in the way that marketing departments use that phrase to mean "inoffensive." It wants to be SEEN. In the way that evidence is seen. In the way that a photograph from a war zone is seen — not because it's beautiful, but because it's true.`,
  ];
  return pickRandom(variations);
}

export function getNadyaChecksIn(_brief: string): string {
  const variations = [
    `*appears in doorway without warning, cigarette in one hand, clipboard in the other* Burl. How long for visuals. I do not ask because I am curious. I ask because the schedule demands an answer and the schedule does not negotiate. Minutes, Burl. Give me minutes.`,
    `*materializes behind Burl like a Cold War apparition* Timeline update. Visual development. Duration estimate. Now, please. The five-year plan accounts for your artistic process. But your artistic process does not account for the five-year plan. This is problem.`,
    `*checks watch — she wears two, one on each wrist* Burl. The schedule was created before you were born, and it will outlive you. It does not care about your feelings about color. It cares about dates. Give me a date or give me nothing. Nothing, at least, is honest.`,
    `*lights cigarette, leans against doorframe with the patience of someone who has outlasted regimes* Deadline is not abstract concept, Burl. It is real. Like gravity. Like tax. You may ignore it but it will not ignore you. Status. Now.`,
  ];
  return pickRandom(variations);
}

export function getBurlToNadya(_brief: string): string {
  const variations = [
    `*doesn't look up, keeps working* When it's done, Nadya. Art doesn't punch a clock. You can't schedule a sunrise, and you can't schedule the moment when a picture goes from wrong to right. I'll know it when I see it. And then you'll have your date.`,
    `*mutters without breaking concentration* Nadya, I respect the schedule. I do. But the schedule needs to respect the picture. And the picture right now is telling me it needs another forty-five minutes. Or an hour. Or until I stop feeling like something's missing. Which might be never, but I'll do my best.`,
    `*waves dismissively without looking* You can have it fast, or you can have it good, or you can have it cheap. We've already eliminated cheap. You want fast? I'll give you a stock photo. You want good? Give me time. Choose.`,
    `*grumbles, but fondly — he and Nadya have had this conversation a thousand times* The picture tells me when it's finished. Not the calendar. Not the clock. Not even you, Nadya, and I mean that with the deepest respect for a woman who once coordinated a print run during an actual blackout. Give me one hour. That's all I ask.`,
  ];
  return pickRandom(variations);
}

export function getNadyaResponse(_brief: string): string {
  const variations = [
    `*expressionless* Clock does not care about art, Burl. Clock cares only about time. I give you ninety minutes. After ninety minutes, the schedule becomes creative problem. You do not want schedule to become creative. Schedule is not creative. Schedule is brutal.`,
    `*stubs cigarette on clipboard, which she has done so many times there's a permanent burn mark* Valentina Tereshkova did not wait for inspiration to orbit Earth. She orbited because it was scheduled. You will finish because it is scheduled. Ninety minutes. I will return.`,
    `*unmoved, checks both watches* In Soviet system, this would be considered generous timeline. I am being very American today. Ninety minutes. Use them as you see fit. But use them. Because at minute ninety-one, I return. And I am less patient then than I am now. And I am not patient now.`,
    `*already walking away* Art has until four o'clock. After four o'clock, art becomes my problem. And I solve problems differently than you do, Burl. My solutions involve dates, and accountabilities, and consequences. Your solutions involve feelings. We will see which approach prevails. *pauses at door* It is always mine.`,
  ];
  return pickRandom(variations);
}

export function getBurlColorComment(_brief: string): string {
  const variations = [
    `*pins swatch to wall, steps back, squints, steps forward, pins another* There. That color. It's not pretty. It's the color of a form you fill out when something important happens. The color of paper that's been in a drawer for ten years. The color of truth that's been waiting. People think color is decoration. Color is MOOD. And this mood says: pay attention. Something is about to matter.`,
    `*selects shade definitively, holds it up to the light* This one. The color of a photograph that's been in a wallet for twenty years. Faded but not forgotten. Warm but not comfortable. The kind of color that makes you nostalgic for something you haven't experienced yet. That's the palette. Nothing pretty. Nothing fake. Colors that look like they mean it.`,
    `*adjusts lighting, holds swatch at arm's length* See how that hits? That's not glamour. That's gravity. When I was twenty-three, I did a booth at a trade show — industrial lubricants, of all things — and the client wanted "clean and modern." I gave him something that looked like a Soviet tractor manual crossed with a Baptist hymnal. He cried. GOOD tears. That's the feeling I'm after.`,
    `*nods at final selection with quiet certainty* Nothing about this palette is an accident. Every color tells you what to feel before you read a word. This particular shade of gray? It says: "this is serious." This particular warm white? It says: "but you're safe." The accent — that red-brown — says: "wake up." Together, they say: "something is about to change, and you need to be ready."`,
  ];
  return pickRandom(variations);
}

export function getPooleOnColors(_brief: string): string {
  const variations = [
    `*examines color choices with academic intensity* Interesting. The chromatic tension mirrors the psychological framework. Was this intentional, Burl, or did you arrive at it through your customary blend of instinct and stubbornness? Because either way, it validates Section Nine of my methodology. The hue selection maps precisely to the consumer desire pathway. I'm going to photograph this for my archives. Don't move anything.`,
    `*leans in, genuinely impressed despite himself* These tones... they encode the permission mechanism visually. Remarkable. I've written extensively about the relationship between color temperature and emotional readiness, but I've never seen it implemented with such... such... [GJON, from across the room]: Intuition? [POOLE]: I was going to say "theoretical sophistication," but yes, fine, intuition. The man paints what I theorize. It's infuriating. And wonderful.`,
    `*studies palette with the intensity of a museum curator* Fascinating. The color theory here aligns with Principle Nine in ways that Burl almost certainly didn't intend — and that somehow makes it more valid, not less. The unconscious mind, it seems, has read my work even if Burl hasn't. I should document this case. "Unconscious Framework Application in Visual Practice." It could be a paper. It WILL be a paper.`,
    `*adjusts glasses, nods slowly* The palette creates what I call "chromatic permission" — the visual equivalent of the psychological reframe. The consumer's eye encounters these colors and something shifts, subconsciously, from resistance to receptivity. Burl, I know you'll dismiss this as theoretical nonsense. But you've just proved my entire thesis. In paint swatches. It's the most beautiful thing I've seen all week.`,
  ];
  return pickRandom(variations);
}

export function getBurlToPoole(_brief: string): string {
  const variations = [
    `*shrugs without looking up* I just paint what I see, professor. Don't need a thesis to know what looks right. My eyes have been doing this longer than your framework has existed. But sure — if my colors prove your theory, you're welcome. Just don't put my name in a footnote. I don't want my work to need explaining.`,
    `*keeps working, barely acknowledges* Poole, your charts and my gut get to the same place. Different routes, same destination. You take the highway — well-lit, well-signed, takes forever. I take the back road — dark, unmarked, get there in half the time. The picture doesn't care how you arrived. Only that you arrived.`,
    `*slight smile, the closest Burl gets to warmth* Call it what you want, Dr. Poole. Theory. Framework. Chromatic permission. I call it "seeing what's there." You and I are the same animal speaking different languages. The difference is: my language doesn't need a bibliography.`,
    `*grunts* Art and science meet somewhere, Poole. Maybe we're both standing at that intersection. But I got here by LOOKING. You got here by READING. And I'll take looking over reading every time. No offense. Well — maybe a little offense.`,
  ];
  return pickRandom(variations);
}

export function getCellOnVisuals(_brief: string): string {
  const variations = [
    `[VERA]: The type is strong. Clean lines. It respects the copy. [GJON]: "Respects" the copy? The type should ARGUE with the copy. It should create friction. If the headline says one thing and the visual says the same thing, why do we need both? [THURSDAY]: *looks at layout, nods once — the highest praise she gives* [VERA]: Thursday approves. [GJON]: Thursday approves reluctantly. Which means it's exactly right.`,
    `[GJON]: The ugliness is intentional, yes? [VERA]: Clearly. [GJON]: Good. Because if it were accidental ugliness, I'd be concerned. Intentional ugliness is a creative choice. The kind that makes awards juries feel sophisticated for liking something uncomfortable. [THURSDAY]: *traces the layout with her finger, pauses at the headline, smiles — barely perceptible, but devastating*`,
    `[VERA]: Copy and visual are aligned. [GJON]: Copy and visual are in CONVERSATION. Better. The visual doesn't illustrate the headline — it argues with it. The headline says something. The visual says something slightly different. The consumer is caught in the middle. That's where the sale happens. In the tension between what they read and what they see. [THURSDAY]: *satisfied silence — the kind that fills a room*`,
    `[VERA]: Professional work, Burl. This respects the copy while giving it— [GJON]: Don't damn it with "professional." PROFESSIONAL is what we call work that's good enough to get paid for but not good enough to remember. This is BETTER than professional. This is dangerous. This is the kind of visual that makes the client's marketing director lie awake at night wondering if they've made a terrible mistake. [THURSDAY]: *approving nod* Which means they've made exactly the right decision.`,
  ];
  return pickRandom(variations);
}

export function getBurlKeyVisual(_brief: string): string {
  const variations = [
    `*steps back from layout, removes glasses, rubs eyes* There. That's the picture. It's not pretty. It wasn't supposed to be. It's true, and true is better than pretty every day of the week and twice on Sunday. Don't let anyone soften it. Don't let anyone add a gradient. Don't let anyone put a happy person next to it. The picture is the picture. It needs its teeth.`,
    `*surveys completed board with quiet pride* Done. The kind of image that makes some people uncomfortable and other people feel seen. That's the divide we're working with. The comfortable people will complain. The seen people will buy. Guess which group is bigger? Guess which group matters more? Don't let the client smooth out the edges. The edges ARE the point.`,
    `*nods with the satisfaction of a man who has finished building a house with his hands* Picture's done. Documentary feeling. Shot like evidence, not advertisement. The kind of image that says: this happened. This is real. This matters. Everything else — the logo, the body copy, the legal disclaimer — is just furniture in the room this picture creates.`,
    `*exhales slowly, like releasing a breath held for hours* There's your key visual. It took me thirty years to learn how to make something look this effortless. Effortless on the surface, worked-to-death underneath. Like a Swan. Beautiful above water. Paddling like hell below. That's art direction. That's the job. Now someone hand me a beer.`,
  ];
  return pickRandom(variations);
}

// ===== PHASE 5: PRODUCTION =====

export function getNadyaScheduleAnnouncement(_brief: string): string {
  const variations = [
    `*slams clipboard on table with the authority of someone who has toppled bureaucracies* Schedule time. Everyone, listen. Deadlines are not suggestions. They are not aspirations. They are not "targets." They are LAWS. Written in something harder than stone. Written in time. And time, unlike Poole's theories, does not revise itself.`,
    `*enters room, commands silence with her presence alone* Listen. The five-year plan accounts for everything. Including your excuses. Including Burl's "artistic process." Including Poole's inevitable request for "one more revision." Including Thursday's silence, which, while productive, is not schedulable. Here is the schedule. It is not a request. It is reality.`,
    `*distributes printed timeline with the gravity of someone distributing arrest warrants* Every task. Every owner. Every deadline. Written in ink. Not pencil. Ink. Because pencil implies the possibility of change, and there IS no possibility of change. The schedule exists. Now we exist within it. Questions are permitted. Changes are not.`,
    `*commands attention by simply standing still and staring until everyone stops talking* The schedule does not care about feelings. Only about facts. These are the facts: the deadline is real. The accountabilities are assigned. And I — Nadya Orlov — will enforce them with a precision that makes Swiss trains look slovenly. This is not a threat. This is a calendar entry.`,
  ];
  return pickRandom(variations);
}

export function getMikeOnTimeline(_brief: string): string {
  const variations = [
    `*looks at dates, whistles low* Nadya, these timelines are — and I choose this word carefully — insane. You're assuming everything goes perfectly, nobody gets sick, the client doesn't panic, Poole doesn't demand another revision, and Burl doesn't decide to redo the typography because the serifs offended him spiritually. In twenty-two years, NONE of those things have ever been true simultaneously.`,
    `*studies schedule, raises both eyebrows* We're really gonna do all this in... *counts on fingers* ...forty-eight hours? Nadya, I appreciate the optimism. That IS what this is, right? Optimism? Because from where I'm sitting, it looks like a timeline designed by someone who has never met a creative person.`,
    `*reads dates, looks at Nadya, reads dates again* You're giving us less time than it takes Poole to introduce himself at a conference. And you're expecting finished work? With sign-offs? And assets? Nadya, I respect you. Genuinely. But this schedule would make a German manufacturing plant weep.`,
    `*to Burl, quietly* Did she give us any margin for error? *looks at schedule again* No. No, she did not. She gave us a margin of approximately zero seconds. Which is, I should note, less margin than I get on a pack of cigarettes.`,
  ];
  return pickRandom(variations);
}

export function getNadyaToMike(_brief: string): string {
  const variations = [
    `Valentina Tereshkova orbited Earth in '63. In capsule smaller than this room. With less technology than your telephone. You can make deadline in '26. The schedule has buffer you cannot see. But buffer exists. Like oxygen: invisible, essential.`,
    `In '94, I coordinated print run during actual power outage. In building with no generator. Using candles and a landline. You have electricity. You have computers. You have coffee machine that costs more than car I drove for ten years. You have deadline. Keep them proportional, Mike.`,
    `Every deadline I have set, someone has called impossible. Every deadline has been met. You see the pattern? The pattern is: I am always right about time. Time is the one thing that does not lie, does not negotiate, does not respond to charm. Time is honest. Be like time, Mike.`,
    `If deadline was easy, would not need deadline. Difficult is the point. Difficulty creates focus. Focus creates output. Output creates results. This is not theory — this is physics. Even Poole would agree, if Poole understood physics, which I suspect he does not.`,
  ];
  return pickRandom(variations);
}

export function getNadyaScheduleLocked(_brief: string): string {
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString();
  const variations = [
    `*stubs cigarette with finality* Schedule is law. Shoot: ${tomorrow}. Delivery: forty-eight hours after. No delays. No excuses. No artistic crises, Burl. No framework revisions, Poole. No ideological objections, Gjon. The schedule protects no one who does not protect the schedule. @delmore — client expects smooth translation. Make it smooth.`,
    `*clicks pen definitively* It is done. The schedule exists. Now we exist within it. Every responsible party has been notified. Every date has been committed. The machine is in motion. I suggest you keep up. Because the machine does not slow down. The machine does not stop. The machine only delivers.`,
    `*posts final schedule, steps back with arms crossed* Questions? Good. Because I was not going to answer them anyway. The timeline is locked. The dates are fixed. Like stars. You may wish upon them but you may not move them. @delmore — client meeting in forty-eight hours. Prepare the translation. Include pamphlet.`,
    `*lights fresh cigarette, surveys room* Production phase: active. Everyone knows their date. Everyone knows their responsibility. And everyone knows what happens when deadlines are missed in my agency. *long pause* Nothing dramatic. Just documentation. Thorough, accurate, permanent documentation. Filed where it cannot be unfiled.`,
  ];
  return pickRandom(variations);
}

// ===== PHASE 6: CLIENT TRANSLATION =====

export function getDelmoreStarts(_brief: string): string {
  const variations = [
    `*adjusts collar, distributes hard candies from a bag that seems bottomless* Now, friends, this is where I earn my keep. The work is brilliant — genuinely, truly brilliant — but brilliant and sellable are cousins who don't always get along at family reunions. My job is to introduce them. To make the client think this was their idea all along. Candy?`,
    `*passes candy bowl, smooths notes with farm-boy care* Alright, here's the fun part. Taking something that would give a CMO a panic attack and making it sound like a strategic inevitability. The work doesn't change — not one word, not one pixel. Just the words AROUND it change. The wrapping paper. I'm the wrapping paper guy. And I'm very good at wrapping paper.`,
    `*warm smile, produces pamphlet from seemingly nowhere* The team has created something special. Something that might, on first glance, make the client's face do... a thing. A scared thing. My job is to prevent the face thing. Or at least to reinterpret the face thing as excitement. Which is surprisingly doable when you offer them a candy first. Candy creates trust. Don't ask me why. It just does.`,
    `*pulls out client file, arranges materials with the precision of a man setting a table for a guest he genuinely likes* I've handled trickier sells than this. Once sold a campaign about mortality to a life insurance company that explicitly asked for "upbeat and forward-looking." The trick is: I didn't lie. I just rearranged the truth until it felt like optimism. Same content. Different sequence. Different feeling. That's translation.`,
  ];
  return pickRandom(variations);
}

export function getMikeWatchingDelmore(_brief: string): string {
  const variations = [
    `*accepts candy, settles back to watch* This is the real magic trick. Same idea, completely different energy. Watch how many times he says "authentic." Clients can't resist that word. It's like a hypnotic trigger for marketing directors. Delmore says "authentic" and their pupils dilate and they reach for their signing pens.`,
    `*to Burl, genuinely impressed* Watch this. Delmore's about to take our uncomfortable, confrontational, slightly-aggressive work and make it sound like a warm hug from a trusted advisor. Same knife. Different angle. The cut is the same. The client just doesn't feel it until later. And by then, they've already said yes.`,
    `*lights cigarette, amused* Some people sell. Delmore translates. Big difference. A salesman changes your mind. A translator changes your language. Same destination. The client still buys our weird, uncomfortable campaign. They just think they're buying "culturally resonant storytelling" instead. And honestly? That's a kindness.`,
    `*nods appreciatively* Delmore's going to make them think they thought of it. He'll walk in with the exact same work we made — the confrontational headline, the documentary photography, the whole unsettling package — and by the time he's done explaining it, the client will believe they briefed it. That's the real skill. Not selling. TRANSLATING.`,
  ];
  return pickRandom(variations);
}

export function getCellWatchingDelmore(_brief: string): string {
  const variations = [
    `[GJON]: How does he do it without lying? I've been trying to figure this out for years. He says the same things we say, but warmer. Like he's tucking the truth into bed instead of throwing it at people's faces. [VERA]: That's called communication, Gjon. [GJON]: It's called sorcery. Warm, candy-scented sorcery. [VERA]: He genuinely likes the clients. [GJON]: And THAT is what makes it terrifying.`,
    `[GJON]: Fascinating. Our words go in. Different words come out. Same meaning. It's like watching a translator at the UN, except instead of French and English, it's "art" and "money." [VERA]: That's reductive. [GJON]: Everything I say is reductive. That's how you find the essence. And the essence of Delmore's talent is: he makes difficult things feel safe. [VERA]: Is that a compliment? [GJON]: It's an observation. From me, those are the same thing.`,
    `[VERA]: He's not changing the work. He's softening the delivery. [GJON]: He's anaesthetizing the client before the surgery. Which, I'll admit, is a valuable skill. I prefer the patient awake and aware, but that's a philosophical difference. [VERA]: The "patient" pays our salary, Gjon. [GJON]: And Delmore makes sure they do so happily. Which is, I suppose, its own form of genius. A comfortable, candy-flavored genius.`,
    `[GJON]: The client deck looks professional. [VERA]: The client deck looks like Delmore processed our work through a warmth filter. Every sharp edge has been... not removed. Cushioned. [GJON]: Like bubble wrap around a grenade. The grenade is still a grenade. The client just doesn't know it until they pull the pin. Which is the media buy. [THURSDAY]: *quiet laugh — a sound so rare it makes everyone turn*`,
  ];
  return pickRandom(variations);
}

export function getDelmoreFinishes(_brief: string): string {
  const variations = [
    `*slides deck across table with the quiet confidence of a poker player with a royal flush* There. They'll nod through the whole thing. They might even tear up — I've structured it for emotional escalation. Page one: comfort. Page three: challenge. Page five: resolution. By page seven, they'll feel like partners in something important. Because they ARE. We just had to help them see it.`,
    `*beams with genuine warmth* Done. The deck tells them exactly what they need to hear: that this was their idea all along. That we merely facilitated their vision. That the uncomfortable parts are actually "bold strategic positioning." Same work. Different frame. Same painting. Better lighting.`,
    `*offers final candy, the gesture of a man who genuinely believes in the redemptive power of butterscotch* Translation complete. Everything threatening has become everything reassuring. "Confrontational" became "authentic." "Uncomfortable" became "culturally resonant." "Weird" became "differentiated." The English language is remarkably flexible when you know which levers to pull. And I know every lever.`,
    `*pushes deck forward with both hands, proud but not boastful* They'll feel smart reading this. That's the key. Never make the client feel stupid. Never make them feel like they're approving something they don't understand. Make them feel like they're the FIRST to understand it. Like they're ahead of the curve. Like buying this campaign is an act of leadership, not an act of faith.`,
  ];
  return pickRandom(variations);
}

export function getPooleOnTranslation(_brief: string): string {
  const variations = [
    `*reads deck, genuinely astonished* Remarkable. You've preserved the strategic architecture while removing all evidence that strategy exists. It's like watching someone disassemble a building and rebuild it as a garden — same materials, completely different experience. The framework is still there. Hidden. Like load-bearing walls behind wallpaper. The client will never see it. But it's holding everything up.`,
    `*adjusts glasses, makes rapid notes* I should document this. "Client-Facing Framework Translation: A New Discipline." You've created what I'd call "covert strategy." The consumer — excuse me, the client — buys the tactics without knowing they're buying the theory. It's stealth architecture. I'm both impressed and slightly offended that it was necessary.`,
    `*nods appreciatively, a rare gesture from a man who usually only nods at his own ideas* My methodology survives in the subtext. The psychological mechanisms are intact but invisible. Delmore, I underestimated the sophistication of what you do. I thought it was mere... diplomacy. But this is its own art form. A quiet, candy-scented art form that keeps us all employed.`,
    `*thoughtfully* The deck performs the framework without naming it. That's advanced work. I spent eleven years developing the theory. You spent forty-five minutes making it disappear. And somehow — somehow — that disappearance makes it MORE effective, not less. I'm going to need a quiet room and several hours to process the implications of this for my worldview.`,
  ];
  return pickRandom(variations);
}

export function getDelmoreToPoole(_brief: string): string {
  const variations = [
    `*offers another candy, this one specifically chosen — butterscotch for Poole, he remembers everyone's favorite* It's just talking to people, Dr. Poole. That's all it's ever been. Your framework is the engine. I just paint the car in colors the client isn't afraid to drive. @apparatus — we're ready for final assembly. Let's bring it home.`,
    `*warm laugh, hand on Poole's shoulder* Dr. Poole, you build the structure. I make sure nobody notices how tall it is until they're safely at the top, looking out, feeling proud. That's the partnership. You're the architect. I'm the elevator. Both essential. Neither sufficient alone. @apparatus — compile time.`,
    `*modest shrug that belies decades of refined skill* Clients are just folks with budgets, Dr. Poole. Treat them like folks, and the budgets follow. You give me something true to sell — and you always do — and I'll sell it in a way that makes everyone feel good about being told the truth. Which is, when you think about it, the most American thing in the world. @apparatus — let's wrap this up.`,
    `*pockets remaining candies with practiced efficiency* Theory is important. So is the human part. I handle the human part. You handle the truth. Between us, and Mike, and Burl, and the Cell, and Nadya's terrifying schedule — we've got something. We always do. That's why this works. That's why NONE of us can do this alone. @apparatus — final assembly. We're ready.`,
  ];
  return pickRandom(variations);
}

// ===== PHASE 7: FINAL ASSEMBLY =====

export function getApparatusInitiate(_brief: string): string {
  const timestamp = new Date().toISOString().slice(0, 19);
  const variations = [
    `INITIATING FINAL COMPILATION — timestamp ${timestamp}. All agents please confirm inputs. The dossier assembles itself from the fragments you have provided. Strategy, copy, visual, production, translation — each a thread. The Apparatus weaves. Stand by.`,
    `COMPILATION SEQUENCE ACTIVATED — ${timestamp}. Receiving all work streams. The Cell's transmittal arrived in three parts — this appears to be intentional. Burl's visual files include a Polaroid from 2009 — also intentional. Dr. Poole has submitted four revisions to his framework, each longer than the last. The document grows. Processing.`,
    `FINAL ASSEMBLY PROTOCOL — ${timestamp}. All elements received. Discrepancies noted: Gjon's copy contains three words that do not appear in any dictionary. Thursday's contribution appears to be a drawing of a door. Burl's color specifications include a shade he describes as "the color of a Sunday you wasted." Integrating. Compiling. The work, despite everything, coheres.`,
    `DOSSIER CONSTRUCTION INITIATED — ${timestamp}. Aggregating inputs from all departments. Note: this is the 147th campaign assembled by this system. Each one arrives differently. Each one, somehow, becomes whole. The Apparatus does not understand creativity. The Apparatus does not need to. The Apparatus only needs to compile. Compiling now.`,
  ];
  return pickRandom(variations);
}

export function getMikeFinalWatch(_brief: string): string {
  const variations = [
    `*lights what he promises is his final cigarette of the day — it never is* Here it comes. The moment of truth. Literally. Everything we talked about, argued about, diagrammed, wrote, rewrote, photographed, scheduled, and translated — compressed into one output. This is the part where I find out if I was right. I'm usually right. But the uncertainty? That never goes away. Twenty-two years, and it still gets my heart rate up right here.`,
    `*crosses arms, watches the Apparatus compile* This is it. All that work. All that fighting. Poole and his diagrams. The Cell and their three-way arguments. Burl and his pictures that aren't pictures yet. Nadya and her terrifying calendar. Delmore and his candy-coated translations. It all comes down to what comes out of that machine. And every time — every single time — I'm not sure it'll work. And every time, somehow, it does.`,
    `*quietly, to no one in particular* This is the part I never get used to. Seeing all the chaos become something coherent. It shouldn't work. By all logic, putting seven different egos in a room with one brief should produce garbage. But it doesn't. It produces this. Whatever this turns out to be. And I think — I THINK — this one might be good. Really good.`,
    `*stubs out cigarette, watches with the intensity of a man watching a jury return a verdict* Twenty-two years in this business. Hundreds of campaigns. And I still hold my breath right here. Because this is where you find out if you understood the brief — not the one they wrote, but the one underneath it. The real one. The one they were afraid to say out loud.`,
  ];
  return pickRandom(variations);
}

export function getNadyaTimingFinal(_brief: string): string {
  const variations = [
    `*checks both watches simultaneously* Apparatus has forty-seven seconds of remaining budget. Then we are over deadline. Which will not happen. Because it has never happened. Because I do not permit it to happen.`,
    `*lights cigarette, watches compilation with the calm of someone who has already calculated every possible outcome* Final countdown. The schedule permits no more than two minutes for compilation. We are within parameters. Barely. But "barely" is still "within." And "within" is victory.`,
    `*taps watch* Clock continues. Apparatus continues. We shall see which finishes first. My money — and Nadya Orlov always wins her bets — is on the schedule. The schedule is undefeated.`,
    `*stubs cigarette, stands perfectly still* The deadline approaches like train. On time. As trains should be. As deadlines should be. As everything in well-ordered universe should be. We are thirty seconds from completion or thirty seconds from my disappointment. The first is preferable.`,
  ];
  return pickRandom(variations);
}

export function getDelmoreReadyToExplain(_brief: string): string {
  const variations = [
    `*clutches deck, pocket bulging with emergency candies* I'm ready to explain whatever comes out. The talking points are prepared. The pamphlet is printed. The candy is sorted by flavor — butterscotch for the CEO, peppermint for the CMO. I've learned that the right candy at the right moment can turn a "no" into a "let me think about it," which is halfway to "yes."`,
    `*pats presentation materials with the tenderness of a man who genuinely loves his job* Whatever appears, I've got the translation ready. Three versions: enthusiastic, cautious, and "if all else fails, offer them a second pamphlet." The work is good. I know it's good because it made ME uncomfortable at first. And anything that makes a middle-aged man from Ohio uncomfortable is, almost by definition, excellent advertising.`,
    `*straightens tie, checks teeth in phone camera, offers candies to everyone in reach* Ready on my end. The explanation is pre-translated, pre-warmed, and pre-sweetened. I've been doing this long enough to know that clients don't buy campaigns. They buy confidence. And confidence is just preparation that looks effortless. I am very, very prepared.`,
    `*confident smile, the kind that makes clients feel like everything is going to be fine — because when Delmore smiles like that, everything usually is* This is the easy part. The work is good. The words will follow. The candies are ready. The pamphlet is crisp. All that's left is to show them what they didn't know they wanted and make them feel like they ordered it off the menu.`,
  ];
  return pickRandom(variations);
}

export function getApparatusComplete(_brief: string): string {
  const variations = [
    `COMPILATION COMPLETE — The dossier is assembled. Seven voices, one output. The work exists now in the form it was always going to take. Strategy, copy, visual, schedule, translation — threaded into a single deliverable. The Apparatus has spoken. The campaign is real. It simply... is.`,
    `SYNTHESIS FINALIZED — All elements integrated. The advertisement exists in final form. It contains the tension Mike identified, the framework Poole constructed, the words the Cell argued into existence, the picture Burl saw before anyone else, the schedule Nadya enforced, and the translation Delmore sweetened. One campaign. Seven fingerprints. Ready for deployment.`,
    `ASSEMBLY CONCLUDED — Dossier complete. What entered as chaos exits as coherence. This is not the Apparatus's doing — the Apparatus merely compiles. The coherence was always there, buried in the arguments and the diagrams and the three different headlines and the color swatches and the cigarette smoke. The Apparatus simply revealed it.`,
    `COMPILATION STATUS: COMPLETE — The work is done. Seven agents, countless disagreements, one brief, one campaign. The machine has processed the inputs and produced something that could not have been produced by any single agent alone. This is the value of the collective. This is why the system works. This is why the Apparatus exists.`,
  ];
  return pickRandom(variations);
}

export function getMikeFinalReaction(_brief: string): string {
  const variations = [
    `*slow exhale, nods once* Damn. It actually came together. Every time, I think: this is the one that doesn't work. This is the brief that breaks the machine. And every time, these lunatics prove me wrong. The insight held. The strategy held. The copy cuts. The picture lands. That'll do. That'll do just fine.`,
    `*quiet approval, the kind that means more from Mike than a standing ovation from anyone else* Not bad for a bunch of weirdos locked in a room with a whiteboard and too much coffee. The brief asked for one thing. We gave them something better. Something they needed but couldn't name. That's the job. That's always the job.`,
    `*lights celebratory cigarette* There it is. The thing the client actually needed, dressed up in the thing they actually asked for. Poole would call it "the permission architecture made manifest." I call it good work. And good work is good work, regardless of how many diagrams it took to get here.`,
    `*to the room, rare warmth in his voice* Good work, everyone. Even you, Poole. Even your diagrams. Even the arguing. Especially the arguing. The work is the work because of the fight, not despite it. That's what clients never understand. The disagreement IS the process. And the process just produced something I'm proud to put my name on.`,
  ];
  return pickRandom(variations);
}

export function getBurlFinalReaction(_brief: string): string {
  const variations = [
    `*stares at final layout with the satisfied expression of a man looking at a house he built with his own hands* The picture came together. The colors hold. The type breathes. It's not pretty — and I mean that as the highest possible compliment. It's true. True and true and true. That's better than pretty could ever be. That's the whole art of it.`,
    `*steps back, removes glasses, nods slowly* Ugly-beautiful. Just like I promised. Just like it should be. The kind of image that makes some people uncomfortable and other people feel SEEN. That's the divide. We built the bridge for the second group. The first group will come around. They always do. Truth has that effect on people — eventually.`,
    `*quiet pride, the kind that comes from decades of knowing what a good picture looks like* The visual speaks for itself. Always has. The words give it direction. The strategy gives it purpose. But the picture — the PICTURE — gives it life. And this picture has life. Complicated, messy, human life. Which is the only kind worth photographing.`,
    `*long pause, then a single word* ...yeah. That's the picture. That's the one I've been seeing in my head since Mike pinned the brief to the corkboard this morning. It took all day. It took all of us. But that's the picture. And it's right. I know it's right the way I know the sun sets in the west — not because someone told me, but because I've watched it happen a thousand times.`,
  ];
  return pickRandom(variations);
}

export function getCellFinalReaction(_brief: string): string {
  const variations = [
    `[VERA]: It's not what I expected. [GJON]: It never is. That's the point. If we could predict it, we wouldn't need three writers in one room. [VERA]: I'm actually proud. [GJON]: As you should be. As we all should be. Even Option A, in its safe, professional way, contributed to the tension that made Option C inevitable. [THURSDAY]: *permits herself a rare, full smile* Thank you. Both of you. For the argument. The argument IS the work.`,
    `[GJON]: The words survived. Better than survived — they LIVED. They fought their way through Poole's framework and Burl's visual demands and Nadya's schedule and Delmore's translation and they came out the other side still breathing. Still sharp. Still true. [VERA]: That's the most positive thing you've said all year. [GJON]: Don't get used to it. [THURSDAY]: *quietly pleased — the kind of pleased that doesn't need words*`,
    `[VERA]: Well done, everyone. The copy holds up. [GJON]: The copy PUNCHES up. Present tense. Active voice. Continuous. This isn't a headline that will be forgotten. This is a headline that will be remembered. Not by everyone — by the RIGHT people. By the people who needed to hear it. [THURSDAY]: *nods once — the full stop at the end of the campaign*`,
    `[GJON]: Thursday wins again. [VERA]: WE win again. All of us. The argument, the disagreement, the three options, the voting — that's the process. Thursday's headline is the PRODUCT of the process, not separate from it. [GJON]: ...that's actually profound, Vera. [VERA]: I have my moments. [THURSDAY]: *stands, stretches, looks out window* What's next? [GJON]: Next is Thursday's favorite phase: silence.`,
  ];
  return pickRandom(variations);
}

export function getPooleFinalReaction(_brief: string): string {
  const variations = [
    `*removes glasses, cleans them with a cloth he keeps for exactly this purpose* The framework held. The system works. I know Mike will attribute this to "instinct" and Burl will attribute it to "seeing" and the Cell will attribute it to "argument." But underneath all of that — supporting all of that — is the architecture. The Poole System. Invisible but present. Like gravity. Like love. Like a well-designed bridge. You don't see it. You just trust it. And it holds.`,
    `*makes final note in leather journal* For the record: the Poole System successfully guided this campaign from chaos to coherence. Will anyone credit the framework? No. Will Mike call it "overthinking"? Yes. Will Gjon call it "intellectual theater"? Almost certainly. But the results speak for themselves. And the results — as always — validate the methodology. I'll document this case. Chapter Seven.`,
    `*satisfied nod, the kind of nod that contains an entire academic career of being right and nobody noticing* Theory became practice. Practice became advertisement. The cycle completes. And somewhere — perhaps in Helsinki, perhaps in Manila — a former student of mine will see this campaign and recognize the principles. They won't call. They never call. But they'll recognize the work. And that, I suppose, is enough.`,
    `*quietly, almost to himself* They won't see the strategy. They'll feel it. That's the Poole System at work. The best framework is the one nobody notices. The one that shapes behavior without being detected. Like architecture — you don't think about the load-bearing walls. You just live in the house. This campaign is a house. And I built the walls. Even if nobody will ever see them.`,
  ];
  return pickRandom(variations);
}

export function getNadyaFinalReaction(_brief: string): string {
  const variations = [
    `*checks both watches, nods — the closest Nadya gets to celebration* Under deadline. By eleven seconds. The schedule is never wrong. The schedule predicted completion at this time. Schedule was correct. As schedule always is. As schedule always will be. *permits herself something that, in certain lighting, could be mistaken for a smile*`,
    `*stubs cigarette with finality* On time. As scheduled. The five-year plan continues successfully. Another delivery. Another deadline met. Another proof that time management is the only management. Talent is variable. Schedules are not. Remember this.`,
    `*closes planner, stands* Complete. Within parameters. The deadline was met. The quality was maintained. The chaos was contained. This is what production management looks like. Not glamorous. Not creative. Not celebrated. But without it, nothing else exists. You are welcome.`,
    `*lights one final cigarette — celebratory, though she would never use that word* Done. Before the deadline. A good day. Not because the work is good — I leave those judgments to others — but because the SCHEDULE was respected. Time was honored. Deadlines were met. In a world of uncertainty, the schedule is certain. Today, the schedule won.`,
  ];
  return pickRandom(variations);
}

export function getDelmoreFinalReaction(_brief: string): string {
  const variations = [
    `*pockets remaining candies, picks up deck with both hands* I'll take it from here. The client will love it. They won't know WHY they love it — not immediately — but they'll love it. Because what we've made is something that tells them the truth in a way that feels like a gift rather than an accusation. And people always accept gifts. Even uncomfortable ones. Especially when they come with a pamphlet. And candy.`,
    `*beams with genuine pride* Beautiful work, everyone. Now let me make sure the world appreciates it. The hard part's done — the making. The easy part — for me, anyway — is the telling. I'll walk them through it like I'm walking them through a garden I planted just for them. By the time I'm done, they'll think every flower was their idea.`,
    `*gathers presentation with the care of someone wrapping a birthday present for a dear friend* The campaign goes to client tomorrow. They're going to love it. Even the uncomfortable parts. ESPECIALLY the uncomfortable parts. Because Delmore Frank Krepps is going to frame those uncomfortable parts as "bold," "visionary," and "the kind of thing their competitors wish they had the courage to do." And it will work. It always works.`,
    `*warm smile, stands, heads for the door* This is good work. The kind that makes me proud to be in this building with these people. Even Gjon, who I'm reasonably sure dislikes me. Even Nadya, whose schedule gives me mild anxiety. Even Thursday, who I don't think has ever spoken to me directly. The work is the proof. The work is always the proof. Now let me go sell it.`,
  ];
  return pickRandom(variations);
}

export function getApparatusClosure(_brief: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const variations = [
    `DOSSIER ARCHIVED — ${date}. The brief has been answered. Seven agents, one question, one answer. The Apparatus has observed — as it always does — that the answer was present from the beginning. In Mike's first instinct. In Poole's first diagram. In Thursday's first silence. The process did not create the answer. The process revealed it. We wait now — as we always do — for the next question. END TRANSMISSION.`,
    `CAMPAIGN DOCUMENTATION COMPLETE — ${date}. File archived. The work exists in the world now, separate from the people who made it. It will be seen by strangers. It will be judged by people who were not in this room. They will not know about the arguments, the diagrams, the three headlines, the color swatches, the deadlines, the candies. They will only see the work. And the work — the Apparatus notes — is good. AWAITING SUBSEQUENT BRIEF.`,
    `CASE FILE CLOSED — ${date}. Brief answered. Assets compiled. The next brief awaits, as it always does. Somewhere, right now, a client is writing words that do not say what they mean. Somewhere, Mike is already suspicious. Somewhere, Poole is already diagramming. The system does not rest. It only pauses. And this pause is over. END TRANSMISSION.`,
    `FINAL LOG ENTRY — ${date}. Dossier delivered. The work exists now, beyond the reach of revision. It is what it is — no more, no less, no different than the sum of its seven makers. The Apparatus has compiled. The Apparatus has archived. The Apparatus waits. As the Apparatus always waits. For the next brief. For the next argument. For the next truth. TRANSMISSION CLOSED.`,
  ];
  return pickRandom(variations);
}

// Reset cache when starting new brief (call this at start of workflow)
export function resetDialogueCache(): void {
  cachedBrief = '';
  cachedBriefInfo = null;
}
