import { and, asc, eq, gt, ilike } from "drizzle-orm";
import { db } from "../db";
import { flashcards } from "../db/schema/flashcard";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { controllerWrapper } from "../utils/controllerWrapper";
import { getRequester } from "../utils/getRequester";
import {
  createCursorResult,
  decodeCursor,
  parseCursorParams,
} from "../utils/cursorPagination";