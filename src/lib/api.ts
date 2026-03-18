const BASE_URL = "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AskQuestionPayload {
  question: string;
  student_id: string;
}

export interface AskQuestionResponse {
  status: string;
  message?: string;
}

export interface UploadSlidePayload {
  file: File;
}

export interface ProcessClustersPayload {
  [key: string]: unknown;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /ask-question
 * Student submits a question or a quick reaction.
 */
export async function askQuestion(
  payload: AskQuestionPayload
): Promise<AskQuestionResponse> {
  const res = await fetch(`${BASE_URL}/ask-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`ask-question failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * POST /upload-slide
 * Teacher uploads a slide file.
 */
export async function uploadSlide(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/upload-slide`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`upload-slide failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * POST /process-clusters
 * Teacher triggers cluster processing on current questions.
 */
export async function processClusters(
  payload: ProcessClustersPayload = {}
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/process-clusters`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `process-clusters failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

/**
 * GET /get-clusters
 * Teacher fetches the latest question clusters.
 */
export async function getClusters(): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/get-clusters`);

  if (!res.ok) {
    throw new Error(`get-clusters failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
