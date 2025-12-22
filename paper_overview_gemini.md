# Paper Overview: Motivational Design & Product-Led Growth for Sippin

## 1. ABSTRACT

- **Research Focus:** Investigating how motivational design principles and Product-Led Growth (PLG) strategies can be integrated into a social cocktail tracking app ("Sippin") to enhance user engagement and retention.
- **Design:** A high-fidelity React Native PWA featuring gamification, social validation, and nudges, underpinned by robust AAARRR analytics tracking.
- **Method:** Summative user testing (N=8) performing 8 core tasks mapped to Pirate Metrics, evaluated using the Unified Theory of Acceptance and Use of Technology (UTAUT) and task-based metrics.
- **Results:** The app achieved excellent usability scores (Effort Expectancy: 4.78/5) and strong performance expectancy (4.47/5), though social influence scores were moderate (3.88/5).
- **Conclusion:** The results suggest that while the motivational designs successfully reduced friction (Ability/FBM), the social network effect requires a critical mass of users to become a primary driver of retention.

## 2. INTRODUCTION

- **Problem Statement:** Many lifestyle apps fail to retain users after the initial "novelty" phase due to a lack of intrinsic motivation and high friction in logging behaviors.
- **Research Objective:** To design and validate "Sippin," a SaaS application that leverages behavioral psychology (FBM, SDT) and PLG strategies (viral loops, friction reduction) to create a sustainable growth engine.
- **Core Question:** How can motivational design principles be operationalized in a cocktail app to drive Product-Led Growth while maintaining ethical standards?

## 3. BACKGROUND / RELATED WORK

### Fogg’s Behavioral Model (FBM)
- Focusing on Ability (Simplicity factors) and Triggers to facilitate the "Activation threshold." 

### Self-Determination Theory (SDT)
- Addressing the need for Competence (via Badges/Streaks for "Achiever" types) and Relatedness (Social feed).

### Social Influence Principles
- Leveraging Social Validation (Feed/Likes), Reciprocity (Friend requests/Tagging), and Social Comparison (Leaderboards/Stats).

### Nudge Theory
- Using defaults (smart notifications) and reduction strategies to minimize cognitive load.

### Gamification
- Implementing the PBL triad (Points, Badges, Leaderboards) and Octalysis framework elements.

### Product-Led Growth (PLG)
- Utilizing the "Flywheel" model and Pirate Metrics (AAARRR) to measure success.

## 4. DESIGN / MATERIALS

### 4.1. The Sippin App (Hi-Fi Prototype)
- A React Native Web PWA designed for cocktail discovery, logging, and social sharing.

### 4.2. Implemented Motivational Designs

#### Competence (SDT) & Achievement:
- Badges & Streaks: Cater to the "Achiever" HEXAD user type and leverage loss aversion/commitment.
- Statistics: Visual feedback on user history to support self-monitoring.

#### Social Influence & Validation:
- Feed & Interactions: Likes/Comments to normalize behavior (Bandwagon Effect) and provide social proof.
- Reciprocity: Friend requests and tagging create "social debt".

#### Nudges & Simplicity (FBM):
- Simplified Posting: "What can I make" feature reduces cognitive load (Facilitation).
- Defaults: Smart defaults for notifications (ON) vs. Privacy (Private) to balance engagement with ethics.

#### Ethics / Dark Patterns:
- Avoided "Roach Motel" (easy opt-out) and "Confirmshaming".
- Transparency: Private-by-default posts to avoid "Privacy Zuckering".

### 4.3. Analytics Infrastructure
- **Tooling:** PostHog (Event tracking) and Google Analytics 4.

#### AAARRR Implementation:
- **Awareness:** pageviews through Google Analytics 4 (GA4)
- **Acquisition:** Tracking `signup_completed` (Email vs. Google OAuth).
- **Activation:** Tracking `first_cocktail_logged` (Time to First Action/TTFA) and `what_can_i_make` usage.
- **Retention:** Monitoring MAU/DAU ratios and session frequency.
- **Referral:** Viral loops tracked via `share_clicked` and `share_link_opened` (UTM parameters).
- **Revenue:** Affiliate link tracking via `shop_item_clicked`.

## 5. METHOD

### 5.1. Participants
- **N=8** participants.
- **Demographics:** Ages 17–53; mixed devices (iPhone 11, 13, 15, 16 Pro, Samsung A53).
- **Recruitment:** Convenience sampling (friends/family).

### 5.2. Procedure
- **Format:** Summative user testing with specific tasks mapped to Pirate Metrics.
- **Tasks:** 8 Scenarios including Signup (Acquisition), First Log (Activation), "What can I make" (Activation), Recipe Creation (Deep Engagement), and Sharing (Referral).

