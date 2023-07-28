"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  middleware: () => middleware,
  withSplit: () => withSplit
});
module.exports = __toCommonJS(src_exports);

// src/constants.ts
var ORIGINAL_DISTRIBUTION_KEYS = [
  "original",
  "master",
  "main"
];

// src/make-runtime-config.ts
var makeRuntimeConfig = (options) => {
  return Object.entries(options).reduce((res, [key, option]) => ({
    ...res,
    [key]: {
      path: option.path,
      hosts: Object.fromEntries(Object.entries(option.hosts).map(([branch, host]) => [
        branch,
        convertHost(branch, host)
      ])),
      cookie: { path: "/", maxAge: 60 ** 2 * 24 * 1e3, ...option.cookie }
    }
  }), {});
};
var convertHost = (branch, host) => {
  const isOriginal = ORIGINAL_DISTRIBUTION_KEYS.includes(branch);
  return typeof host === "string" ? {
    weight: 1,
    host: correctHost(host),
    isOriginal
  } : {
    ...host,
    host: correctHost(host.host),
    isOriginal
  };
};
var correctHost = (host) => {
  const newHost = /^https?:\/\/.+/.test(host) ? host : `https://${host}`;
  try {
    new URL(newHost);
  } catch (_) {
    throw new Error(`Incorrect host format: ${host}`);
  }
  if (new URL(newHost).origin !== newHost)
    throw new Error(`Incorrect host format: Specify only the protocol and domain (you set '${host}')`);
  return newHost;
};

// src/with-split.ts
var withSplit = ({ splits: _splits = {}, ...manuals }) => (nextConfig) => {
  const splits = Object.keys(_splits).length > 0 ? _splits : JSON.parse(process.env.SPLIT_CONFIG_BY_SPECTRUM ?? "{}");
  if (["true", "1"].includes(process.env.SPLIT_DISABLE ?? ""))
    return nextConfig;
  const isMain = ["true", "1"].includes(process.env.SPLIT_ACTIVE ?? "") || (manuals?.isOriginal ?? process.env.VERCEL_ENV === "production");
  const splitting = Object.keys(splits).length > 0 && isMain;
  const assetHost = manuals?.hostname ?? process.env.VERCEL_URL;
  const currentBranch = manuals?.currentBranch ?? process.env.VERCEL_GIT_COMMIT_REF ?? "";
  if (splitting) {
    console.log("Split tests are active.");
    console.table(Object.entries(splits).map(([testKey, options]) => {
      if (!options.path)
        throw new Error(`Invalid format: The \`path\` is not set on \`${testKey}\`.`);
      return {
        testKey,
        path: options.path,
        distributions: Object.keys(options.hosts)
      };
    }));
  }
  if (isSubjectedSplitTest(splits, currentBranch))
    process.env.NEXT_PUBLIC_IS_TARGET_SPLIT_TESTING = "true";
  return {
    ...nextConfig,
    assetPrefix: nextConfig.assetPrefix || (!isMain && assetHost ? `https://${assetHost}` : ""),
    images: {
      ...nextConfig.images,
      path: nextConfig.images?.path || (!isMain && assetHost ? `https://${assetHost}/_next/image` : void 0)
    },
    env: {
      ...nextConfig.env,
      ...isMain && {
        NEXT_WITH_SPLIT_RUNTIME_CONFIG: JSON.stringify(makeRuntimeConfig(splits))
      }
    }
  };
};
var isSubjectedSplitTest = (splits, currentBranch) => {
  const branches = Object.values(splits).flatMap(({ hosts }) => Object.keys(hosts));
  return branches.includes(currentBranch);
};

// omitted:./middleware
var middleware = () => {
  throw new Error("Not defined middleware.");
};
