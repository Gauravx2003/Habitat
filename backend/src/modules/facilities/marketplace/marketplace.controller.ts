import { Response } from "express";
import { Authenticate } from "../../../middleware/auth";
import {
  createListing,
  getAvailableListings,
  placeBid,
  acceptBid,
  confirmHandover,
  cancelHandover,
} from "./marketplace.service";

// ─── 1. CORE LISTING & BROWSING ───

export const createListingController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { title, description, category, price, condition, images } = req.body;
    const sellerId = req.user!.userId;
    const hostelId = req.user!.hostelId; // Keep marketplace exclusive to their own hostel

    const newItem = await createListing(sellerId, hostelId, {
      title,
      description,
      category,
      price: Number(price), // Ensure it's a number
      condition,
      images,
    });

    res
      .status(201)
      .json({ message: "Item listed successfully!", item: newItem });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Failed to create listing" });
  }
};

export const getListingsController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const hostelId = req.user!.hostelId;
    const items = await getAvailableListings(hostelId);

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch listings" });
  }
};

// ─── 2. THE BIDDING ENGINE ───

export const placeBidController = async (req: Authenticate, res: Response) => {
  try {
    const { itemId } = req.params;
    const { offeredPrice, message } = req.body;
    const buyerId = req.user!.userId;

    const newBid = await placeBid(
      buyerId,
      itemId,
      Number(offeredPrice),
      message,
    );

    res.status(201).json({ message: "Offer sent to seller!", bid: newBid });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to place bid" });
  }
};

// ─── 3. THE STATE MACHINE (ACCEPT, CONFIRM, CANCEL) ───

export const acceptBidController = async (req: Authenticate, res: Response) => {
  try {
    const { bidId } = req.params;
    const sellerId = req.user!.userId;

    const acceptedBid = await acceptBid(sellerId, bidId);

    res.json({
      message: "Offer accepted! Item is now pending handover.",
      bid: acceptedBid,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to accept bid" });
  }
};

export const confirmHandoverController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { itemId } = req.params;
    const sellerId = req.user!.userId;

    const soldItem = await confirmHandover(sellerId, itemId);

    res.json({
      message: "Sale confirmed! Item marked as SOLD.",
      item: soldItem,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Failed to confirm handover" });
  }
};

export const cancelHandoverController = async (
  req: Authenticate,
  res: Response,
) => {
  try {
    const { itemId } = req.params;
    const sellerId = req.user!.userId;

    const reactivatedItem = await cancelHandover(sellerId, itemId);

    res.json({
      message: "Handover cancelled. Item is back on the market.",
      item: reactivatedItem,
    });
  } catch (error: any) {
    res
      .status(400)
      .json({ message: error.message || "Failed to cancel handover" });
  }
};
