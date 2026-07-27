/**
 * Generates data/patterns/patterns.json from data/patterns/patterns.yaml.
 *
 * JSR doesn't resolve raw text imports (`with { type: "text" }`), so
 * PatternLib.fromBuiltInData() instead loads this JSON via a stable
 * `with { type: "json" }` import. Run this after editing patterns.yaml to
 * keep the JSON in sync:
 *
 *   deno task patterns:build
 */
import { parse } from "@std/yaml";

const yamlUrl = new URL("../data/patterns/patterns.yaml", import.meta.url);
const jsonUrl = new URL("../data/patterns/patterns.json", import.meta.url);

const yamlText = await Deno.readTextFile(yamlUrl);
const parsed = parse(yamlText);

await Deno.writeTextFile(jsonUrl, JSON.stringify(parsed, null, 2) + "\n");
