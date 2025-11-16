import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "Say OK" }]
        }
      ]
    });

    const text = result.response.text();

    return NextResponse.json({
      success: true,
      text: text
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      status: error.status,
      message: error.message
    }, { status: 200 });
  }
}

