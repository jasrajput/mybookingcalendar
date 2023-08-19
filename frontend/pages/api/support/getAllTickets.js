import cookie from "cookie";

export default async (req, res) => {
  try {
    if (req.method === "GET") {
      if (!req.headers.cookie) {
        res.status(403).json({ msg: "No cookie found, Not Authorized" });
        return;
      }

      const { token } = cookie.parse(req.headers.cookie);

      const backendRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/support/all-tickets`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const backendData = await backendRes.json();

      if (backendRes.ok) {
        // set cookie
        res.setHeader(
          "Set-Cookie",
          cookie.serialize("token", backendData.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            sameSite: "strict",
            path: "/",
          })
        );

        res.status(200).json(backendData.tickets);
      } else {
        res.status(backendRes.status).json(backendData);
      }
    } else {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ message: `method ${req.method} not allowed` });
    }
  } catch (error) {
    res.status(500).json({ message: "Cannot connect to the server" });
  }
};
