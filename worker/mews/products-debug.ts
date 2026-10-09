import {
  json,
  mewsJson,
  mewsLang,
  propertiesForEnv,
  propertyByConfig,
  type Env,
} from "./_lib";
import {
  isSystemFeeProductId,
  knownAddOnKey,
} from "../../src/lib/catskillsMewsIds";

function localized(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;
  const values = Object.values(value as Record<string, unknown>);
  const first = values.find((item): item is string => typeof item === "string");
  return first ?? null;
}

function absoluteGross(
  product: Record<string, any>,
  currencyCode: string,
): number | null {
  const current =
    product.Pricing?.Discriminator === "Absolute"
      ? product.Pricing?.Value?.[currencyCode]?.GrossValue
      : null;
  if (typeof current === "number") return current;

  const legacy = product.Prices?.[currencyCode];
  return typeof legacy === "number" ? legacy : null;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const lang = mewsLang(new URL(request.url).searchParams.get("lang"));
  const properties = propertiesForEnv(env);

  const result = await mewsJson<any>(env, "configuration/get", {
    Ids: properties.map((property) => property.configId),
    PrimaryId: env.MEWS_CONFIG_ID,
    LanguageCode: lang,
  });

  if (!result.ok || !result.data) {
    return json(
      {
        error: "product_catalog_debug_failed",
        status: result.status,
        details: result.data,
      },
      result.status >= 400 ? result.status : 502,
    );
  }

  const data = result.data;
  const configs = Array.isArray(data.Configurations) ? data.Configurations : [];
  const primary =
    configs.find((config: any) => config.Id === env.MEWS_CONFIG_ID)?.Enterprise ??
    configs[0]?.Enterprise ??
    {};
  const currencyCode =
    (typeof data.CurrencyCode === "string" && data.CurrencyCode) ||
    (typeof primary.DefaultCurrencyCode === "string" &&
      primary.DefaultCurrencyCode) ||
    "USD";

  const products = configs.flatMap((config: any) => {
    const property = propertyByConfig(env, config.Id)?.key ?? null;
    const rawProducts = Array.isArray(config.Enterprise?.Products)
      ? config.Enterprise.Products
      : [];

    return rawProducts.map((product: Record<string, any>) => {
      const price = absoluteGross(product, currencyCode);
      const pricingDiscriminator =
        typeof product.Pricing?.Discriminator === "string"
          ? product.Pricing.Discriminator
          : null;
      const reasons: string[] = [];

      if (product.AlwaysIncluded === true) reasons.push("always_included");
      if (isSystemFeeProductId(String(product.Id ?? ""))) {
        reasons.push("system_fee");
      }
      if (pricingDiscriminator === "Relative") {
        reasons.push("relative_pricing_not_supported_by_current_shaper");
      }
      if (price == null) reasons.push("no_absolute_price_for_property_currency");
      else if (price <= 0) reasons.push("non_positive_price");

      const shapeEligible =
        product.AlwaysIncluded !== true &&
        !isSystemFeeProductId(String(product.Id ?? "")) &&
        typeof price === "number" &&
        price > 0;

      return {
        property,
        configurationId: config.Id ?? null,
        id: product.Id ?? null,
        name: localized(product.Name),
        description: localized(product.Description),
        knownAddOn: knownAddOnKey(String(product.Id ?? "")),
        currencyCode,
        extractedAbsoluteGross: price,
        pricingDiscriminator,
        chargingMode: product.ChargingMode ?? null,
        postingMode: product.PostingMode ?? null,
        includedByDefault: product.IncludedByDefault ?? null,
        alwaysIncluded: product.AlwaysIncluded ?? null,
        categoryId: product.CategoryId ?? null,
        imageId: product.ImageId ?? null,
        shapeEligible,
        exclusionReasons: reasons,
        rawProduct: product,
      };
    });
  });

  return json(
    {
      source: "Mews configuration/get",
      currencyCode,
      configurationCount: configs.length,
      productCount: products.length,
      products,
    },
    200,
    "no-store",
  );
};
