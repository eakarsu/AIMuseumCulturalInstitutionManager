import { Router } from 'express';
import { generateAIContent } from '../ai.js';
const router = Router();

const MUSEUM_SYSTEM_PROMPT = 'You are a professional museum and cultural institution specialist with expertise in curatorial practices, collections management, exhibition design, art history, conservation, education programming, and institutional communications. Provide detailed, accurate, and professionally written content suitable for museum use.';

// POST /generate/exhibition-description
router.post('/generate/exhibition-description', async (req, res) => {
  try {
    const { title, theme, objects, period } = req.body;
    const prompt = `Write a compelling exhibition description and wall text for the following exhibition:

Title: ${title}
Theme: ${theme}
Featured Objects: ${objects}
Period: ${period}

Please provide:
1. A brief exhibition overview (2-3 paragraphs) suitable for promotional materials
2. Detailed wall text for the exhibition entrance (1-2 paragraphs)
3. A curatorial statement (1 paragraph)`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/audio-tour
router.post('/generate/audio-tour', async (req, res) => {
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
router.post('/generate/grant-narrative', async (req, res) => {
  try {
    const { grantName, amount, purpose, institution } = req.body;
    const prompt = `Write a professional grant narrative/proposal for the following:

Grant Name: ${grantName}
Requested Amount: ${amount}
Purpose: ${purpose}
Institution: ${institution}

Please provide:
1. Executive Summary
2. Statement of Need
3. Project Description with goals and objectives
4. Expected outcomes and impact
5. Sustainability plan
Write in a persuasive, professional tone appropriate for grant applications.`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/research-summary
router.post('/generate/research-summary', async (req, res) => {
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
router.post('/generate/feedback-analysis', async (req, res) => {
  try {
    const { feedbackData } = req.body;
    const feedbackList = Array.isArray(feedbackData) ? feedbackData.join('\n- ') : feedbackData;
    const prompt = `Analyze the following visitor feedback data and provide actionable insights:

Visitor Feedback:
- ${feedbackList}

Please provide:
1. Overall sentiment analysis (positive, negative, neutral percentages)
2. Key themes and recurring topics
3. Top strengths identified by visitors
4. Areas for improvement
5. Specific actionable recommendations
6. Priority ranking of suggested changes`;

    const result = await generateAIContent(prompt, MUSEUM_SYSTEM_PROMPT);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/education-content
router.post('/generate/education-content', async (req, res) => {
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
router.post('/generate/press-release', async (req, res) => {
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

export default router;
