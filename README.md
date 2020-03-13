## TL;DR

Understand, anticipate, and act to support and ramp up our local health systems' capacity (providers, supplies, ventilators, beds, meds) to effectively care for a rapidly growing # of COVID19 patients. 

Open geospatial analysis, data viz, and scenario-planning tools to boost our healthcare system capacity at local, county, & state scale where the needs are greatest. Focused on USA at the moment but tools and knowhow is applicable globally.

Let's #FlattenTheCurve and raise our capacity to care for COVID19 patients here and now.

## What to Do

1. understand baseline capacity of healthcare systems at local-enough scale for decision-makers (i.e. City, County and State-level admins and depts of health)
  
    1.1: Amass healthcare facilities, beds, care utilization, provider data from national, state, county data sources:
        
    * NY: 
        * https://health.data.ny.gov/Health/Health-Facility-Map/875v-tpc8
        * https://health.data.ny.gov/Health/Adult-Care-Facility-Directory/wssx-idhx
        * https://health.data.ny.gov/Health/Health-Facility-Certification-Information/2g9y-7kqm
    * CA: 
        * https://healthdata.gov/dataset/licensed-and-certified-healthcare-facility-bed-types-and-counts
    * NJ: 
        * https://www.nj.gov/cgi-bin/dhss/healthfacilities/hospitaldisplay.pl?id=10402
    * MA:
        * https://www.mass.gov/service-details/find-information-about-licensed-or-certified-health-care-facilities
    * National (CMS HCRIS reporting data):
        * https://www.cms.gov/files/document/2018-mdcr-providers-4.pdf
        * https://www.cms.gov/research-statistics-data-systems/provider-services-current-files/2019-pos-file
        * https://www.resdac.org/articles/medicare-cost-report-data-structure

    1.2: Clean-up and bring together into data-science ready formats:
    
    * Notebooks: [/nbs](./nbs/) (pending)
    * Geojson: [/data](./data/)

    1.3: Visualizations: 
    
    * https://daveluo.github.io/covid19-healthsystemcapacity/viz/covid19-usabedcapacity-geoviz20200313v1

2. map HC capacity distribution in space and time compared to the anticipated distribution and velocity of COVID spread

    2.1: tracking cases/testing:
    * http://coronavirusapi.com/
    * https://covidtracking.com/
    * https://projects.sfchronicle.com/2020/coronavirus-map/
    * https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html
    * https://github.com/pcm-dpc/COVID-19
    * https://scarpino.shinyapps.io/Emergent_Epidemics_Lab_nCoV2019/?mkt_tok=eyJpIjoiWmpFMVpEY3pZalk0WVRNMyIsInQiOiJvWGl2RnhkRDZaOHpGcVVSNGhyT2JxWVJcLzdIdVBFam96b3MxZFM2WkdKT09PK1wvTm5Jb1loMzNLMVl2TUhDb05cL0tMUVM1ZzBtUnpvTWY2bjdocW8rb1JGSXlpejZsXC96TGhpVHNvXC95NzhKcGd0dkF2K2dFNlZySmt1QTZzaWVyIn0%3D
    * http://virological.org/t/epidemiological-data-from-the-ncov-2019-outbreak-early-descriptions-from-publicly-available-data/337/2
    
    2.2: epi modeling:
    * https://avatorl.org/covid-19/
    * https://my.causal.app/models/1432
    * http://deim.urv.cat/~alephsys/COVID-19/spain/es/index.html
    * https://www.lshtm.ac.uk/research/centres/centre-mathematical-modelling-infectious-diseases
    * http://scratch.neherlab.org/about
    * https://institutefordiseasemodeling.github.io/COVID-public/

2. assess our ability to ramp-up capacity and track our progress
3. identify the remaining care gap as proactively as possible
4. deploy more resources to where it needs to be the most

## How

grabbed every health facility info that reported cost data to Medicare in 2018, geocoded them, and compiled their various reported bed capacities (ICU, adult+peds, Total beds)

calculated some bed util rates

and then aggregated to the county level, summed up the bed counts and took some census pop data to calculate beds/1000 people and beds/1000 15+ year olds

got some really messy jupyter notebooks that did this processing, and i'm using kepler to visualize for speed's sake

## Where to Help

- geodata cleanup, further processing, spatial analysis and combining with other datasets like covid case counts by day/county/state, this is maybe the best one for the US right now: https://covidtracking.com/
- better visualizations for sure
- basic epi modeling would be really helpful to project out what the case counts and demand on the healthcare system would be, ideally to the individual county level but statewide works too. Something like this SIR model would be a great start: https://neherlab.org/covid19/
- comms and user/general public education - what and why are these tools important for personal & community protection, public health decisionmaking at the local, county & state levels

## Why

