/**
 * Dynamic Dialogue Generator for ADHDAI Agency Characters
 * 
 * Generates varied, contextually-aware dialogue based on the brief content.
 * Each character has multiple variations for each interaction point,
 * and dialogue is personalized based on the product/brand/category.
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
    `*lights cigarette, spreads case file on table* Alright everyone, gather round. We got a live one: "${brief}"`,
    `*slams folder on desk, leans back* Fresh brief just hit my desk. ${product}. Let's see what they're really asking for.`,
    `*stubs out cigarette, opens new file* Got another one. "${brief}" — and I already know they're not telling us the real story.`,
    `*adjusts reading glasses, scans document* New client, new problem. They say they want an ad for ${product}. They don't know what they want.`,
    `*pours coffee, slides brief across table* Take a look. "${brief}" — there's something underneath this one. I can smell it.`,
    `*loosens tie, pins brief to corkboard* This one's interesting. ${product}. Question is: who actually needs this, and why won't they admit it?`,
    `*cracks knuckles, opens case file* Alright, let's dissect this thing. "${brief}" — the brief is never the brief.`,
    `*walks to whiteboard, uncaps marker* New case: ${product}. Twenty-two years in this business, and I still see patterns nobody wants to talk about.`
  ];
  return pickRandom(variations);
}

export function getPooleFirstReaction(brief: string): string {
  const info = getBriefInfo(brief);
  const category = info.category || 'this space';
  
  const variations = [
    `*peers over Mike's shoulder* Fascinating. I already see three potential perception architectures forming...`,
    `*adjusts glasses, leans forward* Ah, yes. The ${category} space. I've mapped this terrain before. The consumer psychology here is... layered.`,
    `*strokes chin thoughtfully* Interesting. Very interesting. This triggers Poole Principle Seven — the Permission Gap.`,
    `*makes note in leather journal* I see it already. The framework is practically assembling itself.`,
    `*stands at whiteboard* ${category}... yes. I presented on this topology at the Helsinki conference. The desire pathways are clear.`,
    `*pulls out diagram* This aligns with my research. The consumer wants permission to want. It's textbook.`,
    `*nods slowly* The architecture of wanting is already visible here. Let me explain...`,
    `*retrieves worn notebook* This reminds me of a case in Manila, 2003. The same psychological mechanisms are at play.`
  ];
  return pickRandom(variations);
}

export function getCellEntrance(_brief: string): string {
  const variations = [
    `[VERA]: We're listening. [GJON]: *crosses arms* Let's see what the suits actually need. [THURSDAY]: *stares at wall*`,
    `[GJON]: Another brief, another set of contradictions. [VERA]: Give them a chance. [THURSDAY]: *begins writing on index card*`,
    `[VERA]: We can work with this. [GJON]: We can work AROUND this. [THURSDAY]: *silent, observing*`,
    `[GJON]: *sighs audibly* What do they think they want this time? [VERA]: Gjon— [THURSDAY]: *taps pen rhythmically*`,
    `[VERA]: This is promising. [GJON]: This is capitalism. Same thing, I suppose. [THURSDAY]: *looks out window*`,
    `[GJON]: Let me guess — they want "authentic" and "disruptive"? [VERA]: Hush. [THURSDAY]: *draws something on napkin*`,
    `[VERA]: Interesting brief. [GJON]: Every brief is interesting until you read the fine print. [THURSDAY]: *closes eyes, thinking*`,
    `[VERA]: I see potential. [GJON]: I see problems. [THURSDAY]: *already on third index card*`
  ];
  return pickRandom(variations);
}

export function getMikeInsightComment(_brief: string): string {
  const variations = [
    `*taps folder* There's the real job. Not what they asked for. What they actually need.`,
    `*nods slowly* That's what they're afraid to say out loud. That's what we're selling.`,
    `*exhales smoke* Found it. The thing they didn't put in the brief.`,
    `*circles text* Right there. That's the gap between what they said and what they meant.`,
    `*leans back* Twenty-two years. The real problem is never in paragraph one.`,
    `*crosses arms* That's the human tension. The rest is just packaging.`,
    `*stubs cigarette* There. Now we're getting somewhere.`,
    `*underlines phrase* This is what keeps their customers up at night. Even if they don't know it.`
  ];
  return pickRandom(variations);
}

export function getPooleWatchingMike(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product || 'this';
  
  const variations = [
    `*adjusts glasses, leans in to read* Hmm. Crude, but there's structural validity here. The tension topology is... usable.`,
    `*nods approvingly* Slab's instincts are, as usual, essentially correct. Though theoretically underdeveloped.`,
    `*studies sticky note* Yes. This aligns with Principle Three. Mike has found the nerve without knowing what to call it.`,
    `*takes photograph of insight* Excellent raw material. Now we need to give it architecture.`,
    `*circles Mike's insight* There's the seed. The Poole System can grow this into something structural.`,
    `*makes annotation* The ${product} tension — I've seen this pattern before. The framework will accommodate it.`,
    `*removes glasses, polishes them* Mike sees the pain. I see the pathway. Together, we have something.`,
    `*sketches quick diagram* Yes, yes. The emotional truth is there. Now we systematize it.`
  ];
  return pickRandom(variations);
}

export function getBurlEarlyThoughts(brief: string): string {
  const info = getBriefInfo(brief);
  const category = info.category || 'something';
  
  const variations = [
    `*squints at Mike's sticky note* Already got pictures forming in my head. Something raw. Documentary feeling.`,
    `*scratches chin* I can see it. ${category}, but photographed like evidence. Like it means something.`,
    `*stares into middle distance* There's a visual here. Unglamorous. Real. That's what this needs.`,
    `*pulls out worn photo reference* Reminds me of a shoot I did in '09. Same feeling. Same weight.`,
    `*makes frame with fingers* Not pretty. True. There's a difference, and clients never understand it until they see it.`,
    `*flips through mental catalog* I've got a typeface in mind already. Something that's been through some things.`,
    `*nods slowly* This wants to be ugly-beautiful. The kind of picture that makes you uncomfortable in the right way.`,
    `*sketches rough thumbnail* See, ${category} — most people photograph it wrong. They make it aspirational. It should be inevitable.`
  ];
  return pickRandom(variations);
}

export function getCellReactToTension(_brief: string): string {
  const variations = [
    `[GJON]: *reads over Burl's shoulder* That tension. I can work with that. [VERA]: Don't get ahead of yourself. [THURSDAY]: *already scribbling*`,
    `[VERA]: This is clear. Actionable. [GJON]: Too clean. Thursday, what do you see? [THURSDAY]: *slides paper across — it's unreadable*`,
    `[GJON]: There's dialectical potential here. [VERA]: Can you say that without 'dialectical'? [GJON]: No. [THURSDAY]: *smiles slightly*`,
    `[VERA]: I can write to this. [GJON]: You can write to anything. The question is whether you should. [THURSDAY]: *taps table once*`,
    `[GJON]: This needs edge. [VERA]: This needs clarity. [THURSDAY]: *writes single word, folds paper* This needs both.`,
    `[VERA]: Solid foundation. [GJON]: Solid foundations make boring buildings. [THURSDAY]: *staring at fluorescent light*`,
    `[GJON]: I see three angles already. [VERA]: I see one good one. [THURSDAY]: *drawing something that isn't quite letters*`,
    `[VERA]: We can work with the human element. [GJON]: We can weaponize it. [THURSDAY]: *long pause* ...yes.`
  ];
  return pickRandom(variations);
}

// ===== PHASE 2: STRATEGIC FRAMEWORK =====

export function getPooleFrameworkIntro(_brief: string): string {
  const variations = [
    `*clears throat* If I may... the Poole System™ demands we map the consumer desire-obstacle matrix. Stand back, please.`,
    `*approaches whiteboard with purpose* Now. Let me demonstrate the framework that makes all of this coherent.`,
    `*uncaps three different colored markers* The architecture of wanting requires visual representation. Observe.`,
    `*pulls down projection screen* I've prepared some diagrams. Only eleven slides. Perhaps twelve.`,
    `*distributes handouts no one asked for* Chapter Seven of my forthcoming volume addresses this precisely. Allow me to summarize.`,
    `*taps whiteboard commandingly* Attention, please. The Permission-Paradox Framework will illuminate our path.`,
    `*removes glasses dramatically* What Slab has identified emotionally, I will now systematize strategically.`,
    `*draws first circle* This is the consumer's current state. *draws second circle* This is where we need them to be. *draws elaborate path between them* This is the Poole System.`
  ];
  return pickRandom(variations);
}

export function getMikeWatchingPoole(_brief: string): string {
  const variations = [
    `*leans against wall* Here we go with the diagrams again...`,
    `*lights cigarette* Five bucks says this takes longer than the actual ad.`,
    `*checks watch ostentatiously* Wake me when there's something I can use.`,
    `*mutters* Lot of circles for what boils down to 'people want stuff.'`,
    `*to Burl, quietly* How many made-up words do you think we'll get this time?`,
    `*crosses arms* I gave him the insight in two sentences. He's gonna give it back in twenty diagrams.`,
    `*stares at ceiling* Here comes the Helsinki story...`,
    `*shakes head slowly* The man's never met a simple truth he couldn't complicate.`
  ];
  return pickRandom(variations);
}

export function getPooleBarrierComment(_brief: string): string {
  const variations = [
    `*draws arrow with flourish* The barrier is identified. See how it intersects with Mike's tension point?`,
    `*steps back from diagram* There. The consumer's defense mechanism, mapped in three dimensions.`,
    `*circles node emphatically* This is where desire becomes denial. The critical junction.`,
    `*adds label in precise handwriting* The obstacle isn't external. It's internal. Always is.`,
    `*connects two points with dotted line* Notice the feedback loop. Denial reinforces guilt, guilt reinforces denial.`,
    `*taps diagram* Right here. This is why their current marketing fails. They're addressing the symptom, not the cause.`,
    `*removes cap from different colored marker* Now we add the intervention point. This is where strategy becomes... elegant.`,
    `*sketches additional layer* The barrier operates on three levels: cognitive, emotional, behavioral. We must address all three.`
  ];
  return pickRandom(variations);
}

export function getCellImpatience(_brief: string): string {
  const variations = [
    `[GJON]: Poole, we don't need a PhD dissertation. Just tell us what angle to write. [VERA]: Let him finish. [GJON]: He never finishes.`,
    `[GJON]: Is this going somewhere, or just... around? [VERA]: Gjon. [GJON]: I'm asking for everyone.`,
    `[VERA]: This is helpful context. [GJON]: Context is what people say when they don't have conclusions. [THURSDAY]: *yawns*`,
    `[GJON]: *checks imaginary watch* We're burning daylight, Professor. [VERA]: Some things take time. [GJON]: Some things take too much time.`,
    `[GJON]: Three boxes and an arrow. Revolutionary. [VERA]: Stop. [THURSDAY]: *has written entire draft already*`,
    `[VERA]: The framework helps us— [GJON]: The framework helps Poole feel important. [VERA]: GJON. [THURSDAY]: *nods almost imperceptibly*`,
    `[GJON]: When do we actually write something? [VERA]: After the strategy. [GJON]: The strategy is 'sell the thing.' Can we start now?`,
    `[GJON]: I'm going to need more coffee for this. [VERA]: It's almost done. [GJON]: He said that forty minutes ago.`
  ];
  return pickRandom(variations);
}

export function getPooleReframe(_brief: string): string {
  const variations = [
    `*steps back triumphantly* The reframe. When we pivot perception, consumption becomes inevitable.`,
    `*caps marker with satisfaction* There. The shift in perspective that changes everything.`,
    `*gestures at completed diagram* This is not selling. This is permission-granting. The consumer will thank us.`,
    `*removes glasses, cleans them thoughtfully* What was a barrier is now a bridge. That's the power of reframing.`,
    `*turns to face room* Don't you see? We're not changing the product. We're changing the consumer's relationship to wanting it.`,
    `*adds final annotation* The reframe is complete. What was threatening becomes inviting.`,
    `*smiles slightly* This is what separates strategy from mere advertising. The psychological turn.`,
    `*photographs whiteboard* For my archives. And for the client deck. This is the intellectual foundation.`
  ];
  return pickRandom(variations);
}

export function getBurlOnStrategy(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product || 'this';
  
  const variations = [
    `*nods slowly* That reframe... I can see it. One image. Big. Confrontational. No gradient nonsense.`,
    `*sketches rapidly* The visual's coming together. ${product}, but photographed like a reckoning.`,
    `*stares at Poole's diagram* All those arrows... they all point to one picture. I know what it looks like.`,
    `*pulls out reference book* There's a Dorothea Lange shot that captures this feeling. Unglamorous truth.`,
    `*frames imaginary shot* Wide. Documentary. Let the ${product} speak without trying to be pretty.`,
    `*makes notes* When he says 'reframe,' I see: one stark image, one honest moment, no artifice.`,
    `*nods* The strategy is fancy words for what I already knew: show the real thing, not the dream of the thing.`,
    `*taps temple* Already composing the shot. The reframe is the permission to be ugly-beautiful.`
  ];
  return pickRandom(variations);
}

// ===== PHASE 3: COPY DEVELOPMENT =====

export function getCellStartWriting(_brief: string): string {
  const variations = [
    `[VERA]: Alright, I'll start conventional. The safe option. [GJON]: *sighs* Predictable. [THURSDAY]: *stares at ceiling*`,
    `[VERA]: I'll draft Option A. Clean, functional. [GJON]: Boring. [VERA]: Responsible. [THURSDAY]: *already writing something else*`,
    `[VERA]: Let me establish the baseline. [GJON]: The baseline is capitulation. [VERA]: The baseline is COMMUNICATION. [THURSDAY]: *silent*`,
    `[VERA]: Starting with the clear benefit statement. [GJON]: Starting with surrender, you mean. [THURSDAY]: *smiles slightly*`,
    `[GJON]: Vera goes first. Then I sharpen it. Then Thursday makes it weird. [VERA]: That's... actually accurate. [THURSDAY]: *nods*`,
    `[VERA]: Option A will be what they expect. [GJON]: And then we give them what they need. [THURSDAY]: *cracks knuckles*`,
    `[VERA]: Safe option first. [GJON]: Safe is a four-letter word. [VERA]: It's literally four letters. [THURSDAY]: *begins writing*`,
    `[GJON]: Let me guess — Vera's going to 'state the benefit clearly.' [VERA]: Yes. Because that WORKS. [THURSDAY]: *opens fresh notebook*`
  ];
  return pickRandom(variations);
}

export function getPooleSupervisesCopy(_brief: string): string {
  const variations = [
    `*hovers* Remember, the reframe must be present in every word choice. The semiotics of—`,
    `*reads over shoulder* Interesting. But does it encode the permission pathway? Let me see...`,
    `*makes small noise of approval* Yes, the framework is visible in the subtext. Continue.`,
    `*positions self uncomfortably close* Each word should carry the weight of the psychological architecture—`,
    `*takes notes* I'll need to verify alignment with Principle Twelve. Keep writing.`,
    `*murmurs* The lexical choices here need to mirror the desire-obstacle topology...`,
    `*interjects* Have you considered the phenomenological implications of that adjective?`,
    `*nods thoughtfully* The framework permits this approach. Though I have notes. Several notes.`
  ];
  return pickRandom(variations);
}

export function getCellToPoole(_brief: string): string {
  const variations = [
    `[GJON]: Poole. Please. Let us write.`,
    `[VERA]: Dr. Poole, we've got this. [GJON]: We've HAD this. For twenty minutes now.`,
    `[GJON]: Some space, please. Creativity requires oxygen. [VERA]: He's not wrong.`,
    `[VERA]: We'll incorporate the framework. [GJON]: Allegedly. [VERA]: GJON.`,
    `[GJON]: Your presence is noted. As is your proximity. [VERA]: We'll send you a draft.`,
    `[VERA]: Thank you, Dr. Poole. We'll take it from here. [GJON]: Finally.`,
    `[GJON]: The framework is in our heads. Unfortunately. [VERA]: We've got this.`,
    `[VERA]: Why don't you check on Burl? [GJON]: Yes. Check on literally anyone else.`
  ];
  return pickRandom(variations);
}

export function getCellOptionADone(_brief: string): string {
  const variations = [
    `[VERA]: Option A. Clean. Safe. Client won't have a heart attack.`,
    `[VERA]: Done. Option A — functional, clear, won't scare anyone.`,
    `[VERA]: First draft. Safe harbor. The 'we tried' option.`,
    `[VERA]: Option A complete. It's good. [GJON]: It's fine. [VERA]: Fine IS good sometimes.`,
    `[VERA]: There. Conventional but correct. [GJON]: Conventional IS correct. That's the problem.`,
    `[VERA]: Option A — the version that gets approved but not remembered.`,
    `[VERA]: Clean draft done. [GJON]: Clean. Like a hotel room. [VERA]: What's wrong with hotels?`,
    `[VERA]: First option complete. Solid. Unimpeachable. [GJON]: Uninspiring. [VERA]: You're up next, then.`
  ];
  return pickRandom(variations);
}

export function getBurlReadsOptionA(_brief: string): string {
  const variations = [
    `*reads Option A* I can work with this. But it's missing... something. Where's the gut punch?`,
    `*squints at copy* Technically correct. Visually? Nothing to photograph. Give me something to see.`,
    `*reads, frowns slightly* The words are fine. But where's the picture? I need a picture in these words.`,
    `*studies draft* This is the version their other agency would write. Where's the thing that makes you feel?`,
    `*nods, but with reservations* Safe. I can photograph safe. But safe doesn't hang on walls.`,
    `*reads aloud quietly* Mmm. It's like a handshake. Firm, forgettable. Let's see what else we've got.`,
    `*sets down Option A* Fine bones. No soul. Yet. What's Gjon cooking up?`,
    `*tilts head* I've seen this headline before. Maybe not these exact words, but this exact feeling. Familiar.`
  ];
  return pickRandom(variations);
}

export function getCellOptionBDone(_brief: string): string {
  const variations = [
    `[GJON]: Option B. This one bites. [VERA]: That's too aggressive! [GJON]: That's why it WORKS.`,
    `[GJON]: Done. Option B — the one that makes people uncomfortable in a productive way. [VERA]: 'Productive'?`,
    `[GJON]: Here. Real. Dangerous. [VERA]: That's a bit much. [GJON]: That's exactly enough.`,
    `[GJON]: Option B complete. [VERA]: It's confrontational. [GJON]: Advertising IS confrontation. [VERA]: Is it?`,
    `[GJON]: This one challenges their assumptions. [VERA]: It challenges MY assumptions. [GJON]: Good.`,
    `[GJON]: Less polish, more truth. That's Option B. [VERA]: Clients don't buy unpolished. [GJON]: They should.`,
    `[GJON]: There. Something that actually says something. [VERA]: It says a lot. Maybe too much. [GJON]: No such thing.`,
    `[GJON]: Option B — dialectical tension personified. [VERA]: In English? [GJON]: It starts a fight in your head.`
  ];
  return pickRandom(variations);
}

export function getMikeWatchingCell(_brief: string): string {
  const variations = [
    `*watches the Cell argue* I love this part. Like watching cats in a bag.`,
    `*settles into chair* The Cell's fighting again. That's how you know it's working.`,
    `*lights cigarette, amused* They're gonna write three options and pretend to vote. The weird one always wins.`,
    `*to Burl* Watch. Vera and Gjon will fight, and then Thursday will slide a paper across the table.`,
    `*mutters appreciatively* The Cell's process is chaotic. But chaos produces results.`,
    `*observes with professional interest* This is why we keep three writers in one room. Productive friction.`,
    `*nods to Poole* They're arguing about word choice. That's the good kind of arguing.`,
    `*crosses arms, watching* Twenty years and I still can't predict what Thursday's gonna do. That's the point.`
  ];
  return pickRandom(variations);
}

export function getCellThursdayDone(brief: string): string {
  const info = getBriefInfo(brief);
  const product = info.product?.toUpperCase() || 'PRODUCT';
  
  const variations = [
    `[THURSDAY]: *slides paper across table without looking up* [VERA]: ...What the— [GJON]: *reads it twice* [VERA]: Thursday, this is unhinged.`,
    `[THURSDAY]: *places card face-down, walks to window* [VERA]: *flips card* ...Oh. [GJON]: ...Oh is right.`,
    `[THURSDAY]: *taps finished page once, then silence* [VERA]: How do you even— [GJON]: Don't ask. Just accept.`,
    `[THURSDAY]: *slides index card — it reads like a warning label had a panic attack* [VERA]: I... [GJON]: I know.`,
    `[THURSDAY]: *finishes, closes notebook with finality* [VERA]: Let me see— oh no. [GJON]: Oh YES.`,
    `[THURSDAY]: *paper airplane containing Option C lands in center of table* [VERA]: Did you just— [GJON]: Poetic.`,
    `[THURSDAY]: *word "done" on single index card, followed by actual copy on back* [VERA]: This is... [GJON]: This is Thursday.`,
    `[THURSDAY]: *presents headline about ${product} that makes everyone uncomfortable* [VERA]: That's— [GJON]: *slowly claps*`
  ];
  return pickRandom(variations);
}

export function getEveryoneReactsToThursday(_brief: string): string {
  const variations = [
    `*Burl squints* ...That's the one. That's the picture I've been seeing.\n*Poole adjusts glasses* Structurally unsound... yet somehow it maps perfectly to the reframe. Remarkable.\n*Mike nods* Kid's got something. That's the kind of line that makes people uncomfortable. Good uncomfortable.`,
    `*Burl immediately starts sketching* This. This I can photograph.\n*Poole frowns, then slowly nods* Against all theoretical odds... it works.\n*Mike lights another cigarette* There's our headline. Fight me on it.`,
    `*Burl whistles low* That's not a headline. That's a gut punch.\n*Poole removes glasses entirely* I... the framework does not account for this. Yet I cannot argue.\n*Mike grins* That's the one. That's always the one.`,
    `*Burl already composing shot in his head* The visual just clicked into place.\n*Poole studying intently* Fascinating. It violates Principle Three while honoring Principle Seven.\n*Mike satisfied grunt* Now we're talking.`,
    `*Burl nods slowly* Ugly-beautiful. Just right.\n*Poole makes rapid notes* I'll need to revise Section Four of my book...\n*Mike raises eyebrow* Even the professor's impressed. That's how you know.`,
    `*Burl holds up frame-fingers* I see the whole campaign now.\n*Poole speechless for once*\n*Mike to the room* That's why we keep Thursday around.`,
    `*Burl grinning* Now THAT'S a picture.\n*Poole quietly* I'll need to rethink several assumptions...\n*Mike stubs cigarette* Wrap it up. Thursday wins again.`,
    `*Everyone silent for a moment*\n*Burl first to speak* That's the ad.\n*Poole finally* ...unconventional. Effective.\n*Mike nods* Called it.`
  ];
  return pickRandom(variations);
}

export function getCellVote(_brief: string): string {
  const variations = [
    `[CELL VOTE]: Option C carries. 2-1. [VERA]: I still think— [GJON]: It's decided. @burl — make it ugly-beautiful.`,
    `[CELL VOTE]: Thursday takes it. Again. [VERA]: This is statistically improbable. [GJON]: It's statistically consistent.`,
    `[CELL VOTE]: C wins. [VERA]: For the record, A was safer. [GJON]: Safety is for other agencies. [THURSDAY]: *already left*`,
    `[CELL VOTE]: The strange one prevails. [VERA]: Naturally. [GJON]: The strange one is the honest one.`,
    `[CELL VOTE]: Option C approved. [VERA]: I want my objection noted. [GJON]: It's noted. It's overruled. @burl — you're up.`,
    `[CELL VOTE]: 2-1, Thursday's direction. [VERA]: How does this keep happening? [GJON]: Because Thursday sees something we don't.`,
    `[CELL VOTE]: C is the go. [VERA]: Fine. I'll make it sing anyway. [GJON]: That's the spirit. Reluctant compliance.`,
    `[CELL VOTE]: The unsettling option wins. [VERA]: *sighs* [GJON]: Your sigh is noted. @burl — visual brief incoming.`
  ];
  return pickRandom(variations);
}

// ===== PHASE 4: ART DIRECTION =====

export function getBurlStartsDesign(_brief: string): string {
  const variations = [
    `*spreads out swatches, photos* Alright. Everyone back up. I need to think in pictures.`,
    `*clears entire table* Visuals time. Words people, step back. This is my territory now.`,
    `*pins reference images* I'm seeing something. Don't talk to me for a few minutes.`,
    `*pulls out worn color charts* The picture's been forming since Mike's first sticky note. Let me work.`,
    `*arranges test prints* I know what this wants to be. Just need to pull it out of the ether.`,
    `*creates space with authority* Alright, copy's done. Time to make it visible. Give me room.`,
    `*opens reference folder* There's a visual language here. Real, not manufactured. Let me find it.`,
    `*examines Thursday's headline intensely* This headline wants something specific. Something true.`
  ];
  return pickRandom(variations);
}

export function getNadyaChecksIn(_brief: string): string {
  const variations = [
    `*checks watch* Burl. How long for visuals? I have schedule to build.`,
    `*appears without warning* Timeline update. Where are we on visual development?`,
    `*lights cigarette* Burl. The schedule does not wait for art. How long?`,
    `*clipboard in hand* Visual phase. Duration estimate. Now, please.`,
    `*enters, stands expectantly* Deadline is not abstract concept, Burl. Minutes?`,
    `*taps watch* Burl. Time is not renewable resource. Status?`,
    `*materializes* The production schedule requires visual completion time. Provide estimate.`,
    `*checks multiple watches* Burl. I am building timeline. Your input is required. Now.`
  ];
  return pickRandom(variations);
}

export function getBurlToNadya(_brief: string): string {
  const variations = [
    `*doesn't look up* When it's done, Nadya. Art doesn't punch a clock.`,
    `*keeps working* Give me space. You'll have visuals when the visuals are ready.`,
    `*mutters* Nadya, you can't schedule inspiration. It arrives when it arrives.`,
    `*waves dismissively* The picture will tell me when it's finished. Not the calendar.`,
    `*continues arranging* Clock-watching kills good work. Trust the process.`,
    `*shrugs without stopping* Soon. Maybe very soon. Depends on the picture.`,
    `*focused* Art fights deadlines. Deadlines sometimes win. Check back in an hour.`,
    `*grumbles* You can have it fast or you can have it good. Choose wisely, Nadya.`
  ];
  return pickRandom(variations);
}

export function getNadyaResponse(_brief: string): string {
  const variations = [
    `*lights cigarette* It does in this agency.`,
    `*expressionless* Clock does not care about art. Clock only cares about time.`,
    `*makes note* I give you two hours. After that, schedule becomes... creative.`,
    `*unmoved* Valentina Tereshkova did not wait for inspiration to orbit Earth.`,
    `*stubs cigarette* The schedule is the schedule. Work within it.`,
    `*checks watch again* Art has until 4pm. After 4pm, art becomes my problem.`,
    `*deadpan* In Soviet Union, deadlines met artist. We are not so different.`,
    `*already walking away* You have time you have. No more. No less. Use wisely.`
  ];
  return pickRandom(variations);
}

export function getBurlColorComment(_brief: string): string {
  const variations = [
    `*pins swatch to wall* There. That color. It's not pretty. It's honest.`,
    `*studies palette* This one. The color of something that's been through things.`,
    `*selects shade definitively* People think color is decoration. Color is mood. This is the mood.`,
    `*places final swatch* That's it. The color of uncomfortable truth.`,
    `*steps back from board* Right there. That shade says everything the words can't.`,
    `*adjusts lighting* See how that hits? That's not glamour. That's gravity.`,
    `*nods at selection* Color tells you what to feel before you read a word. This one says: pay attention.`,
    `*finalizes palette* Nothing pretty. Nothing fake. Colors that look like they mean it.`
  ];
  return pickRandom(variations);
}

export function getPooleOnColors(_brief: string): string {
  const variations = [
    `*examines color choices* Interesting. The chromatic tension mirrors the psychological framework. Was this intentional?`,
    `*studies palette* The color theory here aligns with Principle Nine. Though you probably arrived at it intuitively.`,
    `*makes notes* Fascinating. The hue selection maps to the consumer desire pathway. Unconscious genius, perhaps.`,
    `*leans in* These tones... they encode the permission mechanism visually. Remarkable.`,
    `*nods approvingly* The palette creates what I call 'chromatic permission.' You're speaking my language, Burl.`,
    `*photographs swatches* For the framework appendix. This demonstrates the visual-psychological correlation perfectly.`,
    `*adjusts glasses* The color temperature here is precisely calibrated to the emotional target. How did you know?`,
    `*thoughtfully* These choices validate Section Three of my methodology. I'm impressed, genuinely.`
  ];
  return pickRandom(variations);
}

export function getBurlToPoole(_brief: string): string {
  const variations = [
    `*shrugs* I just paint what I see, professor.`,
    `*keeps working* Don't know about frameworks. Know what feels right.`,
    `*barely looks up* The picture tells me what it needs. I listen.`,
    `*matter-of-fact* Didn't calculate it. Felt it. That's how pictures work.`,
    `*waves hand* Your charts and my gut get to the same place. Different routes.`,
    `*grunts* Don't need a theory. Need eyes. And experience. And coffee.`,
    `*slight smile* Call it what you want. I call it seeing what's there.`,
    `*adjusts layout* Art and science meet somewhere, Poole. We're both standing there.`
  ];
  return pickRandom(variations);
}

export function getCellOnVisuals(_brief: string): string {
  const variations = [
    `[VERA]: The type is good. Clean. [GJON]: Make sure it doesn't undercut Thursday's line. [THURSDAY]: *nods once, leaves*`,
    `[VERA]: This visual direction supports the copy. [GJON]: It should challenge it slightly. [THURSDAY]: *taps approval*`,
    `[GJON]: The ugliness is intentional? [VERA]: Clearly. [GJON]: Good. It matches the words. [THURSDAY]: *small smile*`,
    `[VERA]: Professional work. [GJON]: Don't damn with faint praise. It's GOOD work. [THURSDAY]: *satisfied silence*`,
    `[GJON]: Finally, visuals that don't soften the message. [VERA]: High praise from you. [THURSDAY]: *already gone*`,
    `[VERA]: Copy and visual are aligned. [GJON]: Copy and visual are in conversation. Better. [THURSDAY]: *nods*`,
    `[VERA]: The type needs breathing room. [GJON]: The type needs to FIGHT for its space. [THURSDAY]: ...both.`,
    `[GJON]: This is what I meant by 'ugly-beautiful.' Exactly this. [VERA]: I see it now. [THURSDAY]: *approving silence*`
  ];
  return pickRandom(variations);
}

export function getBurlKeyVisual(_brief: string): string {
  const variations = [
    `*steps back from layout* There. That's the picture. Don't let anyone prettify it.`,
    `*pins final reference* This is the image. Raw, honest, uncomfortable in the right way.`,
    `*surveys completed board* It's not pretty. It's true. That's better.`,
    `*exhales slowly* Done. The picture says what the copy can only hint at.`,
    `*removes glasses, rubs eyes* There's your key visual. Fight anyone who wants to smooth it out.`,
    `*nods with satisfaction* That's the shot. Documentary feeling. Evidence, not advertisement.`,
    `*makes final adjustment* Picture's done. It's gonna make some people uncomfortable. That's the point.`,
    `*steps away from work* They'll want to soften it. Don't let them. The picture needs its teeth.`
  ];
  return pickRandom(variations);
}

// ===== PHASE 5: PRODUCTION =====

export function getNadyaScheduleAnnouncement(_brief: string): string {
  const variations = [
    `*slams calendar on table* Schedule time. Everyone, deadlines are not suggestions. They are law.`,
    `*enters with authority* Listen. The five-year plan accounts for everything. Including your excuses. Here is schedule.`,
    `*distributes timeline* You have dates. You have responsible parties. You have no room for negotiation.`,
    `*taps printed schedule* This is not request. This is reality. Dates are fixed. Like stars.`,
    `*posts massive chart* Every task. Every owner. Every deadline. Written in something like stone.`,
    `*commands attention* The schedule does not care about feelings. Only about facts. These are the facts.`,
    `*clipboard strike on table* Deadlines. Real ones. The kind that happen whether you're ready or not.`,
    `*unfolds large printout* Behold. The production schedule. It is beautiful in its inevitability.`
  ];
  return pickRandom(variations);
}

export function getMikeOnTimeline(_brief: string): string {
  const variations = [
    `*looks at dates* Nadya, these timelines are... aggressive.`,
    `*studies schedule* We're really gonna do all this in... *counts* ...forty-eight hours?`,
    `*raises eyebrow* Nadya, you know we're humans, right? Not machines?`,
    `*whistles low* That's ambitious. Very ambitious. Possibly insane.`,
    `*to Burl, quietly* Did she give us any margin for error? ...No, right?`,
    `*reads dates twice* Nadya. I appreciate the optimism. That's what this is, right? Optimism?`,
    `*frowns at calendar* You're assuming nothing goes wrong. Things always go wrong.`,
    `*shakes head slowly* The schedule is the schedule, I guess. Even when the schedule is impossible.`
  ];
  return pickRandom(variations);
}

export function getNadyaToMike(_brief: string): string {
  const variations = [
    `Valentina Tereshkova orbited Earth in '63. You can make deadline in '26.`,
    `In '94, I coordinated print run during actual power outage. You have electricity. You have deadline.`,
    `I have seen worse conditions produce better results. This is luxury. Work.`,
    `The schedule has buffer. You cannot see buffer. But buffer exists. Trust schedule.`,
    `Every deadline I set, someone says is impossible. Every deadline, met. You see the pattern.`,
    `Time is not your enemy. Lack of organization is enemy. I have organized. Now you execute.`,
    `In Soviet system, this would be considered generous timeline. I am being very American today.`,
    `If deadline was easy, would not need deadline. Difficult is the point. Begin.`
  ];
  return pickRandom(variations);
}

export function getNadyaScheduleLocked(_brief: string): string {
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString();
  const variations = [
    `*stubs cigarette* Schedule is law. Break it at your peril. @delmore — client expects smooth translation.`,
    `*posts final schedule* Shoot: ${tomorrow}. Delivery: forty-eight hours after. No delays. No excuses.`,
    `*clicks pen definitively* It is done. The schedule exists. Now we exist within it.`,
    `*lights fresh cigarette* Timeline locked. Every responsible party notified. Accountability begins now.`,
    `*checks all items* Final schedule distributed. Questions are permitted. Changes are not.`,
    `*nods once* The machine is in motion. Everyone knows their date. Everyone delivers.`,
    `*folds arms* Production phase: active. The schedule protects no one who does not protect the schedule.`,
    `*surveys room* You have your dates. You have your tasks. The schedule is patient. I am not.`
  ];
  return pickRandom(variations);
}

// ===== PHASE 6: CLIENT TRANSLATION =====

export function getDelmoreStarts(_brief: string): string {
  const variations = [
    `*adjusts collar, distributes hard candies* Now friends, the client needs to feel... comfortable. Let me translate.`,
    `*passes candy bowl* Alright, here's where I earn my keep. Time to make this sound like something they wanted all along.`,
    `*smooths notes, offers mints* The work is strong. Now we need to make sure the client doesn't realize HOW strong until it's approved.`,
    `*warm smile, pocket square adjustment* Here's the fun part. Taking something brilliant and making it sound safe.`,
    `*pulls out client file* I've handled trickier sells. This one just needs the right framing. Candy?`,
    `*lays out presentation materials* The client doesn't need to understand WHY it works. Just that it will. Watch and learn.`,
    `*distributes pamphlets preemptively* Before they ask questions I don't want them asking, I'll answer questions they didn't know they had.`,
    `*clears throat warmly* Time to turn art-school-brilliant into board-room-palatable. My specialty.`
  ];
  return pickRandom(variations);
}

export function getMikeWatchingDelmore(_brief: string): string {
  const variations = [
    `*accepts candy* Watch this. Delmore's about to turn our knife into a pillow.`,
    `*settles back* Here comes the magic trick. Same idea, completely different feel.`,
    `*to Burl* This is like watching a lion become a house cat. Same animal, different energy.`,
    `*amused* Delmore's gonna make them think they thought of it. That's the real skill.`,
    `*nods appreciatively* The work doesn't change. Just the words around it. Delmore's a wizard at this.`,
    `*lights cigarette* Some people sell. Delmore... Delmore translates. Big difference.`,
    `*whispers* Watch how many times he says 'authentic.' Clients love that word.`,
    `*observes* The strategy stays the same. The language gets a warm blanket. Classic Delmore.`
  ];
  return pickRandom(variations);
}

export function getCellWatchingDelmore(_brief: string): string {
  const variations = [
    `[GJON]: How does he do it without lying? [VERA]: It's an art form.`,
    `[GJON]: Our words go in. Different words come out. Same meaning. [VERA]: That's translation. [GJON]: Hm.`,
    `[VERA]: He's not changing it, just... softening the edges. [GJON]: The edges were the point. [VERA]: Not to the client.`,
    `[GJON]: Fascinating. He's saying exactly what we said, but nicer. [VERA]: That's his job. [GJON]: Alarming job.`,
    `[VERA]: The client deck looks professional. [GJON]: Our work looked provocative. Tomato, tomato. [VERA]: You said that the same.`,
    `[GJON]: Is he physically incapable of using a sharp word? [VERA]: He's physically capable of getting approval. [GJON]: ...fair.`,
    `[VERA]: I could never do what he does. [GJON]: You could never lie with such warmth. [VERA]: That's not a lie. [GJON]: It's adjacent.`,
    `[GJON]: The client will love this. They won't know why. [VERA]: They don't need to know why. [GJON]: Unsettling.`
  ];
  return pickRandom(variations);
}

export function getDelmoreFinishes(_brief: string): string {
  const variations = [
    `*slides deck across* There. They'll nod through the whole thing. Won't understand a word. But they'll approve it.`,
    `*beams* Done. The deck tells them exactly what they need to hear: that this was their idea all along.`,
    `*offers final candy* Translation complete. Same strategy, new vocabulary. 'Disruptive' becomes 'culturally relevant.'`,
    `*pats deck proudly* They'll feel smart reading this. That's the key. Make them feel smart.`,
    `*pushes deck forward* Everything threatening has become everything reassuring. Same facts, better feelings.`,
    `*satisfied sigh* The work survives the translation. That's all I ask for.`,
    `*stands back* They won't see the knife. They'll see a warm handshake. The cut happens later, gently.`,
    `*gathers materials* The client will say yes. They'll think it was easy. That's how you know I did it right.`
  ];
  return pickRandom(variations);
}

export function getPooleOnTranslation(_brief: string): string {
  const variations = [
    `*reads deck* Remarkable. You've preserved the strategic architecture while removing all threatening clarity. Masterful.`,
    `*nods approvingly* The framework is still there. Hidden. Like load-bearing walls behind the wallpaper.`,
    `*studies document* My methodology survives in the subtext. Impressive camouflage work.`,
    `*makes note* I should document this. 'Client-facing framework translation.' A new discipline.`,
    `*adjusts glasses* The psychological mechanisms are intact but invisible. Like stealth architecture.`,
    `*thoughtfully* You've created what I'd call 'covert strategy.' They buy the tactics, not knowing they're buying the theory.`,
    `*appreciative nod* The deck performs the framework without naming it. That's advanced work.`,
    `*removes glasses* I underestimated the sophistication of client translation. This is its own art form.`
  ];
  return pickRandom(variations);
}

export function getDelmoreToPoole(_brief: string): string {
  const variations = [
    `*offers another candy* It's just talking to people, Dr. Poole. @apparatus — we're ready for final assembly.`,
    `*warm laugh* Just farm-boy common sense, mostly. People want to feel understood, not educated.`,
    `*modest shrug* Clients are just folks with budgets. Treat them like folks, budgets follow.`,
    `*pockets remaining candies* The secret? I genuinely like them. Makes the rest easier.`,
    `*smiles* Dr. Poole, your framework is the engine. I just paint the car pretty colors.`,
    `*hand on shoulder* You build the structure. I make sure nobody notices how tall it is until they're at the top.`,
    `*kindly* Theory is important. So is the human part. I handle the human part.`,
    `*collecting materials* Everyone contributes what they do best. @apparatus — compile time.`
  ];
  return pickRandom(variations);
}

// ===== PHASE 7: FINAL ASSEMBLY =====

export function getApparatusInitiate(_brief: string): string {
  const timestamp = new Date().toISOString().slice(0, 19);
  const variations = [
    `INITIATING FINAL COMPILATION — timestamp ${timestamp}. All agents please confirm inputs.`,
    `COMPILATION SEQUENCE ACTIVATED — ${timestamp}. Receiving all work streams. Stand by.`,
    `FINAL ASSEMBLY PROTOCOL — ${timestamp}. Aggregating inputs from all departments. Processing.`,
    `DOSSIER CONSTRUCTION INITIATED — ${timestamp}. All elements received. Compiling now.`,
    `ARCHIVE ASSEMBLY — timestamp ${timestamp}. Collating strategy, copy, visual, and production elements.`,
    `SYNTHESIS OPERATION BEGUN — ${timestamp}. All inputs verified. Integration commencing.`,
    `FINAL DOSSIER COMPILATION — ${timestamp}. Assets received. Quality check in progress.`,
    `ASSEMBLY TIMESTAMP: ${timestamp}. All departments reporting. Constructing final output.`
  ];
  return pickRandom(variations);
}

export function getMikeFinalWatch(_brief: string): string {
  const variations = [
    `*lights final cigarette* Here it comes. The moment of truth.`,
    `*crosses arms* This is it. Everything we talked about, compressed into one output.`,
    `*stubs out cigarette, lights another* The machine's doing its thing. Now we watch.`,
    `*leans forward* All that work, all that arguing. Comes down to what comes out next.`,
    `*quietly* This is the part I never get used to. Watching it come together.`,
    `*to no one in particular* Every time, I wonder if it'll work. Every time, somehow, it does.`,
    `*taps folder* Twenty-two years. Still gets my heart rate up right here.`,
    `*watches Apparatus work* The brief went in confused. Let's see what comes out clear.`
  ];
  return pickRandom(variations);
}

export function getNadyaTimingFinal(_brief: string): string {
  const variations = [
    `*checks watch* Apparatus has 47 seconds. Then we're over deadline.`,
    `*lights cigarette* Final countdown. The schedule permits no more than two minutes.`,
    `*taps watch* Compilation time is budgeted. We are within budget. Barely.`,
    `*expressionless* Clock continues. Apparatus continues. We shall see which finishes first.`,
    `*stubs cigarette* The deadline approaches like train. Apparatus is on tracks. Interesting.`,
    `*notes time* Thirty seconds of margin remaining. Use them wisely, machine.`,
    `*checks clipboard* Final assembly within parameters. Impressive. Almost concerning.`,
    `*watches intently* The schedule predicted this moment. The schedule is always right.`
  ];
  return pickRandom(variations);
}

export function getDelmoreReadyToExplain(_brief: string): string {
  const variations = [
    `*clutches deck* I'm ready to explain whatever comes out.`,
    `*pats presentation materials* Whatever appears, I've got talking points prepared.`,
    `*straightens tie* Ready on my end. The explanation is pre-translated.`,
    `*holds pamphlet* Client questions anticipated. Answers prepared. We're covered.`,
    `*nods reassuringly* Don't worry. I can spin anything into something they'll buy.`,
    `*reviews notes one more time* Whatever the output, I know what story to tell around it.`,
    `*confident smile* This is the easy part. The work is good. The words will follow.`,
    `*pocket full of candies* Ready for the reveal. And the explanation. And the follow-up questions.`
  ];
  return pickRandom(variations);
}

export function getApparatusComplete(_brief: string): string {
  const variations = [
    `COMPILATION COMPLETE — The dossier is assembled. The work exists. It simply... is.`,
    `SYNTHESIS FINALIZED — All elements integrated. The advertisement exists in final form.`,
    `ASSEMBLY CONCLUDED — Dossier complete. Campaign materials ready for deployment.`,
    `COMPILATION STATUS: COMPLETE — The work is done. The machine has spoken.`,
    `FINAL OUTPUT GENERATED — All inputs processed. Campaign exists in deliverable state.`,
    `DOSSIER ASSEMBLED — timestamp captured. The work is no longer theoretical. It is real.`,
    `COMPILATION: SUCCESSFUL — Strategy, copy, visual unified. Ready for world.`,
    `SYNTHESIS COMPLETE — The brief has been answered. The advertisement awaits deployment.`
  ];
  return pickRandom(variations);
}

export function getMikeFinalReaction(_brief: string): string {
  const variations = [
    `*nods slowly* That'll do. That'll do.`,
    `*slow exhale* Damn. It actually came together.`,
    `*satisfied grunt* Not bad for a bunch of weirdos locked in a room.`,
    `*quiet approval* Twenty-two years. Still works every time. Don't know how.`,
    `*lights celebratory cigarette* There it is. The thing the client actually needed.`,
    `*crosses arms, pleased* The brief asked for one thing. We gave them something better.`,
    `*final nod* Case closed. Until the next one.`,
    `*to the room* Good work, everyone. Even you, Poole.`
  ];
  return pickRandom(variations);
}

export function getBurlFinalReaction(_brief: string): string {
  const variations = [
    `*stares at final layout* The picture came together. Somehow it always does.`,
    `*steps back, satisfied* That's it. That's the image I've been seeing in my head all day.`,
    `*removes glasses, nods* Ugly-beautiful. Just like I promised. Just like it should be.`,
    `*quiet pride* The visual tells the truth the words can't. That's the job.`,
    `*studies final output* It's not pretty. It's honest. That's what they're buying.`,
    `*long pause, then* ...yeah. That's the picture. That's the one.`,
    `*closes reference book* Done. The image does what images do. Explains without explaining.`,
    `*satisfied sigh* Every time I think it won't work, it works. Visual speaks for itself.`
  ];
  return pickRandom(variations);
}

export function getCellFinalReaction(_brief: string): string {
  const variations = [
    `[VERA]: It's... not what I expected. [GJON]: It never is. [THURSDAY]: *small smile*`,
    `[VERA]: Well done, everyone. [GJON]: Well done, Thursday. [THURSDAY]: *already thinking about next project*`,
    `[GJON]: The words survived. Better than survived. [VERA]: I'm actually proud. [THURSDAY]: *nods once*`,
    `[VERA]: The copy holds up. [GJON]: The copy punches up. [THURSDAY]: *permits self rare satisfaction*`,
    `[GJON]: That's what we meant. Exactly. [VERA]: For once, we agree. [THURSDAY]: *slightest smile*`,
    `[VERA]: It worked. [GJON]: It WORKS. Present tense. [THURSDAY]: *quietly pleased*`,
    `[GJON]: Thursday wins again. [VERA]: We all won. [THURSDAY]: *accepts compliment with silence*`,
    `[VERA]: I didn't think Option C would translate. [GJON]: That's why we voted. [THURSDAY]: *exhales contentedly*`
  ];
  return pickRandom(variations);
}

export function getPooleFinalReaction(_brief: string): string {
  const variations = [
    `*removes glasses, cleans them* The framework held. The system works.`,
    `*makes final note* For the record: the Poole System successfully guided this campaign.`,
    `*satisfied nod* Theory became practice. Practice became advertisement. The cycle completes.`,
    `*studies output* Remarkable. The permission architecture is invisible but present. As intended.`,
    `*thoughtfully* I'll document this case. Section Seven of my next publication.`,
    `*removes glasses* The methodology produced results. As it always does. As it must.`,
    `*closes notebook* Another successful application of the framework. The system is validated again.`,
    `*quiet pride* They won't see the strategy. They'll feel it. That's the Poole System at work.`
  ];
  return pickRandom(variations);
}

export function getNadyaFinalReaction(_brief: string): string {
  const variations = [
    `*checks watch* Under deadline. *rare smile* Acceptable.`,
    `*stubs cigarette* On time. As scheduled. The schedule is never wrong.`,
    `*notes final time* Complete. Within parameters. The five-year plan continues successfully.`,
    `*closes planner* Another delivery. Another deadline met. This is the way.`,
    `*permits small satisfaction* The schedule predicted completion at this time. Schedule was correct.`,
    `*lights celebratory cigarette* Done. Before the deadline. A good day.`,
    `*checks multiple watches* All confirm: on time. The schedule is satisfied.`,
    `*almost smiles* Completion within deadline. I expect nothing less. I receive nothing less.`
  ];
  return pickRandom(variations);
}

export function getDelmoreFinalReaction(_brief: string): string {
  const variations = [
    `*pockets remaining candies* I'll take it from here. The client will love it. They won't know why. But they will.`,
    `*beams* Beautiful work, everyone. Now let me make sure they appreciate it properly.`,
    `*gathers presentation* Time to deliver the good news. In language they'll understand.`,
    `*warm smile* The hard part's done. The easy part — talking to people — that's my favorite part.`,
    `*collects materials* Another successful translation awaits. The client will sign. I guarantee it.`,
    `*pocket full of emergency candies* Ready for the client meeting. Armed and ready.`,
    `*stands proudly* This is good work. They'll know it's good work. Eventually. After I explain.`,
    `*heading out* The campaign goes to client tomorrow. They're going to love it. Even the uncomfortable parts.`
  ];
  return pickRandom(variations);
}

export function getApparatusClosure(_brief: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const variations = [
    `DOSSIER ARCHIVED — ${date}. The brief has been answered. We wait now — as we always do — for the next question. END TRANSMISSION —`,
    `CAMPAIGN DOCUMENTATION COMPLETE — ${date}. File archived. Awaiting subsequent brief. APPARATUS STANDING BY —`,
    `ARCHIVE TIMESTAMP: ${date}. All elements preserved. System returns to ready state. END —`,
    `FINAL LOG ENTRY — ${date}. Dossier delivered. The work exists now in the world. TRANSMISSION CLOSED —`,
    `DOCUMENTATION SEALED — ${date}. Campaign complete. The machine rests. Until called again. END —`,
    `SYSTEM STATUS: CAMPAIGN ARCHIVED — ${date}. Ready for next input. The work continues. ALWAYS CONTINUES —`,
    `CASE FILE CLOSED — ${date}. Brief answered. Assets compiled. The next brief awaits. APPARATUS READY —`,
    `COMPLETION LOG — ${date}. This work is done. Other work will come. The system does not forget. END TRANSMISSION —`
  ];
  return pickRandom(variations);
}

// Reset cache when starting new brief (call this at start of workflow)
export function resetDialogueCache(): void {
  cachedBrief = '';
  cachedBriefInfo = null;
}

// ===== APOLOGY CAMPAIGN DIALOGUE =====
// These functions provide randomized dialogue for the Proactive Apology workflow.
// Each function returns a different variation every call to prevent repetitive runs.

export function getApologyMikeScenarioReaction(companyName: string, scenarioTitle: string, severity: string, category: string, description: string): string {
  const variations = [
    `*slams folder on table* Alright, here's the situation: "${scenarioTitle}" — ${severity} severity, ${category} category. ${description} Twenty-two years I've been doing this, and I've never seen a company admit fault BEFORE the fault happens. That's the grift. That's the angle. We're making ${companyName} the most honest corporation on earth — for things they haven't done yet.`,
    `*lights cigarette, spreads dossier* Listen up. ${companyName} is staring down "${scenarioTitle}" — ${severity}, ${category}. ${description} Here's the play: we apologize first. Before the press. Before the lawsuits. Before the hashtag. We turn ${companyName} from a villain-in-waiting into the most transparent company in their industry. It's insane. It's also brilliant.`,
    `*pins scenario to corkboard* "${scenarioTitle}." ${severity}. ${category}. ${description} I've investigated worse. But I've never investigated something that hasn't happened yet. This is pre-emptive accountability, people. We're writing the apology that makes the crisis unnecessary. Or at least, survivable.`,
    `*stubs cigarette, opens case file* New case. Big one. ${companyName} needs to apologize for "${scenarioTitle}" — and it hasn't even happened yet. ${description} The ${category} angle is where this gets interesting. ${severity} severity means the apology can't be cute. It has to be real. Realer than real. Authentically preemptive.`,
    `*spreads photos across table* "${scenarioTitle}" — ${severity}. Let that sink in. ${description} ${companyName} wants to get ahead of this. Not with legal. Not with PR. With US. An ad agency writing apologies for disasters that might never happen. It's the most honest dishonesty I've ever been part of. Let's make it sing.`,
    `*cracks knuckles, reads brief twice* ${companyName}. "${scenarioTitle}." ${severity} severity, ${category} category. ${description} There's a reason they came to us instead of a crisis firm. They don't want crisis management — they want crisis OWNERSHIP. We're going to help them own a disaster before it exists. That's either genius or madness. Either way, I'm in.`,
  ];
  return pickRandom(variations);
}

export function getApologyPooleScenarioReaction(category: string): string {
  const variations = [
    `*adjusts glasses, leans forward* Fascinating risk profile. The ${category} dimension here triggers Poole Principle Seventeen — "Anticipatory Accountability." I can already see the framework forming. The consumer psychology of pre-emptive apology is virtually unexplored territory.`,
    `*strokes chin thoughtfully* The ${category} vector is particularly interesting. My research in Helsinki touched on something adjacent — what I call "pre-emptive contrition architecture." The framework practically builds itself when the apology precedes the offense.`,
    `*pulls out worn notebook* Yes. The ${category} element maps perfectly to Principle Twenty-Three — "The Confession Paradox." When you apologize before the crime, you're not seeking forgiveness. You're creating a new category of corporate rhetoric entirely.`,
    `*makes rapid notes* Extraordinary. A ${category} scenario subjected to preemptive accountability analysis. I presented a theoretical model for exactly this at the Santiago conference in 2019. No one believed it would have practical application. They were wrong.`,
    `*removes glasses dramatically* The ${category} dimension creates what I call a "temporal guilt displacement" — the apology exists in a future where the harm hasn't occurred. This is new psychological territory. The Poole System was BUILT for moments like this.`,
    `*sketches preliminary diagram* See, the ${category} risk creates a fascinating permission structure. The consumer doesn't know they need to forgive yet. We're creating the emotional architecture for forgiveness before the need arises. This is Poole Principle Eleven in its purest form.`,
  ];
  return pickRandom(variations);
}

export function getApologyCellScenarioReaction(severity: string): string {
  const variations = [
    `[GJON]: A ${severity} scenario. This is either the most ethical advertising ever conceived, or the most cynical. [VERA]: Those aren't mutually exclusive. [THURSDAY]: *already writing notes on index card* ...the headline is forming.`,
    `[VERA]: This has real weight to it. ${severity} — that's not something we can treat lightly. [GJON]: We never treat anything lightly. That's our problem. [THURSDAY]: *stares at fluorescent light, begins scribbling*`,
    `[GJON]: ${severity}? Good. The worse the scenario, the better the apology. Tragedy is the engine of great copy. [VERA]: That's dark, even for you. [THURSDAY]: *nods once, opens fresh notebook*`,
    `[VERA]: A ${severity} scenario calls for careful, measured language. [GJON]: A ${severity} scenario calls for HONEST language. [THURSDAY]: *slides paper across — it just says "both"*`,
    `[GJON]: The ${severity} rating changes everything. This can't read like a press release. It has to read like a confession. [VERA]: Or a love letter to the people they might hurt. [THURSDAY]: *closes eyes, thinking*`,
    `[VERA]: At ${severity} level, every word carries triple weight. [GJON]: Then let's make every word earn its place. [THURSDAY]: *already on third index card, writing faster than Vera can read*`,
  ];
  return pickRandom(variations);
}

export function getApologyBurlScenarioReaction(category: string): string {
  const variations = [
    `*squints at scenario brief* Already got pictures forming. ${category} disasters have a visual language — I know what this looks like. Documentary feeling. Evidence photography.`,
    `*scratches chin* I've photographed worse. Or imagined photographing worse. ${category} — that's got a color. A texture. Something between government report and confession letter.`,
    `*stares into middle distance* ${category} imagery. I'm seeing something austere. Not pretty — truthful. The kind of photograph that makes you uncomfortable because it refuses to be anything other than what it is.`,
    `*flips through mental catalog* ${category}... I shot something adjacent for a pharma client in '14. Same weight. The visual grammar of institutional failure has a specific look. I know that look.`,
    `*makes frame with fingers* ${category} scenarios want a specific kind of ugly. Corporate documentary. Internal audit made public. The aesthetic of someone cleaning out their desk.`,
    `*pulls out reference book* ${category} visual territory. Lots of people get this wrong — they go dramatic. Explosions. Chaos. No. The scariest images are the quiet ones. A boardroom. An empty factory. A headline no one saw coming.`,
  ];
  return pickRandom(variations);
}

export function getApologyNadyaScenarioReaction(timeHorizon: string): string {
  const variations = [
    `*checks watch* ${timeHorizon} timeline. Noted. I'll build production schedule around this horizon. How many deliverables? I need numbers.`,
    `*lights cigarette* ${timeHorizon}. The schedule will account for this. Give me deliverable count and I give you dates. Non-negotiable dates.`,
    `*clipboard in hand* ${timeHorizon} window. This affects production timeline. Print lead times, media booking windows, social deployment sequence — all calibrated to horizon.`,
    `*taps pen on table* ${timeHorizon}. Interesting. The production schedule adapts. Some timelines demand urgency. Others demand patience. Both demand accountability.`,
    `*consults five-year plan* ${timeHorizon}. Already factored into the production matrix. The schedule exists whether we are ready or not. I suggest we be ready.`,
    `*makes note* ${timeHorizon} horizon. This determines deployment cadence. Print before digital. OOH before social. The schedule has opinions about sequence.`,
  ];
  return pickRandom(variations);
}

export function getApologyDelmoreScenarioReaction(scenarioTitle: string, affectedParties: string[]): string {
  const variations = [
    `*takes notes, distributes hard candies* The client context is critical here. "${scenarioTitle}" — I need to understand who we're apologizing TO. The affected parties: ${affectedParties.join(', ')}. I'll prepare the translation framework.`,
    `*adjusts collar, offers mints* Now, "${scenarioTitle}" is a sensitive one. The people we're addressing — ${affectedParties.join(', ')} — they deserve careful language. I'll make sure the corporate-speak doesn't strip away the humanity.`,
    `*smooths notes* "${scenarioTitle}." Heavy. The audiences here — ${affectedParties.join(', ')} — each need a slightly different version of the truth. Same facts, different emotional registers. That's translation work.`,
    `*pulls out client file* I've handled trickier messaging. "${scenarioTitle}" affects ${affectedParties.join(', ')} — each group needs to feel seen. My job is making sure the apology sounds like it was written by someone who actually cares. Even if it was written by us.`,
    `*warm smile, candy bowl circulating* "${scenarioTitle}" — affects ${affectedParties.join(', ')}. Important folks. Real people with real concerns. The translation needs to land differently for each group. Board-room to kitchen-table. That's my range.`,
    `*distributes pamphlets preemptively* Before anyone asks, I've already mapped the stakeholder groups for "${scenarioTitle}": ${affectedParties.join(', ')}. Each gets a tailored version. The apology is one. The languages are many.`,
  ];
  return pickRandom(variations);
}

export function getApologyApparatusScenarioReaction(category: string, severity: string, timeHorizon: string, affectedCount: number): string {
  const variations = [
    `SCENARIO DATA LOGGED — Category: ${category} | Severity: ${severity} | Timeline: ${timeHorizon} | Affected parties: ${affectedCount} groups identified — INDEXING RISK VECTORS —`,
    `PROCESSING SCENARIO PARAMETERS — ${category} | ${severity} severity | ${timeHorizon} horizon | ${affectedCount} stakeholder groups — COMPILATION FRAMEWORK INITIALIZED —`,
    `INPUT RECEIVED — Risk class: ${category} | Impact level: ${severity} | Temporal window: ${timeHorizon} | Stakeholder count: ${affectedCount} — STANDING BY FOR CREATIVE INPUT —`,
    `SCENARIO INDEXED — Vector: ${category} | Grade: ${severity} | Window: ${timeHorizon} | Impact radius: ${affectedCount} groups — READY TO COMPILE DELIVERABLES —`,
    `DATA INTEGRATION COMPLETE — ${category} scenario | ${severity} classification | ${timeHorizon} deployment window | ${affectedCount} affected constituencies — AWAITING CREATIVE DIRECTION —`,
    `RISK PROFILE CAPTURED — Domain: ${category} | Severity rating: ${severity} | Planning horizon: ${timeHorizon} | Stakeholder map: ${affectedCount} nodes — APPARATUS READY —`,
  ];
  return pickRandom(variations);
}

export function getApologyPooleStrategy(scenarioDamage: string, companyName: string): string {
  const variations = [
    `*approaches whiteboard with fervor* The Proactive Apology Matrix identifies the core tension: "${scenarioDamage}" — but this isn't about the damage. It's about OWNING the narrative before it exists. We're creating "anticipatory accountability" — contrition without admission, guilt without liability. ${companyName} doesn't need to BE sorry. They need to PERFORM sorry. And performance, when done with enough conviction, becomes truth.`,
    `*uncaps three markers simultaneously* Listen. "${scenarioDamage}" — that's the surface problem. The deeper problem is that ${companyName} exists in a temporal paradox: they must apologize for something that hasn't happened. My framework resolves this through what I call "pre-emptive moral authority." You apologize first, you own the moral high ground forever. It's strategic empathy weaponized for brand equity.`,
    `*distributes handout no one asked for* I've modeled this exact scenario type. "${scenarioDamage}" represents a failure pathway — but we're intercepting it at the INTENTION stage. The Poole System's Principle Seventeen states: "Confession before transgression creates a debt that can never be collected." ${companyName} will owe the public an apology they've already paid. The books balance before they're opened.`,
    `*draws elaborate diagram* The key insight: "${scenarioDamage}" hasn't happened, may never happen, but the FEAR of it is real. And fear is a consumer emotion. We're not apologizing for damage — we're apologizing for the possibility of damage. And possibility, in the consumer mind, is indistinguishable from certainty. ${companyName} becomes the brand that faced its own shadow. That's Poole Principle Twenty: "The confession is the product."`,
    `*removes glasses for emphasis* What Slab identified as risk, I recognize as OPPORTUNITY. "${scenarioDamage}" — imagine a world where ${companyName} said this out loud, publicly, before anyone else could. The reframe is seismic: from "corporation that might fail" to "corporation brave enough to admit it." We're selling accountability as aspiration. My framework for this has been waiting seven years for this exact moment.`,
    `*photographs whiteboard from seventeen angles* "${scenarioDamage}" — the damage model maps directly to the consumer guilt-trust topology. ${companyName} has a once-in-a-generation opportunity: apologize on their own terms, on their own timeline, with their own creative direction. The Poole System transforms this from crisis response into CULTURAL POSITIONING. We're not writing an apology. We're writing a manifesto of institutional self-awareness.`,
  ];
  return pickRandom(variations);
}

export function getApologyMikeOnStrategy(): string {
  const variations = [
    `*leans against wall, lights cigarette* Here we go with the diagrams again. Five bucks says "anticipatory accountability" appears at least three more times.`,
    `*checks watch ostentatiously* Poole's on a roll. Wake me when there's something I can use. Something that doesn't require a PhD to understand.`,
    `*mutters to Burl* How many made-up words is that now? I've lost count. But somewhere in there is an actual insight. Always is, with Poole.`,
    `*crosses arms* I gave him the insight in two sentences. He's going to give it back in twenty diagrams and a framework named after himself. The man's consistent, I'll give him that.`,
    `*lights another cigarette* The man's never met a simple truth he couldn't make sound like a doctoral thesis. But he's usually right. Eventually. After the third revision.`,
    `*stares at ceiling* You know what? Let him cook. His frameworks make the client feel like they're buying something sophisticated instead of just a good ad. There's value in that.`,
  ];
  return pickRandom(variations);
}

export function getApologyCellOnCopy(): string {
  const variations = [
    `[GJON]: Is this going somewhere, or just... around? [VERA]: Let him finish. The framework gives us guardrails. [THURSDAY]: *already on third index card, writing faster*`,
    `[VERA]: This gives us a foundation to write against. [GJON]: I don't need a foundation. I need a deadline and a cigarette. [THURSDAY]: *slides completed draft across table*`,
    `[GJON]: While Poole diagrams, Thursday writes. This is how it always works. [VERA]: Don't dismiss the process— [GJON]: I'm not dismissing. I'm observing. [THURSDAY]: *nods, keeps writing*`,
    `[VERA]: The framework is taking shape. I can see the copy structure forming. [GJON]: The copy structure formed twenty minutes ago. Thursday's been writing this whole time. [VERA]: ...has she? [THURSDAY]: *holds up six completed index cards*`,
    `[GJON]: Strategy is what people talk about when they're not ready to write. [VERA]: That's unfair. [GJON]: It's accurate. [THURSDAY]: *pauses writing, looks up* Both. *resumes writing*`,
    `[VERA]: We should wait for the full framework before— [GJON]: Thursday's not waiting. [VERA]: Thursday never waits. [THURSDAY]: *slides paper to Vera without comment*`,
  ];
  return pickRandom(variations);
}

export function getApologyBurlOnVisuals(companyName: string): string {
  const variations = [
    `*sketches rapidly while Poole talks* That reframe... I can see the visual. One image. Big. Confrontational. ${companyName}'s brand language but cracked open. Like finding the truth inside a corporate report.`,
    `*pulls out camera reference* I know what this campaign looks like. It looks like ${companyName}'s annual report had a nervous breakdown. Clean lines, brand fonts, but the message underneath makes you stop breathing for a second.`,
    `*frames imaginary shot* Not pretty. Not ugly. TRUE. ${companyName}'s visual identity, but deployed for confession instead of celebration. Same colors, different gravity. I can see the whole campaign.`,
    `*stares at Poole's diagram* All those arrows point to one picture. And I know what it is. ${companyName}'s brand world, but haunted. Like a showroom after everyone's gone home.`,
    `*makes notes rapidly* The visual grammar is clear. ${companyName}'s design language — but the version you'd use if you were telling the truth for the first time. Corporate confessional minimalism. I'm already composing the shot.`,
    `*pulls out mood board* See, most agencies would go dramatic. Fire. Chaos. Headlines. Wrong. The most devastating visual is the quiet one. ${companyName}'s logo on a white background, and above it, the words nobody expected them to say.`,
  ];
  return pickRandom(variations);
}

export function getApologyCellThursdayPresents(headline: string, keyMessage: string): string {
  const variations = [
    `[THURSDAY]: *places index card face-down, walks to window* [VERA]: *flips card* ...oh. OH. "${headline}" [GJON]: *reads it twice* ...that's the one. That's the line that makes people screenshot and share.`,
    `[THURSDAY]: *slides paper across without looking up* [VERA]: Wait— "${headline}" — how did you— [GJON]: Don't ask how. Just accept it. Thursday sees things we don't.`,
    `[THURSDAY]: *taps finished page once, then silence* [VERA]: *reads* "${headline}" ...I have chills. Actual chills. [GJON]: *slowly claps* The weird one wins again.`,
    `[THURSDAY]: *paper airplane containing the headline lands in center of table* [VERA]: Did you just— "${headline}" — oh. That's devastating. [GJON]: That's Thursday.`,
    `[THURSDAY]: *presents index card reading "${headline}"* [VERA]: This is... uncomfortable in exactly the right way. [GJON]: It's the most honest thing a corporation has never said. Until now.`,
    `[THURSDAY]: *holds up card: "${headline}"* [VERA]: I was going to object, but I can't. It's too good. [GJON]: It's not good. It's CORRECT. There's a difference.`,
  ];
  const base = pickRandom(variations);
  return `${base} [VERA]: The Cell votes 2-1 in favor. Thursday's direction carries. ${keyMessage ? `[GJON]: And the supporting angle — "${keyMessage}" — that's the secondary. Together they're a campaign.` : ''} Again.`;
}

export function getApologyMikeOnHeadline(): string {
  const variations = [
    `*settles into chair, lights cigarette* The Cell's fighting again. That's how you know it's working. *reads Thursday's line* Yeah. That's the gut punch. That's our headline.`,
    `*slow exhale* Damn. Thursday did it again. Every time I think I know where the weird one's going to land, she goes somewhere realer. That's our headline. Fight me on it.`,
    `*crosses arms, satisfied* Kid's got something. That's the kind of line that makes people uncomfortable. Good uncomfortable. The kind where they call their mother after reading it.`,
    `*nods slowly, stubs cigarette* Twenty-two years. Still gets me when Thursday does that thing. The line nobody expects, that everybody needed. That's the headline. Lock it.`,
    `*to the room* You hear that sound? That's the sound of a headline that's going to win awards and make executives sweat simultaneously. That's the sweet spot. That's Thursday.`,
    `*lights celebratory cigarette* There it is. The thing the client didn't know they needed to say. The thing nobody says until someone says it, and then it's obvious. That's our headline.`,
  ];
  return pickRandom(variations);
}

export function getApologyPooleOnHeadline(): string {
  const variations = [
    `*reads over shoulder* Structurally unsound according to the framework... yet somehow it maps perfectly to the reframe. Remarkable. I'll need to revise Section Four.`,
    `*adjusts glasses in astonishment* The Cell has produced something my framework cannot explain. This is either a validation or a refutation of everything I've theorized. Possibly both.`,
    `*makes rapid notes* Fascinating. The headline violates Principle Three while honoring Principle Seven. A theoretical paradox that works emotionally. I need to document this immediately.`,
    `*removes glasses entirely* Against all theoretical odds... it works. The framework predicted a different outcome. The framework was wrong. The headline is right. *writes this down*`,
    `*speechless for three full seconds* ...I'm going to need to rewrite Chapter Nine. The Poole System didn't predict this. The Poole System should have predicted this. That's how I know it's correct.`,
    `*quietly* The framework accounts for rational persuasion. What Thursday does isn't rational. It's something older, deeper. Pre-linguistic. And it works. Every time. I should study this.`,
  ];
  return pickRandom(variations);
}

export function getApologyNadyaOnProgress(): string {
  const variations = [
    `*checks watch* Copy phase complete. You have your headline. Moving to visual. The schedule proceeds on schedule.`,
    `*stubs cigarette* Headline locked. Visual phase begins. The schedule does not celebrate — it advances.`,
    `*expressionless* Copy delivered within acceptable parameters. Next phase. The clock continues.`,
    `*taps clipboard* Creative approved. Production timeline unaffected. Proceed to visual direction. I'll be timing.`,
    `*checks multiple watches* Headline finalized. Two minutes ahead of schedule. Do not waste this gift.`,
    `*lights fresh cigarette* Copy done. Good. Moving forward. The production schedule has no time for admiration — only execution.`,
  ];
  return pickRandom(variations);
}

export function getApologyDelmoreOnHeadline(headline: string): string {
  const variations = [
    `*reads quietly, nods* The client is going to need some... softening on "${headline}" — but the core is strong. I can already see the presentation deck forming.`,
    `*offers candy while reading* "${headline}" — that's powerful. My job is making sure the client feels that power as excitement, not threat. I'll prepare the appropriate cushioning.`,
    `*makes notes in margin* Beautiful work. Now I need to translate this into board-room language. "${headline}" becomes "a bold stakeholder alignment initiative" — same knife, friendlier packaging.`,
    `*warm smile* The creative is there. "${headline}" is the kind of line that wins awards first and approval second. I'll reverse that order for the client presentation.`,
    `*pockets candy, studies headline* "${headline}" — I love it. And I know exactly how to make the client love it. Three slides of context before the reveal. By the time they see it, they'll think it was their idea.`,
    `*distributes comforting mints* The work is brilliant. Now I make it feel safe. "${headline}" — the client hears "brave." I'll make sure they also hear "strategic." That's the translation.`,
  ];
  return pickRandom(variations);
}

export function getApologyBurlVisualDirection(companyName: string, visualConcept: string, colorPalette: string[], typography: string): string {
  const variations = [
    `*pins reference images to board, clears table* Everyone back up. I need to think in pictures. It's ${companyName}'s brand aesthetic — but cracked open. ${visualConcept || 'The same clean lines, but deployed for confession instead of celebration.'} Colors: ${colorPalette?.join(', ') || 'Brand palette, desaturated'}. Type: ${typography || 'Something official that has been through things'}. This isn't pretty advertising. This is documentary. This is evidence.`,
    `*arranges swatches with authority* Alright, the visual world is forming. ${companyName}'s identity, but turned confessional. ${visualConcept || 'Corporate design language subverted for radical honesty.'} The palette: ${colorPalette?.join(', ') || 'Desaturated brand colors'}. Typography: ${typography || 'Heavy, weathered, institutional'}. Every image should feel found, not staged.`,
    `*creates space, pins references* I know what this looks like. ${companyName}'s visual DNA — the fonts, the colors, the grid — but used to tell the truth instead of sell. ${visualConcept || 'Clean lines cracked open to reveal uncomfortable honesty.'} Colors: ${colorPalette?.join(', ') || 'Brand palette pulled toward documentary gray'}. Typography: ${typography || 'The typeface equivalent of reading someone their rights'}. Beautiful and uncomfortable. Exactly right.`,
    `*spreads prints across table* The direction is clear. ${companyName}'s brand system, but the version you'd use at a congressional hearing. ${visualConcept || 'Same visual language, but the message changes everything.'} Palette: ${colorPalette?.join(', ') || 'Muted institutional tones'}. Type: ${typography || 'Authoritative meets vulnerable'}. Not pretty. True. That's always better.`,
    `*sketches rapidly* Here's what I'm seeing for ${companyName}. ${visualConcept || 'Their brand world, but haunted — like corporate photography that accidentally captured something real.'} Colors: ${colorPalette?.join(', ') || 'Desaturated, institutional, honest'}. Typography: ${typography || 'Something between government form and love letter'}. The aesthetic of uncomfortable truth, made beautiful.`,
    `*pulls out reference folder* The visual grammar is specific. ${companyName} normally projects confidence — we're projecting vulnerability using the SAME visual tools. ${visualConcept || 'Confessional minimalism, corporate documentary aesthetic.'} Colors: ${colorPalette?.join(', ') || 'Their palette, but wounded'}. Type: ${typography || 'Heavy serif for headlines, light sans for body — the contrast is the message'}. Ugly-beautiful. My specialty.`,
  ];
  return pickRandom(variations);
}

export function getApologyCompilationReaction(index: number, total: number, companyName: string, hasImages: boolean): string {
  const mikeVariations = [
    `*watches Apparatus work, lights final cigarette* Here it comes. Everything we argued about, compressed into one output.`,
    `*crosses arms, observing* This is the part that never gets old. Watching all the pieces come together into something that actually means something.`,
    `*quietly* All that fighting, all that diagrams-and-theory... and it works. It always works. I don't know how, but it does.`,
    `*stubs cigarette* Campaign ${index + 1} of ${total}. Compiling now. Every time this happens, I'm surprised. And I'm never surprised.`,
    `*leans forward* Here it is. The brief came in confused. Let's see what comes out clear.`,
    `*to no one in particular* ${companyName}'s about to have the most honest advertising in their industry. And they didn't even ask for it.`,
  ];
  return pickRandom(mikeVariations);
}

export function getApologyNadyaCompilationReaction(hasImages: boolean): string {
  const variations = [
    `*checks all watches* Compilation within deadline. ${hasImages ? 'Images generated.' : 'Text assets compiled.'} The schedule is satisfied. Barely.`,
    `*stubs cigarette* On time. As always. ${hasImages ? 'Visual assets rendered.' : 'Asset suite assembled.'} The schedule does not celebrate — it completes.`,
    `*notes final time* Production complete. Within parameters. ${hasImages ? 'DALL-E assets included.' : 'HTML assets finalized.'} Nadya is satisfied. A rare condition.`,
    `*checks clipboard* All deliverables accounted for. ${hasImages ? 'Generated images integrated.' : 'Mockups compiled.'} The deadline met. Like a train arriving on time. Expected, yet somehow still impressive.`,
    `*permits small satisfaction* Done. ${hasImages ? 'With visual assets.' : 'With template assets.'} Before the deadline. The schedule predicted this outcome. The schedule is always right.`,
    `*lights celebratory cigarette (rare)* Compilation successful. ${hasImages ? 'Images rendered and embedded.' : 'HTML deliverables assembled.'} We proceed to the next. Or we rest. The schedule permits either.`,
  ];
  return pickRandom(variations);
}

