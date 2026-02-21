import { Request, Response } from "express";
import { Authenticate } from "../../middleware/auth";
import {
  createComplaint,
  getMyComplaints,
  getEscalatedComplaints,
  getAllComplaintCategories,
  reassignComplaint,
  adminCloseComplaint,
  residentRejectResolution,
  residentCloseComplaint,
} from "./complaints.service";
import { complaintStatusHistory, users } from "../../db/schema";
import { eq, getTableColumns } from "drizzle-orm";
import { db } from "../../db";

export const raiseComplaint = async (req: Authenticate, res: Response) => {
  try {
    const { roomId, title, categoryId, description } = req.body;

    if (!roomId || !categoryId || !description) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const complaint = await createComplaint(
      req.user!.userId,
      roomId,
      categoryId,
      description,
      title,
    );

    return res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyComplaintsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const myComplaints = await getMyComplaints(req.user!.userId);
    return res.status(200).json(myComplaints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getEscalatedComplaintsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const escalatedComplaints = await getEscalatedComplaints();
    return res.status(200).json(escalatedComplaints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getComplaintCategoriesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const categories = await getAllComplaintCategories();
    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const reassignComplaintController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { newStaffId } = req.body;

    if (!id || !newStaffId) {
      return res.status(400).json({ message: "Bad Request" });
    }

    const complaint = await reassignComplaint(id, newStaffId, req.user!.userId);

    return res.status(200).json(complaint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const residentCloseComplaintController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const complaint = await residentCloseComplaint(id, req.user!.userId);
    return res
      .status(200)
      .json({ message: "Complaint closed successfully", complaint });
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to close complaint" });
  }
};

export const residentRejectResolutionController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const complaint = await residentRejectResolution(
      id,
      req.user!.userId,
      reason,
    );
    return res
      .status(200)
      .json({ message: "Complaint escalated to Admin", complaint });
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to reject resolution" });
  }
};

export const adminCloseComplaintController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const complaint = await adminCloseComplaint(id);
    return res
      .status(200)
      .json({ message: "Complaint forcefully closed by Admin", complaint });
  } catch (error: any) {
    return res
      .status(400)
      .json({ message: error.message || "Failed to close complaint" });
  }
};

export const getComplaintHistoryController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const complaintHistory = await db
      .select({
        ...getTableColumns(complaintStatusHistory),
        changedByName: users.name,
      })
      .from(complaintStatusHistory)
      .leftJoin(users, eq(complaintStatusHistory.changedBy, users.id))
      .where(eq(complaintStatusHistory.complaintId, id));

    return res.status(200).json(complaintHistory);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
