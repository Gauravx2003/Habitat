import { Authenticate } from "../../../middleware/auth";
import { Response } from "express";
import {
  createRequest,
  getMyVisitorRequests,
  getPendingRequests,
  getAllRequests,
  updateVisitorRequest,
  getTodaysVisitors,
  verifyVisitorCode,
} from "./visitors.service";

export const createRequestController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { visitorName, visitorPhone, purpose, relation, visitDate } =
      req.body;
    const newRequest = await createRequest(
      visitorName,
      visitorPhone,
      purpose,
      relation,
      new Date(visitDate),
      req.user!.userId,
    );
    return res.status(201).json(newRequest);
  } catch (error) {
    console.error("DB insert failed:", error);
    return res.status(500).json({ error: "Failed to create request" });
  }
};

export const getMyVisitorRequestsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { status } = req.query;

    const requests = await getMyVisitorRequests(
      req.user!.userId,
      status as "PENDING" | "APPROVED" | "REJECTED",
    );
    return res.status(200).json(requests);
  } catch (error) {
    console.error("DB select failed:", error);
    return res.status(500).json({ error: "Failed to get requests" });
  }
};

//ADMIN
export const getPendingRequestsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const pendingrequests = await getPendingRequests();
    return res.status(200).json(pendingrequests);
  } catch (error) {
    console.error("DB select failed:", error);
    return res.status(500).json({ error: "Failed to get requests" });
  }
};

export const getAllRequestsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { status } = req.query;
    const requests = await getAllRequests(status as any);
    return res.status(200).json(requests);
  } catch (error) {
    console.error("DB select failed:", error);
    return res.status(500).json({ error: "Failed to get all requests" });
  }
};

export const updateRequestController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status != "APPROVED" && status != "REJECTED") {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedRequest = await updateVisitorRequest(id, status);
    return res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("DB update failed:", error);
    return res.status(500).json({ error: "Failed to update request" });
  }
};

//For Security

export const getTodaysVisitorsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const todaysVisitors = await getTodaysVisitors();
    return res.status(200).json(todaysVisitors);
  } catch (error) {
    console.error("DB select failed:", error);
    return res.status(500).json({ error: "Failed to get requests" });
  }
};

// Verify Visitor Entry Code (Security)
export const verifyVisitorController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { visitorId, entryCode } = req.body;

    if (!visitorId || !entryCode) {
      return res
        .status(400)
        .json({ message: "Visitor ID and Entry Code are required" });
    }

    const result = await verifyVisitorCode(visitorId, entryCode);
    return res.status(200).json(result);
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Verification failed" });
  }
};
