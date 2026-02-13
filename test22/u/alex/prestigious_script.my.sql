-- https://www.windmill.dev/docs/getting_started/scripts_quickstart/sql#result-collection
-- result_collection=legacy

CREATE TABLE IF NOT EXISTS MSSMailBilling (
  DOMAIN TEXT NOT NULL,
  CUSTOMER TEXT NOT NULL,
  SAP TEXT NOT NULL,
  TICKET TEXT,
  SECUREMAILHUB BOOL DEFAULT FALSE,
  SEPPMAIL BOOL DEFAULT FALSE,
  MPKI TEXT,
  UNIQUE (DOMAIN)
);
-- adfadsf