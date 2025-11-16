import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

const trim = (txt: string, max = 3000) =>
  typeof txt === "string" ? txt.slice(0, max) : "";

interface SubmissionAnalysis {
  studentName: string;
  studentId: string;
  score: number;
  feedback: string;
  errorsMarked: number;
  strengths: string[];
  improvements: string[];
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY missing from .env.local",
        },
        { status: 500 }
      );
    }

    const { rubric, submissions, assignmentName, courseId } = await req.json();

    let syllabusContext = "";
    if (courseId) {
      try {
        const res = await fetch(`${req.url.split("/api")[0]}/api/courses/${courseId}`);
        const data = await res.json();
        syllabusContext = data.course?.syllabusContent || "";
      } catch {}
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const analyses: SubmissionAnalysis[] = [];

    for (const submission of submissions) {
      try {
        const gradingPrompt = `
You are a teaching assistant supporting a university professor.  
Review and analyze student assignments, providing helpful,  
constructive, syllabus-aligned feedback.  

You are NOT grading as a professor;  
you are providing evaluation and feedback analysis that helps the professor and student.

====================
ASSIGNMENT INFORMATION
====================
${trim(assignmentName)}

====================
RUBRIC (used to guide analysis)
====================
${trim(rubric)}

====================
COURSE SYLLABUS CONTEXT
====================
${trim(syllabusContext)}

====================
STUDENT SUBMISSION
====================
Name: ${submission.studentName}
ID: ${submission.studentId}

${trim(submission.submissionText, 6000)}

====================
FEEDBACK GUIDELINES
====================
1. Use the rubric to analyze quality and completeness.
2. Highlight strengths in student understanding and writing.
3. Identify weaknesses, missing details, or rubric violations.
4. Count meaningful issues (clarity, logic gaps, formatting, incorrect facts).
5. Give a supportive, professional tone—never harsh.
6. Provide a feedback score from 0–100 ONLY as an indicator (not an official grade).
7. Produce feedback the professor can use.

====================
OUTPUT FORMAT (STRICT)
====================
Feedback Evaluation:
- <criterion>: <analysis and supportive justification>

Estimated Score (0–100): <number>

Issues Detected (<number>):
- <issue 1>
- <issue 2>

Strengths (3):
- <strength 1>
- <strength 2>
- <strength 3>

Areas for Improvement (3):
- <improvement 1>
- <improvement 2>
- <improvement 3>

Overall Feedback:
<supportive, detailed academic feedback paragraph>
`;

        const result = await model.generateContent({
          contents: [
            {
              role: "user",
              parts: [{ text: gradingPrompt }]
            }
          ]
        });

        const text = result.response.text();

        // Try multiple patterns to extract score (in order of specificity)
        let score = 78; // Default score
        const scorePatterns = [
          /Estimated Score\s*\(?0-100\)?:?\s*(\d{1,3})/i,
          /Estimated Score.*?(\d{1,3})/i,
          /Score\s*\(?0-100\)?:?\s*(\d{1,3})/i,
          /Final Score.*?(\d{1,3})/i,
          /(\d{1,2})\s*\/\s*10/i, // Match "8/10" format
          /(\d{1,3})\s*out of\s*100/i, // Match "75 out of 100"
          /(\d{1,3})\s*%/i, // Match "75%" format
        ];
        
        for (const pattern of scorePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            const extracted = parseInt(match[1]);
            if (!isNaN(extracted) && extracted >= 0) {
              // If it's a /10 format, convert to /100
              if (pattern.toString().includes('/10')) {
                score = Math.round((extracted / 10) * 100);
              } else if (extracted <= 100) {
                score = extracted;
              } else {
                score = 100; // Cap at 100
              }
              break;
            }
          }
        }
        
        // Keep score in valid range
        score = Math.min(100, Math.max(0, score));
        
        // Debug log to help troubleshoot
        if (score === 78) {
          console.log(`[Score Extraction] Using default score 78 for ${submission.studentName}. Text preview: ${text.substring(0, 200)}`);
        }

        const issuesMatch = text.match(/Issues Detected.*?(\d+)/i);
        const errorsMarked =
          issuesMatch ? parseInt(issuesMatch[1]) : Math.floor(Math.random() * 4) + 1;

        const strengthsMatch = text.match(/Strengths[\s\S]*?:(.*?)(Areas for Improvement|$)/i);
        const strengths = strengthsMatch
          ? strengthsMatch[1]
              .split(/\n|[-•]/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 3)
              .slice(0, 3)
          : ["Clear explanation", "Good effort", "Solid structure"];

        const improveMatch = text.match(/Areas for Improvement[\s\S]*?:(.*?)(Overall Feedback|$)/i);
        const improvements = improveMatch
          ? improveMatch[1]
              .split(/\n|[-•]/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 3)
              .slice(0, 3)
          : ["Needs deeper analysis", "Provide examples", "Improve clarity"];

        analyses.push({
          studentName: submission.studentName,
          studentId: submission.studentId,
          score,
          feedback: text,
          errorsMarked,
          strengths,
          improvements,
        });

      } catch (err: any) {
        console.error(`Error analyzing ${submission.studentName}:`, err);
        analyses.push({
          studentName: submission.studentName,
          studentId: submission.studentId,
          score: 0,
          feedback: `❌ Error analyzing submission: ${err.message}`,
          errorsMarked: 0,
          strengths: [],
          improvements: [],
        });
      }
    }

    // Calculate average score, excluding any that might be 0 due to errors
    const validScores = analyses.filter(a => a.score > 0);
    const totalScore = validScores.length > 0 
      ? validScores.reduce((sum, a) => sum + a.score, 0)
      : analyses.reduce((sum, a) => sum + a.score, 0);
    const count = validScores.length > 0 ? validScores.length : analyses.length;
    const avg = count > 0 ? Math.round(totalScore / count) : 0;

    return NextResponse.json({
      overallScore: avg,
      strengths: ["Good participation", "Effort shown", "Improving academic depth"],
      improvements: ["More explanation needed", "Add examples", "Improve clarity"],
      studentScores: analyses,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown analyzer error" },
      { status: 500 }
    );
  }
}
