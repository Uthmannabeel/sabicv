import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json exists in the user's home directory; without
  // this Next infers the workspace root one level too high.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
