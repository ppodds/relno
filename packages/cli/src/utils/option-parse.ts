export function parseMetadata(
  value: string,
  previous: { [key: string]: string },
) {
  const t = value.split("=");
  if (t.length !== 2)
    throw new Error(
      `Invalid metadata: ${value}. Metadata need to specify in key=value. e.g. compareUrl=test`,
    );
  const [key, val] = t;
  return { ...previous, [key]: val };
}
