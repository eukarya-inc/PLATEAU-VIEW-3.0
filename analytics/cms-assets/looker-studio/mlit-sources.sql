-- PLATEAU CMS asset access per day (JST) by where it came from. For MLIT:
-- source (VIEW / SDK / G空間), client type, referer and network operator (ASN). No cost or IP addresses.
-- Requests and bytes come from daily_cost; IP counts come from daily_clients, which has no per-file rows.
-- ips counts distinct IPs per day and row, so summed rows overlap where an IP used several referers or UAs.
WITH usage AS (
  SELECT
    day, referer_host, user_agent, country, asn, client_type, source, asn_org,
    SUM(requests) AS requests, SUM(bytes) AS bytes
  FROM `reearth-plateau.cms_assets_analytics.daily_cost`
  GROUP BY day, referer_host, user_agent, country, asn, client_type, source, asn_org
),
labeled AS (
  SELECT
    u.day,
    u.country,
    u.client_type,
    CASE u.source
      WHEN "PLATEAU SDK" THEN "PLATEAU SDK"
      WHEN "PLATEAU VIEW" THEN "PLATEAU VIEW"
      WHEN "G-Spatial Information Center" THEN "G空間情報センター"
      WHEN "local" THEN "ローカル（自分のPC・LAN）"
      WHEN "none" THEN "(なし)"
      ELSE "その他のサイト"
    END AS source,
    IFNULL(u.referer_host, "(なし)") AS referer_host,
    -- Network operators by DB-IP (https://db-ip.com), CC BY 4.0.
    IF(u.asn IS NULL, "(不明)", CONCAT("AS", u.asn, " ", u.asn_org)) AS asn_org,
    u.requests,
    u.bytes,
    -- The CDN's own revalidation requests are logged with the client's IP; leave them out of IP counts.
    IF(STARTS_WITH(IFNULL(u.user_agent, ""), "Cloud-CDN-Google"), 0, IFNULL(c.ips, 0)) AS ips
  FROM usage u
  LEFT JOIN `reearth-plateau.cms_assets_analytics.daily_clients` c
    ON c.day = u.day
    AND IFNULL(c.referer_host, "") = IFNULL(u.referer_host, "")
    AND IFNULL(c.user_agent, "") = IFNULL(u.user_agent, "")
    AND c.country = u.country
    AND IFNULL(c.asn, -1) = IFNULL(u.asn, -1)
),
top_country AS (
  SELECT country FROM labeled GROUP BY country
  QUALIFY ROW_NUMBER() OVER (ORDER BY SUM(requests) DESC) <= 25
),
top_referer AS (
  SELECT referer_host FROM labeled GROUP BY referer_host
  QUALIFY ROW_NUMBER() OVER (ORDER BY SUM(requests) DESC) <= 50
),
top_asn AS (
  SELECT asn_org FROM labeled GROUP BY asn_org
  QUALIFY ROW_NUMBER() OVER (ORDER BY SUM(bytes) DESC) <= 50
)
SELECT
  l.day,
  IF(tc.country IS NULL, "(その他)", l.country) AS country,
  l.client_type,
  l.source,
  IF(tr.referer_host IS NULL, "(その他)", l.referer_host) AS referer_host,
  IF(ta.asn_org IS NULL, "(その他)", l.asn_org) AS asn_org,
  SUM(l.requests) AS requests,
  SUM(l.ips) AS ips,
  SUM(l.bytes) / POW(1024, 3) AS gib
FROM labeled l
LEFT JOIN top_country tc USING (country)
LEFT JOIN top_referer tr USING (referer_host)
LEFT JOIN top_asn ta USING (asn_org)
GROUP BY day, country, client_type, source, referer_host, asn_org
