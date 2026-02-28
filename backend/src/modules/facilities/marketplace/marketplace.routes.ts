import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import {
  createListingController,
  getListingsController,
  placeBidController,
  acceptBidController,
  confirmHandoverController,
  cancelHandoverController,
} from "./marketplace.controller";

const marketplaceRouter = Router();

// Apply authenticate middleware to all marketplace routes
marketplaceRouter.use(authenticate);

// 1. Browsing & Listing
marketplaceRouter.get("/items", getListingsController);
marketplaceRouter.post("/items", createListingController);

// 2. Bidding
marketplaceRouter.post("/items/:itemId/bids", placeBidController);

// 3. Managing Offers & Handovers (Seller Actions)
marketplaceRouter.post("/bids/:bidId/accept", acceptBidController);
marketplaceRouter.post("/items/:itemId/confirm", confirmHandoverController);
marketplaceRouter.post("/items/:itemId/cancel", cancelHandoverController);

export default marketplaceRouter;
