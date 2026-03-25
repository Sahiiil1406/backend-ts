import { Request } from "express";
import { ApiError } from "./ApiError";

export type Requester = {
  user_id: string;
  role?: string;
};

export const getRequester = (req: Request): Requester => {
  const requester = req.user as { user_id?: string; role?: string } | undefined;

  if (!requester?.user_id) {
    throw new ApiError(401, "Unauthorized");
  }

  return { user_id: requester.user_id, role: requester.role };
};
