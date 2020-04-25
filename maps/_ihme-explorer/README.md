# CovidCareMap.org IHME projection data explorer

Explore the latest Institute for Health Metrics and Evaluation (IHME) COVID-19 projections through time by country and region.

Created by [@lossyrob](https://github.com/lossyrob) and [@jfrankl](https://github.com/jfrankl)

To generate vector tiles, run

```bash
> ./docker/build-website
```

## Data Processing

To generate the data necessary to run this visualization, use the [processing/Process_IHME_data.ipynb](../../notebooks/processing/Process_IHME_data.ipynb) notebook. See the [Getting Started](../../README.md#getting-started) section of the README for information about running the notebooks via Docker.

## Available Scripts

In the project directory, you can run:

### `npm install`

Downloads required dependencies.

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### Troubleshooting

If you recieve and error about INOTIFY, too many files to watch, see:
https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers#the-technical-details

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
