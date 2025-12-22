# Sippin — Final Paper (Structured Draft)

This document is a structured draft of the final paper, strictly following the `PAPER_ASSIGNMENT_GUIDE` sections. It synthesizes the project artifacts and empirical data available in the workspace: the assignment guide, design notes, summative user testing results (questions + times & scores), testing guide, and AAARRR analytics plan.

**1. Abstract (100–150 words)**

Sippin is a React Native Web PWA for cocktail enthusiasts that supports logging drinks, creating recipes, discovering cocktails from available ingredients, and social sharing. Research question: How can motivational design principles be applied to drive Product-Led Growth (PLG) while avoiding dark patterns? Materials: a hi‑fi prototype with gamification (badges, streaks), social feed, and discovery features; analytics instrumentation (AAARRR events); and a summative usability study (N=8) mapped to PIRATE tasks. Method: task-based usability sessions + UTAUT questionnaire. Results: high perceived usefulness and ease-of-use (PE=4.47, EE=4.78), moderate social influence (SI=3.88) and lower behavioral intention (BI=3.33). Reflection: design choices improved activation but require social & retention-focused iteration while preserving transparency.

**2. Introduction (250–500 words)**

Warrant for the research (50–100 words)

- Digital social discovery products scale by converting new users into active, retained customers. Motivational design (nudges, PSD, gamification, social influence) can accelerate activation and referrals, enabling PLG. However, persuasive techniques risk becoming dark patterns, raising ethical and regulatory concerns (e.g., DSA). This study aims to balance effective motivational design with user autonomy and transparency.

Problem statement (100–200 words)

- The practical challenge addressed is how to design Sippin so that signups reliably translate into meaningful first actions (first cocktail logged), continued engagement (repeated logs, friend interactions), and referrals — without resorting to manipulative or deceptive design. Early user testing reveals solid usability for core flows but moderate social influence and low behavioral intention scores, indicating that activation does not yet translate into a high intent to keep using the product. Specific UX frictions (ingredient selection clarity, photo handling, feature discoverability) create drop-offs during activation.

Research objective

- Core question: How to design Sippin to incorporate motivational design (FBM, PSD, SDT, social influence, gamification) to ensure PLG while avoiding dark patterns? Objectives: (1) map implemented designs to theory, (2) evaluate usability and acceptance through a summative study and UTAUT metrics, (3) derive ethically-grounded design and analytics recommendations to improve activation, referral, and retention.

**3. Background / Related Work (650–1000 words)**

Information on the application domain (150–250 words)

- Cocktail-focused social/mobile apps bridge personal hobby tracking, social sharing and discovery of drinks and venues. They matter because mixology is experiential and social: users enjoy documenting, sharing, and re-creating unique recipes. Existing mobile solutions combine recipe databases, discovery, and commerce (affiliate shop links). For a PLG strategy, core product experiences (first post, discovery features, share/referral loops) are central to the flywheel: acquisition → activation → retention → referral → revenue.

Theories/models on motivation (250–500 words)

- Fogg's Behavioral Model (FBM): behavior occurs when Motivation × Ability × Prompt are above an activation threshold. Applied to Sippin: reduce ability friction (simple post flow), increase motivation (badges, social validation), and deliver timely triggers (contextual prompts after initial success).
- Persuasive System Design (PSD): principles (primary task support, dialogue support, system credibility, social support) guide feature-level choices: suggestions and personalization (primary task), praise and rewards (dialogue), transparent source credibility (system credibility), and friend lists / social proof (social support).
- Self-Determination Theory (SDT): autonomy, competence, relatedness. Gamification elements (badges, streaks, progress) should support competence; social features support relatedness; privacy and opt-in preserve autonomy. Cognitive Evaluation Theory warns that extrinsic rewards (badges) can undermine intrinsic motivation if perceived as controlling — design should frame badges informationally.
- Theory of Planned Behaviour (TPB): attitude, subjective norm, perceived behavioral control shape behavioral intention. UTAUT measures used in the study map onto these constructs.
- Nudge theory & Hansen & Jespersen grid: classify nudges by transparency (transparent vs. non-transparent) and cognitive mode (automatic vs. reflective) — guiding ethical choices (favor transparent nudges affecting reflective processes when autonomy matters).

State of the Art (250–500 words)

- Similar systems combine recipe databases with social feeds (e.g., cocktail communities, recipe-sharing apps). Common PLG practices include emphasizing first-time success (easy posting), leveraging social proofs (top posts), and referral incentives. Shortcomings in existing products often relate to privacy defaults, opaque notification behaviors, and manipulative monetization. The literature suggests mixed outcomes for gamification: effective for novices, risky for long-term intrinsic engagement. This motivates Sippin's transparent-by-default approach (private posts, explicit notification controls) documented in the design notes.

**4. Design / Materials (300–800 words)**

Hi‑Fi prototype

- Sippin is implemented as a React Native Web PWA. Core screens: Add (post log / recipe creation), Explore (What Can I Make, Shop), Home (feed with like/comment/share), Social (friends, events), Profile (stats, badges). Visual design uses NativeWind/Tailwind with GlueStack UI primitives.

Motivational designs and theoretical mapping

- Badges & Streaks: target competence (SDT) and achievement (HEXAD Achiever). Framed as informational recognitions to avoid controlling effects (CET).
- What Can I Make (ingredient matcher): reduces ability barriers (FBM: Reduction/Facilitation), increasing activation likelihood.
- Social feed and tagging: provide social validation & reciprocity triggers (social influence principles), supporting relatedness.
- Notifications & onboarding nudges: designed to be transparent and opt-in, favoring reflective consent (Hansen & Jespersen grid).

CJM / Pirate metrics / Measurement

