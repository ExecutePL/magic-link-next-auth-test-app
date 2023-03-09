/* eslint-disable @typescript-eslint/await-thenable */
import { Magic } from "@magic-sdk/admin";

// Initiating Magic instance for server-side methods
const magic = new Magic(process.env.MAGIC_SECRET_KEY);

export default async function login(
  req: { headers: { authorization: string } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: {
        (arg0: { authenticated?: boolean; error?: any }): void;
        new (): any;
      };
    };
  }
) {
  try {
    const didToken = req.headers.authorization.substr(7);
    await magic.token.validate(didToken);
    res.status(200).json({ authenticated: true });
  } catch (error) {
    res.status(500).json({ error: "error" });
  }
}
