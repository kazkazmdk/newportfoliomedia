# Data sources and licensing

This is a compilation of **facts used by decision engines**, not a dump of manufacturer manuals.

| source_id | What it is | Commercial reuse | Cache | Redistribute | Attribution |
| --- | --- | --- | --- | --- | --- |
| fixcode-support-corpus | Compiled error trees from public support pages + service notes | facts only | yes | no verbatim manuals | manufacturer support URLs |
| oem-handbook | Oil / capacity / interval facts | facts only | yes | no handbook scans | manufacturer |
| oem-power-specs | Device input limits + charger PDO / allocation tables | facts only | months | no datasheet dump | manufacturer |
| climate-normals-compiled | Monthly typical climate (not a forecast) | compiled aggregates | long | aggregates ok | compilation notes |
| seed-transport-snapshot | Typical fares, fuel, tolls | estimates only | hours once live | not live tickets | snapshot date |
| open-meteo | Optional forecast HTTP | **check terms before production** | hours | provider terms | Open-Meteo if used |

If terms for a **critical** dataset are unknown, ingestion is blocked. That is why Whirlpool, live VIN, live SNCF, and lab wattage are **not** in this graph.

TTL:

- historical climate: long
- forecast: hours
- recall: days
- charger spec: months
- transport fare: hours (seed snapshot until a contracted API exists)
