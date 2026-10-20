-- PLATEAU CMS asset access per day (JST) by heavy user, for the internal report's heavy users page.
-- Reads the raw logs (kept 90 days). Heavy users are the IP addresses among the top 300 of the last 90 days
-- by requests, by bytes or by cost; the rest are summed into "(その他)". Client type and cost follow the
-- daily_cost view.
WITH req AS (
  SELECT
    DATE(l.timestamp, "Asia/Tokyo") AS day,
    l.http_request.remote_ip AS ip,
    IFNULL(NET.HOST(l.http_request.referer), "(なし)") AS referer_host,
    IFNULL(NULLIF(l.http_request.user_agent, ""), "(なし)") AS user_agent,
    CASE
      WHEN IFNULL(l.http_request.user_agent, "") = "" THEN "none"
      WHEN REGEXP_CONTAINS(LOWER(l.http_request.user_agent), r"bot|crawler|spider|slurp") THEN "bot"
      WHEN REGEXP_CONTAINS(l.http_request.user_agent, r"^(curl|Wget|wget)/") THEN "curl/wget"
      WHEN REGEXP_CONTAINS(l.http_request.user_agent, r"^(python-requests|Python|aiohttp|httpx)") THEN "python"
      WHEN STARTS_WITH(l.http_request.user_agent, "Go-http-client") THEN "go"
      WHEN REGEXP_CONTAINS(l.http_request.user_agent, r"QGIS") THEN "qgis"
      -- libplateau (PLATEAU SDK for Unity/Unreal) sends the cpp-httplib default UA.
      WHEN STARTS_WITH(l.http_request.user_agent, "cpp-httplib/") THEN "plateau-sdk"
      WHEN REGEXP_CONTAINS(l.http_request.user_agent, r"Unity|UnrealEngine|Cesium") THEN "3d-engine"
      WHEN STARTS_WITH(l.http_request.user_agent, "Mozilla/") THEN "browser"
      ELSE "other"
    END AS client_type,
    -- Where the request came from, as in the other data sources. The SDK sends no referer, so it is told
    -- apart by its user agent.
    CASE
      WHEN STARTS_WITH(l.http_request.user_agent, "cpp-httplib/") THEN "PLATEAU SDK"
      WHEN NET.HOST(l.http_request.referer) IS NULL THEN "(なし)"
      WHEN NET.HOST(l.http_request.referer) = "plateauview.mlit.go.jp" OR ENDS_WITH(NET.HOST(l.http_request.referer), ".plateauview.mlit.go.jp") THEN "PLATEAU VIEW"
      WHEN NET.HOST(l.http_request.referer) = "geospatial.jp" OR ENDS_WITH(NET.HOST(l.http_request.referer), ".geospatial.jp") THEN "G空間情報センター"
      WHEN NET.HOST(l.http_request.referer) IN ("localhost", "127.0.0.1", "[::1]", "0.0.0.0") OR ENDS_WITH(NET.HOST(l.http_request.referer), ".localhost")
        OR REGEXP_CONTAINS(NET.HOST(l.http_request.referer), r"^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)") THEN "ローカル（自分のPC・LAN）"
      ELSE "その他のサイト"
    END AS source,
    -- "partial": served from cache but part of the object was filled from the origin.
    CASE
      WHEN l.http_request.cache_hit AND l.http_request.cache_fill_bytes IS NOT NULL THEN "partial"
      WHEN l.http_request.cache_hit THEN "hit"
      WHEN l.http_request.cache_fill_bytes IS NOT NULL THEN "miss"
      ELSE "uncached"
    END AS cache_status,
    IFNULL(l.http_request.cache_lookup, FALSE) AS cache_lookup,
    IFNULL(CAST(l.http_request.response_size AS INT64), 0) AS bytes,
    IFNULL(CAST(l.http_request.cache_fill_bytes AS INT64), 0) AS fill_bytes
  FROM `reearth-plateau.cms_assets_requests_analytics._AllLogs` l
  WHERE l.timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE("Asia/Tokyo"), INTERVAL 89 DAY), "Asia/Tokyo")
    -- Whole days only, like the aggregated tables.
    AND l.timestamp < TIMESTAMP(CURRENT_DATE("Asia/Tokyo"), "Asia/Tokyo")
    -- The CDN's own revalidation requests are logged with the client's IP; leave them out.
    AND NOT STARTS_WITH(IFNULL(l.http_request.user_agent, ""), "Cloud-CDN-Google")
),
ipv4 AS (SELECT DISTINCT ip, NET.IPV4_TO_INT64(NET.IP_FROM_STRING(ip)) AS n FROM req WHERE STRPOS(ip, ":") = 0),
geo AS (
  SELECT i.ip, ANY_VALUE(c.country) AS country
  FROM ipv4 i
  JOIN `reearth-plateau.cms_assets_analytics.ipv4_country` c
    ON c.bucket = DIV(i.n, 65536) AND i.n BETWEEN c.ip_from AND c.ip_to
  GROUP BY i.ip
),
asn AS (
  -- Network operators by DB-IP (https://db-ip.com), CC BY 4.0.
  SELECT i.ip, ANY_VALUE(CONCAT("AS", a.asn, " ", a.org)) AS asn_org
  FROM ipv4 i
  JOIN `reearth-plateau.cms_assets_analytics.ipv4_asn` a
    ON a.bucket = DIV(i.n, 65536) AND i.n BETWEEN a.ip_from AND a.ip_to
  GROUP BY i.ip
),
price AS (SELECT item, region, unit_price_jpy FROM `reearth-plateau.cms_assets_analytics.unit_price`),
labeled AS (
  SELECT
    r.*,
    IFNULL(geo.country, "ZZ") AS country,
    IFNULL(asn.asn_org, "(不明)") AS asn_org,
    -- Same estimate as the daily_cost view.
    IF(r.cache_status != "uncached", r.bytes / POW(1024, 3) * IFNULL(pe.unit_price_jpy, pe_asia.unit_price_jpy), 0)
      + IF(r.cache_status = "uncached", r.bytes / POW(1024, 3) * IFNULL(pi.unit_price_jpy, pi_apac.unit_price_jpy), 0)
      + r.fill_bytes / POW(1024, 3) * IFNULL(pf.unit_price_jpy, pf_asia.unit_price_jpy)
      + IF(r.cache_lookup, pl.unit_price_jpy, 0)
      + IF(r.cache_status != "hit", po.unit_price_jpy, 0) AS est_cost_jpy
  FROM req r
  LEFT JOIN geo USING (ip)
  LEFT JOIN asn USING (ip)
  LEFT JOIN `reearth-plateau.cms_assets_analytics.country_region` cr ON cr.country = IFNULL(geo.country, "ZZ")
  LEFT JOIN price pe ON pe.item = "cdn_egress" AND pe.region = cr.cdn_region
  LEFT JOIN price pe_asia ON pe_asia.item = "cdn_egress" AND pe_asia.region = "Asia"
  LEFT JOIN price pi ON pi.item = "internet_egress" AND pi.region = cr.egress_region
  LEFT JOIN price pi_apac ON pi_apac.item = "internet_egress" AND pi_apac.region = "Apac"
  LEFT JOIN price pf ON pf.item = "cache_fill" AND pf.region = cr.cdn_region
  LEFT JOIN price pf_asia ON pf_asia.item = "cache_fill" AND pf_asia.region = "Asia"
  LEFT JOIN price pl ON pl.item = "cache_lookup"
  LEFT JOIN price po ON po.item = "gcs_class_b"
),
top AS (
  SELECT ip, SUM(bytes) AS total_bytes
  FROM labeled
  GROUP BY ip
  QUALIFY ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) <= 300
    OR ROW_NUMBER() OVER (ORDER BY SUM(bytes) DESC) <= 300
    OR ROW_NUMBER() OVER (ORDER BY SUM(est_cost_jpy) DESC) <= 300
),
ranked AS (SELECT ip, ROW_NUMBER() OVER (ORDER BY total_bytes DESC) AS user_rank FROM top)
SELECT
  l.day,
  IF(r.ip IS NULL, "(その他)", l.ip) AS user,
  IF(r.ip IS NULL, "(その他)", l.asn_org) AS asn_org,
  IF(r.ip IS NULL, "(その他)", l.country) AS country,
  l.client_type,
  l.source,
  COUNT(*) AS requests,
  COUNT(DISTINCT l.ip) AS ips,
  SUM(l.bytes) / POW(1024, 3) AS gib,
  SUM(l.est_cost_jpy) AS est_cost_jpy
FROM labeled l
LEFT JOIN ranked r USING (ip)
GROUP BY day, user, asn_org, country, client_type, source
