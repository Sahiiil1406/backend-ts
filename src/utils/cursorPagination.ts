/**
 * Cursor-based pagination utility
 * Encodes and decodes cursors for pagination
 */

export interface CursorPaginationParams {
  limit: number;
  cursor?: string;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

/**
 * Encode cursor from ID
 * @param id - The ID to encode
 * @returns Base64 encoded cursor
 */
export const encodeCursor = (id: number | string): string => {
  return Buffer.from(`cursor_${id}`).toString("base64");
};

/**
 * Decode cursor to get ID
 * @param cursor - The base64 encoded cursor
 * @returns The decoded ID or null if invalid
 */
export const decodeCursor = (cursor: string): string | null => {
  try {
    if (!cursor || typeof cursor !== "string") {
      return null;
    }
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    const id = decoded.replace("cursor_", "");
    return id || null;
  } catch (error) {
    return null;
  }
};

/**
 * Parse cursor pagination parameters from request query
 * @param query - Express request query object
 * @returns Parsed cursor pagination parameters
 */
export const parseCursorParams = (query: any): CursorPaginationParams => {
  const limit = Math.min(
    Math.max(parseInt(query.limit as string) || 10, 1),
    100, // Max limit 100
  );

  return {
    limit,
    cursor: query.cursor as string | undefined,
  };
};

/**
 * Create cursor pagination result
 * @param data - Array of records to return
 * @param limit - Limit parameter
 * @param idField - Name of the ID field in the data objects
 * @returns Cursor pagination result with nextCursor
 */
export const createCursorResult = <T extends { [key: string]: any }>(
  data: T[],
  limit: number,
  idField: string = "id",
): CursorPaginationResult<T> => {
  const hasMore = data.length > limit;
  const resultData = hasMore ? data.slice(0, limit) : data;

  let nextCursor: string | null = null;
  if (hasMore && resultData.length > 0) {
    const lastItem = resultData[resultData.length - 1];
    const idValue = lastItem[idField];
    if (idValue !== undefined && idValue !== null) {
      nextCursor = encodeCursor(idValue);
    }
  }

  return {
    data: resultData,
    nextCursor,
    hasMore: !!nextCursor,
    limit,
  };
};
