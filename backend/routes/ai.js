import { Router } from 'express';
import { generateAIContent, parseAIJson } from '../ai.js';
import { getRateLimiter } from '../middleware/rateLimiter.js';
import pool from '../db.js';

const router = Router();
const aiLimiter = getRateLimiter(30, 60 * 1000);

const MUSEUM_SYSTEM_PROMPT = 'You are a professional museum and cultural institution specialist with expertise in curatorial practices, collections management, exhibition design, art history, conservation, education programming, and institutional communications. Provide detailed, accurate, and professionally written content suitable for museum use.';

// POST /generate/exhibition-description
router.post('/generate/exhibition-description', aiLimiter, async (req, res) => {
  try {
    const { title, theme, objects, period } = req.body;
    const prompt = `Write a compelling exhibition description for the following exhibition:

Title: ${title}
Theme: ${theme}
Featured Objects: ${objects}
Period: ${period}

Return JSON only (no markdown): { "title": string, "wall_text": string, "thematic_overview": string, "key_themes": [string], "visitor_engagement_notes": string, "accessibility_notes": string }`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/audio-tour
router.post('/generate/audio-tour', aiLimiter, async (req, res) => {
  try {
    const { exhibition, stops, duration, audience } = req.body;
    const prompt = `Create an audio tour script for the following:

Exhibition: ${exhibition}
Number of Stops: ${stops}
Target Duration: ${duration}
Target Audience: ${audience}

Please provide a complete audio tour script with:
1. Welcome and introduction
2. Numbered stops with descriptive narration for each
3. Transition text between stops
4. Closing remarks and thank you
Keep the tone engaging and educational, appropriate for the target audience.`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/grant-narrative
router.post('/generate/grant-narrative', aiLimiter, async (req, res) => {
  try {
    const { grantName, amount, purpose, institution } = req.body;
    const prompt = `Write a professional grant narrative/proposal for the following:

Grant Name: ${grantName}
Requested Amount: ${amount}
Purpose: ${purpose}
Institution: ${institution}

Return JSON only (no markdown): { "executive_summary": string, "project_description": string, "budget_justification": string, "community_impact": string, "evaluation_plan": string, "sustainability": string }`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/research-summary
router.post('/generate/research-summary', aiLimiter, async (req, res) => {
  try {
    const { objectTitle, artist, period, medium } = req.body;
    const prompt = `Generate a collection research summary for the following object:

Object Title: ${objectTitle}
Artist/Creator: ${artist}
Period: ${period}
Medium: ${medium}

Please provide:
1. Object overview and significance
2. Historical context and provenance research
3. Artist/creator biography and relevance
4. Stylistic analysis and connections to broader art movements
5. Condition considerations and conservation notes
6. Exhibition and publication history suggestions`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/feedback-analysis
router.post('/generate/feedback-analysis', aiLimiter, async (req, res) => {
  try {
    const { feedbackData } = req.body;
    const feedbackList = Array.isArray(feedbackData) ? feedbackData.join('\n- ') : feedbackData;
    const prompt = `Analyze the following visitor feedback data and provide actionable insights:

Visitor Feedback:
- ${feedbackList}

Return JSON only (no markdown): { "overall_sentiment": "positive" or "neutral" or "negative", "satisfaction_score": number, "top_praise": [string], "top_complaints": [string], "recommendations": [string] }`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/education-content
router.post('/generate/education-content', aiLimiter, async (req, res) => {
  try {
    const { programName, ageGroup, topic, duration } = req.body;
    const prompt = `Create educational program content for the following:

Program Name: ${programName}
Age Group: ${ageGroup}
Topic: ${topic}
Duration: ${duration}

Please provide:
1. Program overview and learning objectives
2. Detailed lesson plan with timed activities
3. Discussion questions and prompts
4. Hands-on activity descriptions
5. Assessment/reflection methods
6. Materials and resources needed
7. Accessibility and differentiation considerations`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/press-release
router.post('/generate/press-release', aiLimiter, async (req, res) => {
  try {
    const { title, date, details, quotes } = req.body;
    const prompt = `Write a professional press release for the following:

Title/Headline: ${title}
Date: ${date}
Details: ${details}
Quotes to Include: ${quotes}

Please provide a complete press release with:
1. Compelling headline and subheadline
2. Dateline and lead paragraph (who, what, when, where, why)
3. Body paragraphs with details and context
4. Incorporated quotes from stakeholders
5. Boilerplate/about section
6. Media contact information placeholder
Follow AP style and standard press release formatting.`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /build-exhibition  — AI Curator Agent Exhibition Builder
router.post('/build-exhibition', aiLimiter, async (req, res) => {
  try {
    const { theme, budget, gallery_id } = req.body;

    // Fetch objects that match theme keywords
    const keywords = theme.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const searchPattern = `%${keywords.slice(0, 3).join('%')}%`;
    const objectsResult = await pool.query(
      `SELECT id, title, artist_creator, medium, date_created, description
       FROM objects
       WHERE LOWER(title) ILIKE $1 OR LOWER(description) ILIKE $1 OR LOWER(medium) ILIKE $1
       LIMIT 20`,
      [searchPattern]
    );
    const candidateObjects = objectsResult.rows;

    const prompt = `Build an exhibition plan for a museum.

Theme: ${theme}
Budget: ${budget || 'Unspecified'}
Gallery ID: ${gallery_id || 'To be assigned'}
Candidate Collection Objects: ${JSON.stringify(candidateObjects, null, 2)}

Return JSON only (no markdown): {
  "exhibition_title": string,
  "selected_objects": [{"id": number, "title": string, "rationale": string}],
  "layout_description": string,
  "wall_text_preview": string,
  "estimated_visitor_count": number,
  "required_conservation_checks": [string]
}`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const plan = parseAIJson(result.content);

    // Create exhibition record
    let createdExhibition = null;
    if (!plan.raw_output && plan.exhibition_title) {
      try {
        const exhResult = await pool.query(
          `INSERT INTO exhibitions (title, description, gallery_id, status, theme, budget)
           VALUES ($1, $2, $3, 'planned', $4, $5) RETURNING *`,
          [plan.exhibition_title, plan.wall_text_preview || plan.layout_description || '', gallery_id || null, theme, budget || null]
        );
        createdExhibition = exhResult.rows[0];
      } catch (e) {
        console.error('Could not create exhibition record:', e.message);
      }
    }

    res.json({ ...plan, created_exhibition: createdExhibition, model: result.model });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /donor-insights  — Donor Intelligence
router.post('/donor-insights', aiLimiter, async (req, res) => {
  try {
    const donorsResult = await pool.query(
      `SELECT id, name, email, total_given, last_gift_date, status, recognition_level, type
       FROM donors ORDER BY total_given DESC LIMIT 50`
    );
    const donors = donorsResult.rows;

    const prompt = `Analyze this museum donor list and provide intelligence insights.

Donor Data: ${JSON.stringify(donors, null, 2)}
Current Date: ${new Date().toISOString().split('T')[0]}

Return JSON only (no markdown): {
  "top_donors": [{"name": string, "total_donated": number, "engagement_score": number}],
  "churn_risk_donors": [{"name": string, "days_since_last_gift": number, "recommended_action": string}],
  "grant_recommendations": [{"grant_name": string, "match_reason": string, "deadline": string}]
}`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, donor_count: donors.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /conservation-risk  — Conservation Risk Forecaster
router.get('/conservation-risk', aiLimiter, async (req, res) => {
  try {
    const logsResult = await pool.query(
      `SELECT gallery_id, temperature, humidity, light_level, co2_level, status, created_at
       FROM environment_logs
       WHERE created_at >= NOW() - INTERVAL '30 days'
       ORDER BY gallery_id, created_at DESC`
    );
    const logs = logsResult.rows;

    // Group by gallery
    const byGallery = {};
    for (const log of logs) {
      const gid = log.gallery_id || 'unknown';
      if (!byGallery[gid]) byGallery[gid] = [];
      byGallery[gid].push(log);
    }

    const prompt = `Analyze these environmental readings from a museum for conservation risk. Safe ranges: temperature 18-22°C, relative humidity 45-55%.

Environmental Data by Gallery (last 30 days): ${JSON.stringify(byGallery, null, 2)}

Return JSON only (no markdown): {
  "galleries": [{"gallery_id": string, "risk_level": "low" or "medium" or "high" or "critical", "temp_concerns": string, "humidity_concerns": string, "at_risk_objects": [string]}],
  "recommendations": [string]
}`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, readings_analyzed: logs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/visitor-experience-personalize  — tailor tour/content to visitor interests
router.post('/ai/visitor-experience-personalize', aiLimiter, async (req, res) => {
  try {
    const { interests, age_group, available_minutes, accessibility_needs, prior_visits } = req.body || {};
    const prompt = `Create a personalized museum visit plan.
Visitor interests: ${JSON.stringify(interests || [])}
Age group: ${age_group || 'adult'}
Available time (minutes): ${available_minutes || 90}
Accessibility needs: ${accessibility_needs || 'none'}
Prior visits: ${prior_visits || 0}

Return JSON only (no markdown): { "headline": string, "recommended_galleries": [string], "must_see_objects": [string], "suggested_route": [string], "time_allocations_minutes": object, "accessibility_tips": [string], "engagement_tips": [string] }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/collection-valuation  — estimate market valuation for objects
router.post('/ai/collection-valuation', aiLimiter, async (req, res) => {
  try {
    const { object_title, artist, period, medium, dimensions, provenance, condition, comparable_sales } = req.body || {};
    const prompt = `Provide a museum collection valuation estimate. Be conservative; cite uncertainty.
Object: ${object_title || ''}
Artist: ${artist || ''}
Period: ${period || ''}
Medium: ${medium || ''}
Dimensions: ${dimensions || ''}
Provenance: ${provenance || ''}
Condition: ${condition || 'unknown'}
Comparable sales: ${JSON.stringify(comparable_sales || [])}

Return JSON only (no markdown): { "estimated_value_low_usd": number, "estimated_value_high_usd": number, "confidence": "low"|"medium"|"high", "valuation_method": string, "key_factors": [string], "risk_flags": [string], "insurance_recommendation": string }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /ai/conservation-priority  — rank conservation work
router.post('/ai/conservation-priority', aiLimiter, async (req, res) => {
  try {
    let objects = req.body?.objects;
    if (!objects) {
      try {
        const r = await pool.query(`SELECT id, title, condition, last_conservation_date FROM objects ORDER BY id DESC LIMIT 50`);
        objects = r.rows;
      } catch { objects = []; }
    }
    const prompt = `Rank the following museum objects by conservation priority.
Objects: ${JSON.stringify(objects).slice(0, 6000)}

Return JSON only (no markdown): { "ranked": [{"id": string|number, "priority": "urgent"|"high"|"medium"|"low", "reason": string, "recommended_action": string, "estimated_hours": number}], "overall_recommendations": [string] }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /ai/event-attendance-predict  — forecast event attendance
router.post('/ai/event-attendance-predict', aiLimiter, async (req, res) => {
  try {
    const { event_name, event_type, event_date, capacity, ticket_price_usd, marketing_channels, member_count, historical_attendance, weather_forecast, day_of_week } = req.body || {};
    const prompt = `Forecast attendance for an upcoming museum event. Be calibrated and explain key drivers.
Event: ${event_name || ''}
Type: ${event_type || ''}
Date: ${event_date || ''}
Day of week: ${day_of_week || ''}
Capacity: ${capacity || 'unknown'}
Ticket price USD: ${ticket_price_usd ?? 'unknown'}
Marketing channels: ${JSON.stringify(marketing_channels || [])}
Member count: ${member_count || 'unknown'}
Historical attendance for similar events: ${JSON.stringify(historical_attendance || [])}
Weather forecast: ${weather_forecast || 'unknown'}

Return JSON only (no markdown): { "predicted_attendance": number, "predicted_attendance_low": number, "predicted_attendance_high": number, "confidence": "low"|"medium"|"high", "fill_rate_percent": number, "key_drivers": [string], "risk_factors": [string], "recommendations": [string] }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Apply pass 5: additional MECHANICAL endpoints for museum backlog items.

// POST /ai/artifact-documentation
// PRODUCT-DECISION: vision-based artifact docs require image upload + a vision-capable
// model. To stay additive and key-gated, this accepts a TEXT description (or pre-extracted
// vision-model output) of the artifact and returns structured catalog documentation.
// Image upload pipeline can be added later behind a dedicated /upload route.
router.post('/ai/artifact-documentation', aiLimiter, async (req, res) => {
  try {
    const { description, materials, dimensions, accession_number, period, provenance_notes } = req.body || {};
    if (!description) return res.status(400).json({ error: 'description is required' });
    const prompt = `Generate professional museum catalog documentation for the artifact below. Use accepted curatorial vocabulary.
Description: ${description}
Materials: ${materials || 'unknown'}
Dimensions: ${dimensions || 'unknown'}
Accession Number: ${accession_number || 'unknown'}
Period: ${period || 'unknown'}
Provenance notes: ${provenance_notes || 'none'}

Return JSON only (no markdown): { "object_title": string, "physical_description": string, "materials_techniques": string, "iconography": string, "cultural_context": string, "condition_notes": string, "suggested_classification": string, "confidence": "low"|"medium"|"high", "research_questions": [string], "label_short": string, "label_long": string }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /ai/teacher-resource-generator
// PRODUCT-DECISION: produce K-12 lesson plans tied to an exhibition or object. Default
// audience grade band 6-8 if unspecified.
router.post('/ai/teacher-resource-generator', aiLimiter, async (req, res) => {
  try {
    const { topic, grade_band, duration_minutes, learning_objectives, exhibition, standards_framework } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic is required' });
    const grade = grade_band || '6-8';
    const duration = duration_minutes || 45;
    const prompt = `Create a teacher resource pack tied to a museum visit or topic.
Topic: ${topic}
Grade band: ${grade}
Class duration (minutes): ${duration}
Tied to exhibition: ${exhibition || 'n/a'}
Standards framework: ${standards_framework || 'Common Core / NGSS as relevant'}
Learning objectives provided: ${JSON.stringify(learning_objectives || [])}

Return JSON only (no markdown): { "title": string, "grade_band": string, "duration_minutes": number, "learning_objectives": [string], "essential_questions": [string], "vocabulary": [{"term": string, "definition": string}], "pre_visit_activity": string, "in_gallery_activity": string, "post_visit_activity": string, "assessment_rubric": [string], "differentiation_notes": string, "standards_alignment": [string] }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /ai/donation-tax-doc
// PRODUCT-DECISION: returns drafting guidance + structured fields for a donation
// acknowledgment letter. NOT a substitute for legal/CPA advice (explicitly noted in output).
router.post('/ai/donation-tax-doc', aiLimiter, async (req, res) => {
  try {
    const { donor_name, donation_type, amount_or_value, item_description, donation_date, institution_name, ein } = req.body || {};
    if (!donor_name || !donation_type) return res.status(400).json({ error: 'donor_name and donation_type are required' });
    const prompt = `Draft IRS-aligned donor acknowledgment language (US, Pub 1771 style) for a museum donation. Include explicit caveat that this is not tax/legal advice.
Donor: ${donor_name}
Donation type: ${donation_type} (cash | in-kind | securities | other)
Amount or fair-market value: ${amount_or_value || 'unspecified'}
Item description (for in-kind): ${item_description || 'n/a'}
Date: ${donation_date || 'unspecified'}
Institution: ${institution_name || 'this museum'}
EIN: ${ein || 'unspecified'}

Return JSON only (no markdown): { "letter_text": string, "required_irs_disclosures": [string], "missing_information": [string], "form_8283_applicable": boolean, "appraisal_required": boolean, "caveats": string }`;
    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    const parsed = parseAIJson(result.content);
    res.json({ ...parsed, model: result.model, usage: result.usage });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

export default router;
