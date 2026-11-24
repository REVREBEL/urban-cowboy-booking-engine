// COW-101: parameterized D1 apply helpers.
//
// D1 file imports reject explicit transactions and cap statement size, which
// breaks large roomGallery snapshots. The Cloudflare D1 API accepts a batch of
// bound statements in one request; media updates and the gallery snapshot
// pointer are sent together so a failure does not leave a partial publish.

export const D1_TARGET = Object.freeze({
  accountId: "4c154709ffe87621073f9ecfa86a57dd",
  databaseId: "0d09ca5a-74fe-4e83-a058-b8aa5fb21562",
  dbName: "urban-cowboy-content",
});

/** Convert `?1`-style statements into positional API statements with params. */
export function toApiStatements(statements) {
  return statements.map((statement) => {
    const params = [];
    const sql = statement.sql.replace(/\?(\d+)/g, (_match, position) => {
      params.push(statement.params[Number(position) - 1]);
      return "?";
    });
    return { sql, params };
  });
}

/**
 * Apply one atomic batch through the D1 API. `fetchFn` is injectable for tests.
 * A failed batch throws; callers must not claim any statement was committed.
 */
export async function applyBatch(statements, options = {}) {
  const token = options.token ?? process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("Missing CLOUDFLARE_API_TOKEN for D1 API apply");
  const accountId = options.accountId ?? D1_TARGET.accountId;
  const databaseId = options.databaseId ?? D1_TARGET.databaseId;
  const fetchFn = options.fetchFn ?? fetch;
  const response = await fetchFn(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ batch: toApiStatements(statements) }),
    },
  );
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(`D1 batch failed (${response.status}): ${JSON.stringify(body.errors ?? body)}`);
  }
  const results = Array.isArray(body.result) ? body.result : [];
  const failed = results.find((result) => result?.success === false);
  if (failed) throw new Error(`D1 batch statement failed: ${JSON.stringify(failed)}`);
  return { applied: results.length, results };
}
