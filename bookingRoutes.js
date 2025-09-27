const express = require("express");
const router = express.Router();

// In-memory seat storage
const seats = {};
const TOTAL_SEATS = 10;

// Initialize seats
for (let i = 1; i <= TOTAL_SEATS; i++) {
  seats[i] = { status: "available" };
}

// Utility: Check and release expired locks
function checkLockExpiry() {
  const now = Date.now();
  for (let seatId in seats) {
    if (
      seats[seatId].status === "locked" &&
      seats[seatId].lockExpiry &&
      seats[seatId].lockExpiry < now
    ) {
      seats[seatId] = { status: "available" }; // release lock
    }
  }
}

// View all seats
router.get("/seats", (req, res) => {
  checkLockExpiry();
  res.json(seats);
});

// Lock a seat
router.post("/lock/:id", (req, res) => {
  checkLockExpiry();
  const seatId = req.params.id;
  const userId = req.body.userId;

  if (!userId) return res.status(400).json({ error: "userId required" });

  if (!seats[seatId]) return res.status(404).json({ error: "Seat not found" });

  if (seats[seatId].status === "booked") {
    return res.status(400).json({ error: "Seat already booked" });
  }

  if (seats[seatId].status === "locked") {
    return res.status(400).json({ error: "Seat already locked by another user" });
  }

  seats[seatId] = {
    status: "locked",
    lockedBy: userId,
    lockExpiry: Date.now() + 60 * 1000, // 1 min expiry
  };

  return res.json({ success: true, message: `Seat ${seatId} locked for ${userId}` });
});

// Confirm booking
router.post("/confirm/:id", (req, res) => {
  checkLockExpiry();
  const seatId = req.params.id;
  const userId = req.body.userId;

  if (!userId) return res.status(400).json({ error: "userId required" });

  if (!seats[seatId]) return res.status(404).json({ error: "Seat not found" });

  if (seats[seatId].status === "available") {
    return res.status(400).json({ error: "Seat not locked yet" });
  }

  if (seats[seatId].status === "locked" && seats[seatId].lockedBy !== userId) {
    return res.status(400).json({ error: "Seat locked by another user" });
  }

  if (seats[seatId].status === "booked") {
    return res.status(400).json({ error: "Seat already booked" });
  }

  seats[seatId] = { status: "booked", bookedBy: userId };

  return res.json({ success: true, message: `Seat ${seatId} booked for ${userId}` });
});

module.exports = router;
