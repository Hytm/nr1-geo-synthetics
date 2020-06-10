# nr1-geo-synthetics

## Getting started

You need to register an account (for free) on the Mapbox website: https://mapbox.com

Then you can create your own token and change the code in the index.js file accordingly

```
const MAPBOX_TOKEN = "{YOUR_MAPBOX_TOKEN}"

```


Run the following scripts:

```
npm install
npm start
```

## Description
The nerdlet is organized like this:

⋅⋅*First, you have a headline with basic metrics like SLA and Checks done. Then the map, with gradient colors based on SLA.
⋅⋅*Clicking on a pin will open a side-panel with SLA and Checks done per monitor to let you explore if this is a geo-specific issue or if the SLA is impacted by only one monitor.
⋅⋅*Finally, clicking on a monitor name will let you open a panel for this specific monitor, thanks to the recent availability of Synthetics in NR1.

Hereafter, some screenshots for this nerdlet.

![landing screen](https://lh3.googleusercontent.com/PbyzXRXwPn4bTTR7G62jTiiuFL1Jqm1tuRb7CQ1Jkm1407yJuzMtKkhbm0Tvgh8UzKrrl_DZWajLxSao_g=s1600)

