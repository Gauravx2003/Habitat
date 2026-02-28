import { Response } from "express";
import { Authenticate } from "../../../middleware/auth";
import { uploadAttachment } from "./campusHubAttachments.service";

export async function addAttachments(req: Authenticate, res: Response) {
  try {
    const { eventId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploaded = await uploadAttachment(files, req.user!.userId, eventId);

    res.status(201).json(uploaded);
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
}