### 5.3. Measures
- **Quantitative (Objective):** Time to completion (minutes), Success rates, Error rates.
- **Quantitative (Subjective):** UTAUT Questionnaire (1-5 Likert scale) covering Performance Expectancy (PE), Effort Expectancy (EE), Social Influence (SI), Facilitating Conditions (FC), and Behavioral Intention (BI).
- **Qualitative:** Post-task interview questions and feedback.

## 6. RESULTS

### 6.1. Task Performance (Objective)
- **Efficiency:** Average task times were low, indicating high usability.
- **Signup/First Log:** ~3.5 min.
- **Social Engagement:** ~1.3 min.
- **Referral/Sharing:** ~0.9 min.
- **Issues:** Minor confusion observed in Task 4 (Recipe Creation) regarding ingredient input steps.

### 6.2. UTAUT Scores (Subjective)
- **Effort Expectancy (EE):** 4.78 (Excellent) – Users found the app highly intuitive and easy to use.
- **Performance Expectancy (PE):** 4.47 (Good) – Users perceived high utility in tracking and discovery.
- **Facilitating Conditions (FC):** 4.47 (Good) – Technical infrastructure was not a barrier.
- **Social Influence (SI):** 3.88 (Moderate) – Lower than other metrics; users were less driven by peer pressure in this test environment.
- **Behavioral Intention (BI):** 3.33 (Neutral) – While usability was high, intention to use regularly varied, likely due to the niche nature of the app (cocktails).

### 6.3. Qualitative Feedback
- **Positives:** "What can I make" feature was highlighted as "amazing" and "useful." The interface was described as "clear" and "nice."
- **Improvements:** Users requested clearer steps for recipe creation (numbering steps 1/4) and cropping tools for photos.

## 7. DISCUSSION

### 7.1. Revisiting Research Questions
- **Simplicity as a Motivator:** The high EE (4.78) score confirms that the reduction strategies and FBM "Ability" focus were successful. The "What can I make" feature successfully lowered the activation threshold.
- **PLG & Viral Loops:** The referral tasks were completed quickly (~0.9 min), confirming the technical viability of the viral loop. However, the moderate SI (3.88) score suggests that the "Network Effect" (Retention) relies heavily on a critical mass of users which was not present during testing.

### 7.2. Ethics & Dark Patterns
- The decision to make posts private by default prioritized user autonomy over aggressive social growth ("Privacy Zuckering"). While this might slow initial social loop activation, it aligns with ethical PSD principles and builds long-term trust.
- No deceptive patterns were used; the shop features (Revenue) were clearly marked as affiliate links, ensuring transparency.

### 7.3. Limitations
- **Sample Size:** N=8 is sufficient for usability (finding ~85% of problems) but statistically insignificant for robust UTAUT validation.
- **Context:** Testing was done in a controlled setting, not a real social drinking environment ("Kairos" context was simulated).
- **Demographics:** The user base included non-drinkers or infrequent drinkers, impacting Behavioral Intention (BI) scores.

### 7.4. Future Work
- **Gamification V2:** Implement "Quests" to guide users through the "Scaffolding" phase of the user journey.
- **Onboarding:** Improve the "Recipe Creation" flow with stepper indicators to reduce friction further.
- **Longitudinal Study:** Test retention over 30 days to validate the "Hook Model" implementation.

## 8. CONCLUSION
- Sippin successfully demonstrates how integrating Fogg’s Behavioral Model and Ethical Nudges can create a highly usable product (EE 4.78). The "What can I make" feature serves as a powerful activation tool by solving the "Ability" constraint in home bartending. While the foundational PLG metrics (Acquisition, Activation) are strong, future iterations must focus on strengthening the Social Influence triggers to drive the Referral and Retention loops essential for a sustainable product-led growth engine.


## Files
- Project files consulted: 
[PAPER_ASSIGNMENT_GUIDE.md](PAPER_ASSIGNMENT_GUIDE.md), 
[MOTIVATIONAL DESIGNS SIPPIN v2.txt](MOTIVATIONAL%20DESIGNS%20SIPPIN%20v2.txt), 
[Summative tests results questions.csv](Summative%20tests%20results%20questions.csv), 
[Summative tests results time&scores.csv](Summative%20tests%20results%20time%26scores.csv), 
[SUMMATIVE_USER_TESTING_GUIDE.md](SUMMATIVE_USER_TESTING_GUIDE.md), 
[ANALYTICS.md](ANALYTICS.md).