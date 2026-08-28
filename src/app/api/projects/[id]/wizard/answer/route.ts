import { NextResponse } from "next/server";
import { applyWizardAnswer, WizardAnswerError } from "@/lib/wizard/applyAnswer";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json().catch(() => ({}));
  const stepId = typeof body?.stepId === "string" ? body.stepId : "";
  const optionId = typeof body?.optionId === "string" ? body.optionId : "";

  if (!stepId || !optionId) {
    return NextResponse.json({ error: "stepId and optionId are required" }, { status: 400 });
  }

  try {
    const result = await applyWizardAnswer(params.id, stepId, optionId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof WizardAnswerError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
