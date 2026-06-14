import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { askCopilot } from "@/lib/ai/gemini";
import { ERP_SYSTEM_PROMPT, parseIntent } from "@/lib/ai/prompts";
import {
  buildSalesOrderContext,
  buildPurchaseOrderContext,
  buildManufacturingContext,
  buildProductContext,
  buildInventoryContext,
  buildProcurementContext,
  buildRiskContext,
  buildDailySummaryContext,
  buildGeneralContext,
} from "@/lib/ai/context-builder";

export async function POST(req: NextRequest) {
  try {
    // Auth check — any active user can use AI
    await getCurrentUser();

    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide a message." },
        { status: 400 }
      );
    }

    // Parse intent from user message
    const { intent, entityId } = parseIntent(message);

    // Build context based on intent
    let context;
    try {
      switch (intent) {
        case "explain-sales-order":
          context = await buildSalesOrderContext(entityId!);
          break;
        case "explain-purchase-order":
          context = await buildPurchaseOrderContext(entityId!);
          break;
        case "explain-manufacturing":
          context = await buildManufacturingContext(entityId!);
          break;
        case "explain-product":
          context = await buildProductContext(entityId!);
          break;
        case "inventory-analysis":
          context = await buildInventoryContext();
          break;
        case "procurement-advisor":
          context = await buildProcurementContext();
          break;
        case "manufacturing-advisor": {
          // Build combined manufacturing + procurement context
          const [mfgCtx, procCtx] = await Promise.all([
            buildProcurementContext(),
            buildRiskContext(),
          ]);
          context = {
            type: "manufacturing-advisor",
            data: {
              manufacturing: mfgCtx.data,
              risks: procCtx.data,
            },
            summary: `${mfgCtx.summary}. ${procCtx.summary}`,
          };
          break;
        }
        case "risk-analysis":
          context = await buildRiskContext();
          break;
        case "daily-summary":
          context = await buildDailySummaryContext();
          break;
        default:
          context = await buildGeneralContext();
      }
    } catch (dbError: unknown) {
      const dbMessage = dbError instanceof Error ? dbError.message : "Database error";
      return NextResponse.json(
        {
          response: `I encountered a problem while fetching your ERP data: ${dbMessage}. Please try again or rephrase your question.`,
          intent,
          contextType: "error",
        },
        { status: 200 }
      );
    }

    // Send to Gemini
    const contextString = JSON.stringify(context.data, null, 2);
    const aiResponse = await askCopilot(ERP_SYSTEM_PROMPT, contextString, message);

    return NextResponse.json({
      response: aiResponse,
      intent,
      contextType: context.type,
      contextSummary: context.summary,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Handle custom AI errors gracefully
      if (error.message.startsWith("AI_NOT_CONFIGURED")) {
        return NextResponse.json({
          response:
            "🔧 **AI Copilot Not Configured**\n\nThe AI assistant needs a Groq API key to work.\n\n1. Get a free key at [Groq Console](https://console.groq.com/keys)\n2. Add `GROQ_API_KEY=your-key` to your `.env` file\n3. Restart the dev server\n\nThe AI Copilot will start working immediately!",
          intent: "error",
          contextType: "configuration-error",
        });
      }

      if (error.message.startsWith("AI_RATE_LIMITED")) {
        return NextResponse.json({
          response:
            "⏳ **Too Many Requests**\n\nThe AI assistant is receiving too many requests right now. Please wait a moment and try again.",
          intent: "error",
          contextType: "rate-limited",
        });
      }

      if (error.message.startsWith("AI_TIMEOUT")) {
        return NextResponse.json({
          response:
            "⏱️ **Request Timed Out**\n\nThe AI took too long to respond. Try asking a simpler or more specific question.",
          intent: "error",
          contextType: "timeout",
        });
      }

      // Auth error
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    console.error("AI Chat Error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      response:
        `❌ **Something Went Wrong**\n\n${errorMsg}\n\nPlease try again in a moment.`,
      intent: "error",
      contextType: "unknown-error",
    });
  }
}
