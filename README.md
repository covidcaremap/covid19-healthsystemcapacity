## TL;DR Summary

Understand, anticipate, and act to support and ramp up our local health systems' capacity (providers, supplies, ventilators, beds, meds) to effectively care for a rapidly growing flow of active COVID19 patients. 

Open-source data collection, geospatial analysis, visualizations, and scenario-planning tools informing decisionmaking and resource deployment to support our healthcare providers at local, county, & state scale when and where the needs are greatest. US-centric at the moment but tools and knowhow are intended to be applicable globally.

Let's #FlattenTheCurve and raise our capacity to care for COVID19 patients (and everyone else who needs medical care!) here and now.

## Why

![flattenthecurve animation](https://media.giphy.com/media/dWCcpgCRiOHk5B8znA/giphy.gif)

Source: https://twitter.com/alxrdk/status/1237021885239635969

You've likely seen some version of this #FlattenTheCurve diagram. Look at the orange lines. The dashed orange line says "Treatment Capacity without action" and the solid orange line is "Treatment capacity with delay". In other graphics, this is often shown as a flat line labeled as "Health Systems Capacity". 

Notice how these lines dip and grow differently between the fast+high peaking caseload vs flattened caseload scenarios. The growth reflects our healthcare system's response to the growing crisis. They can increase capacity by clearing and diverting non-urgent/elective cases, bringing in more providers, setting up and staffing spare inpatient and ICU beds with ventilators, stockpiling and increasing supply shipments, etc. In China's case, they built 2 new hospitals dedicated to COVID19 patients and sent 10s of thousands of health providers from other areas of China into Wuhan (citation TODO). But there are hard limits to capacity growth as signified by the plateau. 

More importantly, see how capacity dips with high+fast peaking demand on health systems. This happens because [health systems become overwhelmed](https://www.theatlantic.com/ideas/archive/2020/03/who-gets-hospital-bed/607807/) by rapidly surging #s of active patients in need and deteriorate in their ability to effectively care for them. Beds get filled up and stay occupied longer, supplies run low, there aren't enough ventilators or other critical care equipment to go around, [providers get exhausted or exposed to COVID19 and taken out of work by quarantine, sickness, or death](https://www.businessinsider.com/healthcare-workers-getting-coronavirus-500-infected-2020-2).

Fast growing demand and dipping capacity means critical care can quickly become a scarce resource that needs to be triaged, as described by [researchers of what is now happening in Italy](https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30627-9/fulltext):

>The percentage of patients in intensive care reported daily in Italy between March 1 and March 11, 2020, has consistently been between 9% and 11% of patients who are actively infected. The number of patients infected since Feb 21 in Italy closely follows an exponential trend. If this trend continues for 1 more week, there will be 30 000 infected patients. Intensive care units will then be at maximum capacity; up to 4000 hospital beds will be needed by mid-April, 2020.

>In theory, we are in a better position than many other countries to react to the current outbreak. However, an aggressive approach needs to be taken with patients who are critically ill with SARS-CoV-2, often including ventilatory support. The system's capacity to respond to changing circumstances has been under enormous pressure, at least in the Lombardy region, where two clusters have already emerged since Feb 21. We predict that if the exponential trend continues for the next few days, more than 2500 hospital beds for patients in intensive care units will be needed in only 1 week to treat ARDS caused by SARS-CoV-2-pneumonia in Italy. In the meantime, the government is preparing to pass legislation that will enable the health service to hire 20 000 more doctors and nurses and to provide 5000 more ventilators to Italian hospitals. These measures are a step in the right direction, but our model tells us that they need to be implemented urgently, in a matter of days. Otherwise, a substantial number of unnecessary deaths will become inevitable. Intensive care specialists are already considering denying life-saving care to the sickest and giving priority to those patients most likely to survive when deciding who to provide ventilation to.

A health system's ability to handle this surge of patients with minimal capacity dip and ramp up to an higher overall capacity for care is a question that depends, among other things, on where and when. While [new cases are being reported every day in new places across the globe](https://www.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6) and [estimates that 20-60% of the adult population may ultimately be infected](https://news.harvard.edu/gazette/story/2020/03/hundreds-of-u-s-coronavirus-cases-may-have-slipped-through-screenings/) by the virus permeate the public's understanding, this spread is not evenly distributed in place nor time. Even considering disparities in covid19 testing capacity and lag between becoming infected and showing symptoms which delay or skew our understanding of the disease's true spatiotemporal distribution, outbreaks start in different places at different times and grow at different rates. It differs depending on how many came from elsewhere and when, population density, distributions of age and/or health comorbidities, effectiveness of early testing and containment efforts, or social distancing and other mitigation measures put in place when and how aggressively. In short, the slope of increase and peak of the demand curve can vary greatly in place and time.

This example of the different infectious disease impact on different communities is well studied in the 1918 Spanish Flu case of Philadelpha and St. Louis:

![](https://cms.qz.com/wp-content/uploads/2020/03/image.png?w=1240&h=778&crop=1&strip=all&quality=75)
Source: [Quartz: This chart of the 1918 Spanish flu shows why social distancing works](https://qz.com/1816060/a-chart-of-the-1918-spanish-flu-shows-why-social-distancing-works/)

For COVID19 in China, drastic differences were seen comparing Wuhan (left figure) and Guangzhou (right figure) provinces. Note the difference of scale on the Y-axis:

<div float="left">
  <img src="https://pbs.twimg.com/media/ESv2FbsXgAE6cH_.jpg" width="45%"/>
  <img src="https://pbs.twimg.com/media/ESv2ifqWkAUDe6N.jpg" width="45%" /> 
</div>

* Explanatory twitter thread: https://threadreaderapp.com/thread/1237347774951305216.html
* Paper: https://dash.harvard.edu/handle/1/42599304
* Data: https://github.com/c2-d2/COVID-19-wuhan-guangzhou-data

### Take-home message #1:
Social distancing works and is among the best practices we have on hand to slow the case growth rate, lower the peak demand, and flatten the curve so that our health systems have enough time to ramp up and the volume of cases doesn't exceed their capacity to provide effective care. Know what to do and do your part to protect yourself and your community with these resources:
- [FlattenTheCurve](https://www.flattenthecurve.com/)
- [StayTheFuckHome](https://staythefuckhome.com/)

### Take-home message #2:
Our health system capacity is at great risk of being saturated or exceeded. If you look again at the above figure for Wuhan province at their peak of active severely ill and critically ill cases, the # of critically ill (patients who require ICU-level care) per capita hits the US' number of ICU beds per capita. 

**In other words, if the US on average has a similar experience as Wuhan, we would completely fill all of our ICUs with COVID19 patients.** Note that our ICUs typically operate at around 70% occupancy so this means everyone else who usually needs to be in ICU may be displaced, critically ill COVID patients may not get an ICU bed or level of care, or both. The US is very much on the growth trajectory of [Italy in facing not a wave, but a tsunami of patients](https://www.pbs.org/newshour/health/not-a-wave-a-tsunami-italy-hospitals-at-virus-limit). How prepared are we?
- https://www.statnews.com/2020/03/10/simple-math-alarming-answers-covid-19/
- https://www.npr.org/2020/03/06/812967454/u-s-hospitals-prepare-for-a-covid-19-wave

In the same study above, researchers look at the effect of COVID19 on the US population in different areas based on the underlying patient demographics (how many are 65+ in age or how many have hypertension) and estimate the potential peak caseload (number of critically ill patients) on a city by city level:

![paper fig3](./figs/icu_demand_paper_fig3.png)

The paper cites the US national average for ICU beds as 2.80 per 10,000 adults (15+) and the # of empty beds being 31.8%. Using these high-level numbers, our health system capacity - particularly critical care/ICU assuming 100% of physical beds have been emptied and made available for COVID19 patients - will be strained close to or past its max in every city shown in figure 3. 

What is the actual critical care capacity in each city or region? How much is that capacity ramping in preparation? How much past 100% capacity will the demand be? How close (or past) the breaking point will we go? How do we minimize this gap as much and as proactively as possible? 

Getting closer to these answers relies on knowing more granularly in time and place the health system capacity of a city, county, state, or region. We could use total inpatient and ICU bed availability as rough proxies to provide decisionmakers with more concrete, actionable awareness of current and foreseeable gaps between demand and supply. What is the capacity gap currently in a particular location and how might it grow or shrink over time under different scenarios of mitigating disease spread (lowering demand) and deploying limited healthcare resources (raising supply).

Finding out, anticipating, and addressing this healthcare systems capacity gap is what this project is about. We need to:

1. know the baseline capacity of healthcare systems to enough granularity for localized decisionmaking at the city, county, and state levels.
2. map how capacity responds in place and time to the anticipated spatiotemporal distribution of COVID19 spread
3. assess our potential and progress in ramping up capacity where needed
4. identify where and how care gaps remain as proactively as possible
5. prioritize deployment of more resources to where it needs to be the most to relieve overstrained health systems and minimize deterioriation of care for patients.

Help us get going. There's no more time to wait.

## What To Do

1. Know the baseline capacity of healthcare systems to enough granularity for localized decisionmaking at the city, county, and state levels:
  
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
    
    * Jupyter Notebooks: [/nbs](./nbs/)
    * GeoJSON, spreadsheets, & other data produced: [/data](./data/)

    1.3: Visualizations and Dashboards: 
    
    * 1st attempt: [https://daveluo.github.io/covid19-healthsystemcapacity/viz/covid19-usabedcapacity-geoviz20200313v1](https://daveluo.github.io/covid19-healthsystemcapacity/viz/covid19-usabedcapacity-geoviz20200313v1)

    ![](./figs/viz_v1_screencap.png)

2. Map how capacity responds in place and time to the anticipated spatiotemporal distribution of COVID19 spread:

    TODO: currently a messy info/links dump, to be organized:

    2.1: tracking cases/testing:
    * http://coronavirusapi.com/
    * https://covidtracking.com/
    * https://projects.sfchronicle.com/2020/coronavirus-map/
    * https://www.nytimes.com/interactive/2020/us/coronavirus-us-cases.html
    * https://github.com/pcm-dpc/COVID-19
    * https://scarpino.shinyapps.io/Emergent_Epidemics_Lab_nCoV2019/?mkt_tok=eyJpIjoiWmpFMVpEY3pZalk0WVRNMyIsInQiOiJvWGl2RnhkRDZaOHpGcVVSNGhyT2JxWVJcLzdIdVBFam96b3MxZFM2WkdKT09PK1wvTm5Jb1loMzNLMVl2TUhDb05cL0tMUVM1ZzBtUnpvTWY2bjdocW8rb1JGSXlpejZsXC96TGhpVHNvXC95NzhKcGd0dkF2K2dFNlZySmt1QTZzaWVyIn0%3D
    * http://virological.org/t/epidemiological-data-from-the-ncov-2019-outbreak-early-descriptions-from-publicly-available-data/337/2
    * https://avatorl.org/covid-19/
    * https://nextstrain.org/narratives/ncov/sit-rep/2020-03-13
    
    2.2: epi modeling:
    * https://my.causal.app/models/1432
    * http://deim.urv.cat/~alephsys/COVID-19/spain/es/index.html
    * https://www.lshtm.ac.uk/research/centres/centre-mathematical-modelling-infectious-diseases
    * http://scratch.neherlab.org/about
    * https://institutefordiseasemodeling.github.io/COVID-public/

3. Assess our potential and progress in ramping up capacity where needed
4. Identify where and how care gaps remain as proactively as possible
4. Prioritize deployment of more resources to where it needs to be the most to relieve overstrained health systems and minimize deterioriation of care for patients.

## How To Help

- lots of data to science*:
  - ingesting new data and cleaning up things
  - validation and error checking, 
  - spatial and temporal analyses at different scales
  - combining with other datasets like covid case counts by day/county/state, this is maybe the best one for the US right now: https://covidtracking.com/
  - visualizations and information design that's much better than what I can do
  - basic to advanced epi modeling would be really helpful to project out # of active cases putting demand on the healthcare system in different locations at different times. Ideally broken out to the individual county level but statewide works too. 
    - Something like this [SIR model](https://en.wikipedia.org/wiki/Compartmental_models_in_epidemiology#The_SIR_model) would be a great start: https://neherlab.org/covid19/
    - and/or: https://institutefordiseasemodeling.github.io/COVID-public/
    - and/or: https://cmmid.github.io/topics/covid19/current-patterns-transmission/global-time-varying-transmission.html
- user feedback and validation
  - connecting with decisionmakers and validating the usefulness of what's being produced here. Maybe that person's you!
- communication and education - what and why are these tools important for personal & community protection, public health decisionmaking at the local, county & state levels
  - public awareness building and truth-seeking to detect problems and implore action where it's most needed. Focus on creating actionable awareness and avoid paralysis by analysis, panic, despair. 
- project management...enough said.
- ask great questions
  - about how some part or all of this project works or more importantly, is useful
  - where to avoid reinventing the wheel and use what's already built and useful out there
  - how to connect and coordinate with related efforts
- what else...you tell us! Or better yet, take what's here and run with it, build on it, make it work for your community. Let us know what you come up with so we can link to it and learn from you. Let's build and share expertise together!

Grab the data, run the notebooks, ask questions, flag an issue, comment anywhere, send a pull request, join the gitter chat:

[![Gitter](https://badges.gitter.im/covid19-healthsystemcapacity/community.svg)](https://gitter.im/covid19-healthsystemcapacity/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

### \*Running the notebooks

You can run the Jupyter notebooks for data processing and analytics directly on your machine by using [Docker](https://docs.docker.com/install/).

To get started you can use these scripts (requires non-Windows OS with a Docker installation):

```
> ./docker/build
> ./docker/run
```

This will print out a URL with a token parameter to open up in your browser.
Use the last one listed (starting with `http://127.0.0.1:8888`)

The docker container will mount the notebooks and data folder into the container, so that any notebook
work is saved to the `nbs/` folder on your machine, and an data moved into the `data/` folder will be accessable
through `/opt/jupyter/data` inside any notebook.

Developing inside a docker container keeps track of what dependencies the notebooks need to run.
All required libraries to run notebooks should be placed in `nbs/requirements.txt`.

## Methodology Notes (things get messy here)

1.1:

Following this [paper's methodology](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4351597/), I grabbed every US health facility that reported cost data to Medicare in FY2018 (via CMS' Healthcare Cost Reporting Info Sys or [HCRIS](https://www.cms.gov/Research-Statistics-Data-and-Systems/Downloadable-Public-Use-Files/Cost-Reports)), ran their addresses through geocoders to get point lngs/lats per facility, and counted up their various reported bed capacities (ICU, adult+peds, Total beds)

calculated bed occupancy rates by dividing total inpt days / total available bed days across the reporting year

spatial joined with US county polygons, summed bed counts, joined US 2018 census population data, calculated beds/1000 people and beds/1000 15+ year olds

got some really messy jupyter notebooks and using kepler to visualize for speed's sake

**Known issues with this approach:**
- definition of a bed defined in HCRIS (nicely tucked away on page 62 of [Chapter 40](https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/Downloads/P152_40.zip) of the [Provider Reimbursement Manual](https://www.cms.gov/Regulations-and-Guidance/Guidance/Manuals/Paper-Based-Manuals-Items/CMS021935), see below for excerpt) is what was staffed across the reporting year, not the total # of physical beds or licensed beds

>A bed means an adult bed, pediatric bed, portion of inpatient labor/delivery/postpartum (LDP) room (also referred to as birthing room) bed when used for services other than labor and delivery, or newborn ICU bed (excluding newborn bassinets) maintained in a patient care area for lodging patients in acute, long term, or domiciliary areas of the hospital. Beds in post-anesthesia, post- operative recovery rooms, outpatient areas, emergency rooms, ancillary departments (however, see exception for labor and delivery department), nurses' and other staff residences, and other such areas that are regularly maintained and utilized for only a portion of the stay of patients (primarily for special procedures or not for inpatient lodging) are not termed a bed for these purposes. (See CMS Pub. 15-1, chapter 22, §2205.)

- which means the bed counts here are lower end of the range for total potential bed capacity, although it should be a good baseline of what "business as usual" hospital capacity has been in recently years
- total and ICU bed counts also doesn't distinguish between adult or peds. We could estimate based on the distribution of adult vs peds beds across a county or state
- another set of national numbers on beds and other facility stats could come from the AHA: 
  - https://www.aha.org/system/files/2018-07/2018-aha-chartbook.pdf
  - https://www.aha.org/statistics/fast-facts-us-hospitals
- or on a state level, by the licensing reports filed with each DOH, i.e. for California: https://healthdata.gov/dataset/licensed-and-certified-healthcare-facility-bed-types-and-counts
    - note that these are licensed bed counts as opposed to staffed beds so this would be on the upper end of potential capacity for a facility




## Sources

## Acknowledgments

## Misc