- Customer journey is operationalized as AAARRR/ PIRATE tasks (Acquisition: signup; Activation: first_cocktail_logged; Retention: profile/stats engagement; Referral: share_click/converted; Revenue: shop_item_viewed/clicked). Analytics are implemented with PostHog event names (`first_cocktail_logged`, `what_can_i_make`, `share_clicked`) and helpers (`trackWithTTFA`, `trackFirstTime`) to capture TTFA and first-time behaviors (see `ANALYTICS.md`).

**5. Method (200–500 words)**

Participants

- N = 8 participants (remote sessions). Demographics: mixed ages (17–53), varied phone models (iPhone, Android) as recorded in test CSV. Recruitment via convenience sampling among target users.

Procedure

- Remote moderated sessions. Participants completed eight PIRATE-aligned tasks (see `SUMMATIVE_USER_TESTING_GUIDE.md`): signup + first log, feed engagement, What Can I Make, recipe creation, profile review, sharing, friends/events exploration, shop browsing. Sessions captured time-to-complete, task ratings (1–5), and open feedback. Each session lasted approximately the time required to complete tasks (TTFs in CSV).

Tasks & measures

- Objective measures: task completion, time-to-completion (minutes), task ratings. Subjective measures: UTAUT questionnaire (PE, EE, SI, FC, BI). Qualitative notes captured from open-form responses.

Data analysis

- Quantitative: compute means and SDs for UTAUT dimensions, aggregate task times and ratings, and summarize task success. Qualitative: thematic analysis to extract recurring friction points and positive themes.

**6. Results (500–1000 words)**

Participants

- Final sample: N=8, age range and device diversity recorded in `Summative tests results questions.csv`.

Logs / metrics / task performance

- Task-based ratings and TTFA: average posting rating high (Task 1 ≈ 4.79). Average time-to-completion by task ranged from ~0.63 to ~3.55 minutes (see `Summative tests results time&scores.csv`). What Can I Make was fast and well-rated.

Scores on scales (UTAUT)

- PE: 4.47 (SD ≈ 0.36)
- EE: 4.78 (SD ≈ 0.36)
- SI: 3.88 (SD ≈ 0.67)
- FC: 4.47 (SD ≈ 0.57)
- BI: 3.33 (SD ≈ 1.23)
- Interpretation: high usefulness and ease-of-use; weaker social influence and intention to use regularly.

Qualitative themes

- Positive: discovery (`What Can I Make`) repeatedly praised; visual design and post flow appreciated once located.
- Friction: unclear premade ingredient UI, lack of photo cropping, unclear step progression, occasional discoverability issues for posting vs. recipe-first flows.
- Ethics: participants appreciate private-by-default posts and explicit control over notifications.

**7. Discussion (500–1000 words)**

Revisiting research questions (≈200 words)

- The study shows that Sippin’s core interactions (posting, discovery) are usable and attractive (high PE/EE). However, moderate SI and low BI indicate that social pathways and longer-term motivation need strengthening. Motivational design elements (badges, streaks) can increase engagement if framed informatively and combined with social onboarding and opt-in referrals.

Relation to prior work

- Findings align with literature that simple onboarding and first-success experiences increase activation. They caution against over-reliance on extrinsic rewards. Sippin’s transparent defaults contrast with some commercial apps that use opaque nudges; this is consistent with ethical best practices.

Ethics / dark patterns (100–200 words)

- Using Hansen & Jespersen’s grid, Sippin’s current designs mostly employ transparent and reflective nudges (e.g., private-by-default posts, explicit share actions). Avoiding manipulative scarcity, hidden defaults, and confirmshaming reduces regulatory risk (DSA/DMA concerns) and supports user trust. Monitor badge and streak framing to avoid controlling perceptions (CET).

Limitations (100–200 words)

- Small N limits generalizability; sessions captured first-time use only (no longitudinal retention); device diversity suggests UI edge cases may exist. Self-selection bias and convenience sampling restrict demographic representativity.

Future work (100–200 words)

- Run larger-scale A/B experiments (N>100) using AAARRR events and TTFA to test feature variants (stepper, badge framing, social onboarding). Conduct longitudinal retention studies (30/90-day cohorts) and ethical audits of incentive designs.

**8. Conclusion (150–250 words)**

- Research question: How to apply motivational design to ensure PLG while avoiding dark patterns?
- Design & materials: a PWA with posting, discovery, social, and gamification elements; analytics instrumentation to measure AAARRR metrics.
- Method: summative usability study (N=8) with PIRATE tasks and UTAUT questionnaire.
- Results: users find Sippin useful and easy to use, with strong activation for discovery features, but social influence and behavioral intention are lower.
- Reflection: prioritize UX fixes (photo cropping, stepper, clearer ingredient UI), amplify transparent social mechanisms (opt-in invites, friend highlights), and run analytics-driven experiments to lift BI and referral metrics. Ethical transparency should remain a hard constraint.

**9. Acknowledgements (optional)**

- Thanks to participants of the summative tests and to the project contributors who implemented the prototype and analytics.

## Files
- Project files consulted: 
[PAPER_ASSIGNMENT_GUIDE.md](PAPER_ASSIGNMENT_GUIDE.md), 
[MOTIVATIONAL DESIGNS SIPPIN v2.txt](MOTIVATIONAL%20DESIGNS%20SIPPIN%20v2.txt), 
[Summative tests results questions.csv](Summative%20tests%20results%20questions.csv), 
[Summative tests results time&scores.csv](Summative%20tests%20results%20time%26scores.csv), 
[SUMMATIVE_USER_TESTING_GUIDE.md](SUMMATIVE_USER_TESTING_GUIDE.md), 
[ANALYTICS.md](ANALYTICS.md).

