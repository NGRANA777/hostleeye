import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const io = (res.socket as any)?.server?.io;
    if (io) {
      io.emit(req.body.event, req.body.data);
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: "Socket.io not initialized" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
