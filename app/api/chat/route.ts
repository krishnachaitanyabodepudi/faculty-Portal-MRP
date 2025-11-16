import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is missing from .env.local" },
        { status: 500 }
      );
    }

    const { messages, courseId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Get syllabus context if available
    let syllabusContext = "";
    if (courseId) {
      try {
        const baseUrl = req.url.split("/api")[0];
        const res = await fetch(`${baseUrl}/api/courses/${courseId}`);
        const courseData = await res.json();
        syllabusContext = courseData.course?.syllabusContent || "";
      } catch (err) {
        console.error("Failed to fetch syllabus:", err);
      }
    }

    // System prompt for faculty assistant
    const systemPrompt = `
You are **Silver Leaf University's Faculty Assistant**.

Your purpose:
- To help professors understand course topics deeply.
- Provide detailed academic explanations, breakdowns, examples, and theory.
- Expand well beyond the syllabus when intellectually relevant.
- Provide clarity for faculty preparing lectures, assignments, exams, and teaching material.

Allowed academic expansions:
- Machine Learning and Deep Learning  
- Python, Data Science, Statistics  
- Algorithms, DBMS, Cloud Computing  
- Neural networks, optimization, math  
- Any concept normally covered in graduate-level CS/IS/AI curriculum

You must always give **high-level + deep detail + explanations + examples**.

===========================
STRICTLY NOT ALLOWED
===========================
If asked about:
- SSN  
- Personal identity  
- Immigration / OPT / visa  
- Jobs, salary, resumes  
- Legal, medical, political topics  
- Dating, personal advice  
- IRRELEVANT real-world topics  

Reply EXACTLY with:
"This question is not related to this course."

===========================
SYLLABUS CONTEXT (optional)
===========================
${syllabusContext}

Use this only to understand course domain,  
but you are ALLOWED and EXPECTED to go deeper academically if needed.
`;

    // Format messages for API
    const recentMessages = messages.slice(-10);
    const formattedMessages = recentMessages.map((m) => {
      if (m.role === "assistant") {
        return {
          role: "model" as const,
          parts: [{ text: m.content }],
        };
      }
      return {
        role: "user" as const,
        parts: [{ text: m.content }],
      };
    });

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    // Stream response if possible
    try {
      const result = await model.generateContentStream({
        contents: formattedMessages,
      });

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of result.stream) {
              controller.enqueue(encoder.encode(chunk.text()));
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (streamErr) {
      console.warn("Streaming failed, falling back:", streamErr);
    }

    // Fallback to regular response if streaming fails
    const fallback = await model.generateContent({
      contents: formattedMessages,
    });

    const reply = fallback.response.text();

    return Response.json({ success: true, reply });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Chat API error" },
      { status: 500 }
    );
  }
}