![flattenthecurve animation](https://media.giphy.com/media/dWCcpgCRiOHk5B8znA/giphy.gif)

Source: https://twitter.com/alxrdk/status/1237021885239635969

You've likely seen some version of this #FlattenTheCurve diagram. Look at the orange lines. They're described as "Treatment Capacity without action" (dashed orange) and "Treatment capacity with delay" (solid orange) here and labeled as "Health Systems Capacity" in many other graphics. 

Notice how it dips and grows differently between the peak caseload vs flattened caseload scenarios. This reflects our healthcare systems' ability to respond to the growing crisis by making available more providers, general inpatient and ICU beds, ventilators, supplies, etc. But there are hard limits to that capacity growth as signified by the plateau. 

More importantly, the lowest point of that initial capacity dip (as [health systems become overwhelmed](https://www.theatlantic.com/ideas/archive/2020/03/who-gets-hospital-bed/607807/) by rapidly surging #s of active patients and deteriorate in their ability to effectively care for them) and the speed at which a health system can recover and ramp up from it is a localized question.

While [new cases are being reported every day in new places across the globe](https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6) and [estimates that 20-60% of the adult population may ultimately be infected](https://news.harvard.edu/gazette/story/2020/03/hundreds-of-u-s-coronavirus-cases-may-have-slipped-through-screenings/) by the virus permeate the public's understanding, this spread is not evenly distributed in space nor time. Even considering disparities in covid19 testing capacity and the lag between getting infected and showing symptoms which delay or skew our understanding of the disease's true spatial and temporal distribution, local outbreaks still start from somewhere. Their growth rates can differ depending on population density, distribution of age and/or health comorbidities, effectiveness of early testing and containment efforts, and social distancing or other mitigation measures put in place when and how aggressively. In short, the slope of increase and peak of the curve can be different in different places.

This example of the different infectious disease impact on different communities is well studied in the 1918 Spanish Flu case of Philadelpha and St. Louis:

![](https://cms.qz.com/wp-content/uploads/2020/03/image.png?w=1240&h=778&crop=1&strip=all&quality=75)
Source: [Quartz: This chart of the 1918 Spanish flu shows why social distancing works](https://qz.com/1816060/a-chart-of-the-1918-spanish-flu-shows-why-social-distancing-works/)

For COVID19, differences are seen in Wuhan versus Guangzhou provinces in China (note the difference of scale on the Y-axis):

![Figure 1. Burden of serious COVID-19 disease in Wuhan](https://pbs.twimg.com/media/ESv2FbsXgAE6cH_.jpg)

![Figure 2. Burden of serious COVID-19 disease in Guangzhou](https://pbs.twimg.com/media/ESv2ifqWkAUDe6N.jpg)

Explanatory twitter thread: https://threadreaderapp.com/thread/1237347774951305216.html

Paper: https://dash.harvard.edu/handle/1/42599304

### Take-home message #1:
Social distancing measures work and is the best practice we have on hand to slow the growth rate, lower the peak, and flatten the curve so that health systems have time to ramp up and the caseload doesn't exceed their capacity to provide effective care. Know what to do and do your part to protect yourself and your community with these resources:
- [FlattenTheCurve](https://www.flattenthecurve.com/)
- [StayTheFuckHome](https://staythefuckhome.com/)

### Take-home message #2:
Our health system capacity is at great risk of being exceeded. If you look again at the above figure for Wuhan province at their peak case load, the # of critically ill patients (who require ICU-level care) per capita hits the USA' # of available ICU beds per capita. 

**In other words, if the US has a similar experience as Wuhan, we would completely fill our ICUs with COVID19 patients.** Note that our ICUs typically operate at around 70% occupancy so this would mean everyone else who usually needs to be in the ICU would either not be, critically ill COVID patients would be insufficiently managed, or both. The US is very much on the trajectory of [Italy in facing not a wave, but a tsunami of patients](https://www.pbs.org/newshour/health/not-a-wave-a-tsunami-italy-hospitals-at-virus-limit):
- https://www.statnews.com/2020/03/10/simple-math-alarming-answers-covid-19/
- https://www.npr.org/2020/03/06/812967454/u-s-hospitals-prepare-for-a-covid-19-wave

In the same study above, researchers model the epidemiology of viral spread to the US population in different areas based on the underlying demographics (how many are 65+ in age or how many have hypertension) and its potential peak caseload:

![](./figs/icu_demand_paper_fig3.png)

The cited US national average for ICU beds is 2.80 per 10,000 adults (15+) and the # of empty beds is 31.8%. Based on those high-level numbers, our healthcare capacity - critical care capacity in particular via ICUs - will be strained past its limit in every city shown in figure 3.

How much past 100% care utilization will the demand be? How close (or past) the breaking point will we go? How do we minimize this gap as much and as proactively as possible? 

Knowing this rests on knowing more granularly (at least as a rough proxy of health system capacity) what the # of beds (total inpatient and ICU) per capita currently are in each city, county, state, and region are. Knowing this means we have a better, more concrete, more actionable idea of what the gap between demand and supply currently is in a particular location, and what it may become under different scenarios of mitigating disease spread and dispatching critical and limited healthcare resources.

Finding out, anticipating, and addressing this healthcare systems capacity gap is what this project is about. We must:

1. know the baseline capacity of healthcare systems in a localized way 
2. map capacity distribution in space and time to the anticipated distribution of COVID spread
2. assess our ability to ramp-up capacity and track our progress
3. identify the remaining care gap as proactively as possible
4. deploy more resources to where it needs to be the most

Help us get going. There's no more time to wait.

## Sources

## Acknowledgments

## TODO
