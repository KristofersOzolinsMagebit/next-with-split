// omitted:./with-split
var withSplit = () => {
  throw new Error("Not defined withSplit.");
};

// src/middleware.ts
import { NextResponse, userAgent } from "next/server";

// src/random.ts
var random = (length) => Math.floor(Math.random() * length);

// src/middleware.ts
var middleware = (req) => {
  const [splitKey, config] = getCurrentSplitConfig(req) ?? [];
  if (!splitKey || !config || userAgent(req).isBot)
    return;
  const branch = getBranch(req, splitKey, config);
  return sticky(createResponse(req, branch, config), splitKey, branch, config.cookie);
};
var cookieKey = (key) => `x-split-key-${key}`;
var getCurrentSplitConfig = (req) => {
  if (req.cookies.has("__prerender_bypass"))
    return;
  if (!process.env.NEXT_WITH_SPLIT_RUNTIME_CONFIG)
    return;
  return Object.entries(JSON.parse(process.env.NEXT_WITH_SPLIT_RUNTIME_CONFIG)).find(([, { path }]) => {
    return new RegExp(path).test(req.nextUrl.pathname);
  });
};
var getBranch = (req, splitKey, config) => {
  const cookieBranch = req.cookies.get(cookieKey(splitKey));
  if (cookieBranch && config.hosts[cookieBranch])
    return cookieBranch;
  const branches = Object.entries(config.hosts).reduce((res, [key, { weight }]) => [...res, ...new Array(weight).fill(key)], []);
  return branches[random(branches.length)];
};
var sticky = (res, splitKey, branch, cookieConfig) => {
  res.cookies.set(cookieKey(splitKey), branch, cookieConfig);
  return res;
};
var createResponse = (req, branch, config) => {
  const rewriteTo = `${config.hosts[branch].isOriginal ? "" : config.hosts[branch].host}${req.nextUrl.href.replace(req.nextUrl.origin, "")}`;
  const isExternal = rewriteTo.startsWith("http");
  if (isExternal)
    return NextResponse.rewrite(rewriteTo);
  return NextResponse.next();
};
export {
  middleware,
  withSplit
};
