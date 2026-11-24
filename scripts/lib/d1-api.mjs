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
 * Apply one atomic batch through the D1 API. `fetchFn` and `baseUrl` are
 * injectable for tests; production uses the Cloudflare endpoint.
 *
 * D1 batches are SQL transactions (Cloudflare D1 docs, `D1Database.batch`):
 * a failed statement aborts and rolls back the whole sequence. This helper
 * additionally fails closed when the API returns a 200 with missing or partial
 * results, so callers never report a partial apply as success.
 */
export async function applyBatch(submitted, options = {}) {
  const token = options.token ?? process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("Missing CLOUDFLARE_API_TOKEN for D1 API apply");
  const accountId = options.accountId ?? D1_TARGET.accountId;
  const databaseId = options.databaseId ?? D1_TARGET.databaseId;
  const fetchFn = options.fetchFn ?? fetch;
  const baseUrl = options.baseUrl ?? process.env.D1_API_BASE_URL ?? "https://api.cloudflare.com/client/v4";
  const statements = toApiStatements(submitted);
  const response = await fetchFn(
    `${baseUrl}/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ batch: statements }),
    },
  );
  const body = await response.json();
  if (!response.ok || body.success === false) {
    throw new Error(`D1 batch failed (${response.status}): ${JSON.stringify(body.errors ?? body)}`);
  }
  const results = Array.isArray(body.result) ? body.result : null;
  // Fail closed: a 200 with no/partial results must never be reported as a
  // successful apply when statements may not have committed.
  if (!results || results.length !== submitted.length) {
    throw new Error(
      `D1 batch returned ${results?.length ?? "no"} result(s) for ${submitted.length} statement(s)`,
    );
  }
  const failed = results.find((result) => result?.success === false);
  if (failed) throw new Error(`D1 batch statement failed: ${JSON.stringify(failed)}`);
  return { applied: results.length, results };
}
