import neo4j, { Driver, Session, QueryResult } from "neo4j-driver";

const URI = process.env.COGNODB_URI as string;
const USER = process.env.COGNODB_USER as string;
const PASSWORD = process.env.COGNODB_PASSWORD as string;

if (!URI || !USER || !PASSWORD) {
  throw new Error(
    "CognoDB connection details missing. Check your .env.local file."
  );
}


declare global {
  var _cognoDriver: Driver | undefined;
}

function createDriver(): Driver {
  return neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD), {
    maxConnectionPoolSize: 20,
    connectionAcquisitionTimeout: 10000, 
  });
}

const driver: Driver = global._cognoDriver ?? createDriver();

if (process.env.NODE_ENV !== "production") {
  global._cognoDriver = driver;
}

export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session: Session = driver.session();

  try {
    const result: QueryResult = await session.run(cypher, params);

    return result.records.map((record) => {
      const obj: Record<string, unknown> = {};
      record.keys.forEach((key) => {
        const value = record.get(key);
        obj[key as string] = neo4jValueToJs(value);
      });
      return obj as T;
    });
  } catch (error) {
    console.error("CognoDB query failed:", error);
    throw new Error("Database query failed. Please try again.");
  } finally {
    await session.close();
  }
}


function neo4jValueToJs(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (neo4j.isInt(value)) {
    return value.toNumber();
  }

  if (typeof value === "object" && value !== null && "properties" in value) {
    const node = value as { labels?: string[]; properties: Record<string, unknown> };
    const props: Record<string, unknown> = {};
    for (const key in node.properties) {
      props[key] = neo4jValueToJs(node.properties[key]);
    }
    return { ...props, __labels: node.labels };
  }

  if (Array.isArray(value)) {
    return value.map(neo4jValueToJs);
  }

  return value;
}

export async function checkConnection(): Promise<boolean> {
  try {
    await driver.verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}

export default driver;