import { and, asc, desc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import { getRequester } from "../utils/getRequester";
import { sessions } from "../db/schema/session";
import { messages } from "../db/schema/message";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";
import { getGeminiResponseStream } from "../utils/langchainGemini";

//if question ask with sessionId,get context from previous messages in that session and ask AI with that context
//if no sessionId, create new session and ask AI with that question only

const getRagContext = async (question: string): Promise<string> => {
  return question;
};

const buildSessionTitle = (question: string): string => {
  const normalized = question.trim().replace(/\s+/g, " ");
  return normalized.length <= 150
    ? normalized
    : `${normalized.slice(0, 147)}...`;
};

const formatChatHistory = (
  chatHistory: Array<{ question: string | null; answer: string | null }>,
): string => {
  if (!chatHistory.length) {
    return "No prior chat history.";
  }

  return chatHistory
    .map((entry, index) => {
      return `#${index + 1}\nUser: ${entry.question ?? ""}\nAssistant: ${entry.answer ?? ""}`;
    })
    .join("\n\n");
};

const verifySessionAccess = async (
  sessionId: string,
  requester: ReturnType<typeof getRequester>,
) => {
  const whereClause =
    requester.role === "admin"
      ? eq(sessions.session_id, sessionId)
      : and(
          eq(sessions.session_id, sessionId),
          eq(sessions.user_id, requester.user_id),
        );

  const sessionRows = await db
    .select()
    .from(sessions)
    .where(whereClause)
    .limit(1);

  if (!sessionRows.length) {
    throw new ApiError(404, "Session not found");
  }

  return sessionRows[0];
};

const writeSseEvent = (
  res: {
    write: (chunk: string) => void;
  },
  event: string,
  payload: unknown,
) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const askAIWithContext = controllerWrapper(async (req, res) => {
  const { sessionId, question } = req.body;
  const requester = getRequester(req);
  const safeQuestion = String(question ?? "").trim();

  if (!safeQuestion) {
    throw new ApiError(400, "Question cannot be empty");
  }

  let activeSessionId = sessionId as string | undefined;

  if (!activeSessionId) {
    const insertedSession = await db
      .insert(sessions)
      .values({
        desc: safeQuestion,
        user_id: requester.user_id,
        name: buildSessionTitle(safeQuestion),
      })
      .returning();

    activeSessionId = insertedSession[0].session_id;
  } else {
    await verifySessionAccess(activeSessionId, requester);
  }

  const chatHistory = await db
    .select({ question: messages.question, answer: messages.answer })
    .from(messages)
    .where(eq(messages.session_id, activeSessionId))
    .orderBy(desc(messages.timestamp))
    .limit(5);

  const orderedChatHistory = [...chatHistory].reverse();
  const ragContext = await getRagContext(safeQuestion);
  const systemPrompt = [
    "You are a helpful assistant.",
    "Use the provided context and recent chat history to answer clearly and accurately.",
    `Context: ${ragContext}`,
    `Chat history:\n${formatChatHistory(orderedChatHistory)}`,
  ].join("\n\n");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  writeSseEvent(res, "session", {
    sessionId: activeSessionId,
    created: !sessionId,
  });

  let completeAnswer = "";
  let clientDisconnected = false;

  req.on("close", () => {
    clientDisconnected = true;
  });

  try {
    for await (const token of getGeminiResponseStream(
      systemPrompt,
      safeQuestion,
    )) {
      if (clientDisconnected) {
        break;
      }

      completeAnswer += token;
      writeSseEvent(res, "token", { token });
    }

    if (completeAnswer.trim()) {
      await db.insert(messages).values({
        session_id: activeSessionId,
        question: safeQuestion,
        answer: completeAnswer,
      });
    }

    if (!clientDisconnected) {
      writeSseEvent(res, "done", {
        sessionId: activeSessionId,
        answer: completeAnswer,
      });
      res.end();
    }
  } catch (error: any) {
    if (!clientDisconnected) {
      writeSseEvent(res, "error", {
        message: error?.message || "Failed to stream AI response",
      });
      res.end();
    }
  }
});

const getLastSession = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { user_id } = req.query;

  const whereClause =
    requester.role === "admin" && user_id
      ? eq(sessions.user_id, user_id as string)
      : eq(sessions.user_id, requester.user_id);

  const rows = await db
    .select()
    .from(sessions)
    .where(whereClause)
    .orderBy(desc(sessions.timestamp))
    .limit(1);

  if (!rows.length) {
    throw new ApiError(404, "No sessions found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(rows[0], "Last session fetched"));
});

const getSessionsById = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { id } = req.params;

  const sessionRow = await verifySessionAccess(id, requester);

  const sessionMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.session_id, id))
    .orderBy(asc(messages.timestamp));

  return res.status(200).json(
    ApiResponse.success(
      {
        session: sessionRow,
        messages: sessionMessages,
      },
      "Session fetched",
    ),
  );
});

const getSessionsByUserId = controllerWrapper(async (req, res) => {
  const requester = getRequester(req);
  const { limit, cursor } = parseCursorParams(req.query);
  const { search, user_id } = req.query;

  const whereClauses = [] as any[];

  if (requester.role === "admin") {
    if (user_id) {
      whereClauses.push(eq(sessions.user_id, user_id as string));
    }
  } else {
    whereClauses.push(eq(sessions.user_id, requester.user_id));
  }

  if (search) {
    whereClauses.push(ilike(sessions.name, `%${String(search)}%`));
  }

  const cursorValue = cursor ? decodeCursor(cursor as string) : null;
  if (cursorValue) {
    whereClauses.push(gt(sessions.session_id, cursorValue));
  }

  const data = await db
    .select()
    .from(sessions)
    .where(whereClauses.length ? and(...whereClauses) : undefined)
    .orderBy(asc(sessions.session_id))
    .limit(limit + 1);

  const result = createCursorResult(data, limit, "session_id");

  return res.status(200).json(ApiResponse.success(result, "Sessions fetched"));
});

export const sessionsController = {
  askAIWithContext,
  getLastSession,
  getSessionsById,
  getSessionsByUserId,
};
