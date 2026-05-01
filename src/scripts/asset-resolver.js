function isAbsoluteOrExternal(path) {
  return (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("/")
  );
}

function trimSlashes(value) {
  return String(value || "").replace(/^\/+|\/+$/g, "");
}

export function createScreenplayAssetResolver(manifest) {
  const assetsBase = trimSlashes(manifest?.assetsBase || "");

  return function resolveScreenplayAsset(relativePath = "") {
    const input = String(relativePath || "").trim();
    if (!input) {
      return input;
    }
    if (isAbsoluteOrExternal(input)) {
      return input;
    }
    if (input.startsWith("assets/")) {
      return input;
    }
    if (!assetsBase) {
      return input;
    }
    return `${assetsBase}/${trimSlashes(input)}`;
  };
}

