const BASE_URL = "/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AskQuestionPayload {
  class_id: string;
  question: string;
  student_id: string;
}

export interface AskQuestionResponse {
  status: string;
  message: string;
}

export interface CreateClassPayload {
  teacher_name: string;
  subject_name: string;
  teacher_id?: string;
}

export interface CreateClassResponse {
  status: string;
  class_id: string;
}

export interface ProcessClustersPayload {
  class_id: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * POST /create-class
 */
export async function createClass(
  payload: CreateClassPayload
): Promise<CreateClassResponse> {
  const res = await fetch(`${BASE_URL}/create-class`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("create-class failed");
  return res.json();
}

/**
 * POST /end-class/{id}
 */
export async function endClass(classId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/end-class/${classId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("end-class failed");
  return res.json();
}

/**
 * GET /get-classes
 */
export async function getClasses(teacherId?: string): Promise<any> {
  const url = teacherId
    ? `${BASE_URL}/get-classes?teacher_id=${teacherId}`
    : `${BASE_URL}/get-classes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("get-classes failed");
  return res.json();
}

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
    const error = await res.json();
    throw new Error(error.detail || "ask-question failed");
  }

  return res.json();
}

/**
 * POST /upload-slide
 * Teacher uploads a slide file.
 */
export async function uploadSlide(
  classId: string,
  file: File
): Promise<unknown> {
  const formData = new FormData();
  formData.append("class_id", classId);
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
  payload: ProcessClustersPayload
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
 * GET /get-clusters/{id}
 * Teacher fetches the latest question clusters.
 */
export async function getClusters(classId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/get-clusters/${classId}`);

  if (!res.ok) {
    throw new Error(`get-clusters failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
