We currently have a copilot plugin that ingrest data from an old copilot API from github and stores it in a database so that we have historical data.

Investigate the current copilot plugin, its database schema, api surface and visualisation layer so that we know what is currently available

There has bee a new API available since April 2026 that provides the data in a different for mat

I think this is the API that is being used here

https://docs.github.com/en/rest/copilot/copilot-usage-metrics?apiVersion=2026-03-10#get-copilot-enterprise-usage-metrics

And this seems to be the schema of the metrics returned in the reports

https://docs.github.com/en/copilot/reference/copilot-usage-metrics/example-schema

I'm not sure if/how this schema differs from the original schema this plugin was created for. Im guessing the intent here is to use the new function in metricsHelpers to map this new format to the existing database schema.

I think it might be more sensible to implement the new copilot API ingestion and presentation as a new v2 functionality that replaces the current way of working entirely.

leaving in place any historic data that may be in existing tables and the API that retrieves and displays them

We should then build a new v2 ingestion and retrieval APIs that are suited to the new API format and a new presentation layer (or re-use where possible) so that we do not need to do mapping and data manipulation to fit the old method.

The new APi provides an endpoint that allows us to download raw documents full of data. We could directly query these documents or maybe even parse these dodcuments into different tables that have more specifixc data to be queried

BAsed on what we know help me build out a design and plan to build this on top of the original implemenbtation that was in place.

We can totally replace some of the tasks as the old API no longer exists and will not work.

We cna create new database tables for the new data and leave the old ones in place for historical data.

With the visulisation we can have a link ot the "old" view for the historitcal data that was pre April 2026

Output the new design and implementation plan as markdown so that we can use it as input to an agent to build out the new functionality
