import { mewsJson, json, mewsLang, propertiesForEnv, propertyByConfig, type Env } from "./_lib";
import { orderedCategoryImageIds } from "../../src/lib/mewsImages";

const locStr = (v: unknown): string | null =>
  typeof v === "string" ? v : v && typeof v === "object" ? ((v as any)["fr-FR"] ?? (v as any)["en-GB"] ?? Object.values(v as any)[0] ?? null) : null;

// configuration/get — native Mews catalog for configured properties.
// Culture Créole, Villas) en UN seul appel. On cure en HotelConfig léger dans la devise par défaut :
//  • RoomCategories de TOUS les hébergements, chacune taguée `Property` (clé),
//  • Products fusionnés (dédup par Id), ImageBaseUrl, CGV, liste des hébergements.
// Caché 5 min (public) — la config bouge rarement. Aucun input front.
const handler: PagesFunction<Env> = async ({ env, request }) => {
  const lang = mewsLang(new URL(request.url).searchParams.get("lang"));
  const properties = propertiesForEnv(env);
  const res = await mewsJson<any>(env, "configuration/get", {
    Ids: properties.map((p) => p.configId),
    PrimaryId: env.MEWS_CONFIG_ID,
    LanguageCode: lang,
  });
  if (!res.ok || !res.data) return json({ error: "config_failed", status: res.status }, 502);
  const d = res.data;
  const configs: any[] = Array.isArray(d.Configurations) ? d.Configurations : [];
  const primary = configs.find((c) => c.Id === env.MEWS_CONFIG_ID)?.Enterprise ?? configs[0]?.Enterprise ?? {};
  const defaultCurrencyCode =
    // Booking Engine configuration currency wins when explicitly set; otherwise use
    // the enterprise default currency.
    (typeof d.CurrencyCode === "string" && d.CurrencyCode) ||
    (typeof primary.DefaultCurrencyCode === "string" && primary.DefaultCurrencyCode) ||
    "EUR";

  const RoomCategories: any[] = [];
  const productMap = new Map<string, any>();
  for (const cfg of configs) {
    const key = propertyByConfig(env, cfg.Id)?.key ?? null;
    const ent = cfg.Enterprise ?? {};
    const categoryImageAssignments = Array.isArray(ent.CategoryImageAssignments)
      ? ent.CategoryImageAssignments
      : [];
    for (const c of ent.Categories ?? []) {
      RoomCategories.push({
        Id: c.Id,
        Name: c.Name,
        Description: c.Description ?? null,
        ImageIds: orderedCategoryImageIds(
          c.Id,
          categoryImageAssignments,
          Array.isArray(c.ImageIds) ? c.ImageIds : [],
        ),
        NormalBedCount: c.NormalBedCount ?? 0,
        ExtraBedCount: c.ExtraBedCount ?? 0,
        SpaceType: c.SpaceType ?? "Room",
        Property: key,
      });
    }
    for (const p of ent.Products ?? []) {
      if (!productMap.has(p.Id)) {
        const legacyPrice =
          typeof p.Prices?.[defaultCurrencyCode] === "number"
            ? p.Prices[defaultCurrencyCode]
            : null;
        const absolutePrice =
          p.Pricing?.Discriminator === "Absolute"
            ? p.Pricing?.Value?.[defaultCurrencyCode]?.GrossValue
            : null;

        productMap.set(p.Id, {
          Id: p.Id,
          Name: p.Name,
          Description: p.Description ?? null,
          CategoryId: p.CategoryId ?? null,
          ImageId: p.ImageId ?? null,
          AlwaysIncluded: !!p.AlwaysIncluded,
          Prices: {
            // Current Mews configuration/get exposes absolute product prices under
            // Pricing.Value. Retain the legacy Prices fallback for older fixtures.
            [defaultCurrencyCode]:
              typeof absolutePrice === "number"
                ? absolutePrice
                : legacyPrice,
          },
          ChargingMode: p.ChargingMode ?? "",
          Property: key, // hébergement de la config d'origine → filtrage des extras côté front
        });
      }
    }
  }

  return json(
    {
      ImageBaseUrl: d.ImageBaseUrl ?? "",
      Id: primary.Id ?? env.MEWS_HOTEL_ID,
      Name: primary.Name ?? {},
      Description: primary.Description ?? null,
      DefaultCurrencyCode: defaultCurrencyCode,
      RoomCategories,
      Products: [...productMap.values()],
      PaymentGateway: null, // non fourni par configuration/get ; inutile pour la Voie A
      TermsAndConditionsUrl: locStr(primary.TermsAndConditionsUrl),
      // Liste des hébergements présents → alimente le sélecteur front.
      Properties: properties
        .filter((p) => configs.some((c) => c.Id === p.configId))
        .map((p) => ({ key: p.key, label: p.label })),
    },
    200,
    "public, max-age=300",
  );
};

export const onRequestGet = handler;
export const onRequestPost = handler;
