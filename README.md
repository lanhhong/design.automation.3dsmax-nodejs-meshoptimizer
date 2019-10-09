# design.automation.3dsmax-nodejs-meshoptimizer
## Autodesk Forge Design Automation for 3ds Max Sample

[![Node.js](https://img.shields.io/badge/Node.js-10.0-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-6.0-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/Web-Windows%20%7C%20MacOS%20%7C%20Linux-lightgray.svg)
[![Design-Automation](https://img.shields.io/badge/Design%20Automation-v3-green)](http://developer.autodesk.com/)
[![Data-Management](https://img.shields.io/badge/Data%20Management-v2-green)](http://developer.autodesk.com/)

![Plugins](https://img.shields.io/badge/Plugins-Windows-lightgray.svg)
![.NET](https://img.shields.io/badge/.NET%20Framework-4.7-blue.svg)
[![3dsMax](https://img.shields.io/badge/3ds%20Max-2020-00aaaa.svg)](http://developer.autodesk.com/)

# Description

This sample demonstrates how to modify a 3ds Max file using the Autodesk Forge [Design Automation API](https://forge.autodesk.com/en/docs/design-automation/v3/developers_guide/overview/). 

It includes a `Configure` modal box which allows for the creation and deletion of AppBundles and Activities. The AppBundle that is provided in this sample is the `ProOptimizerAutomation` bundle which is a 3ds Max .NET plug-in that optimizes the mesh in the scene. In preparation for a WorkItem, the Activity references the `ProOptimizerAutomation` AppBundle and a 3ds Max core engine. It also specifies that a single input file is required, and the results will be saved in a zip file. Once a WorkItem is submitted, it takes in the parameters and input file that are needed to execute the Activity. When a WorkItem job is complete, a detailed report will display and output files will be available for download. 

This is a **Node.js** version of the [3ds Max Design Automation .NET sample](https://github.com/kevinvandecar/design.automation.3dsmax-csharp-meshoptimizer), and the foundation is from the [Learn Forge Tutorial](https://learnforge.autodesk.io/#/tutorials/modifymodels).

# Setup

## Prerequisites

1. Forge Account 
2. Visual Studio Code
3. Node.js
4. ngrok

## Running Locally

Create an [Autodesk Forge account and app](https://learnforge.autodesk.io/#/account/).

Install [Node.js](https://nodejs.org) and [ngrok](https://ngrok.com/).

Clone or download this project.
```
git clone https://github.com/lanhhong/design.automation.3dsmax-nodejs-meshoptimizer
```

Create a tunnel to your local machine.
```
ngrok http 3000
```
Copy the ngrok address (e.g. `http://abcd1234.ngrok.io`) into `FORGE_WEBHOOK_URL` environment variable later.

Use the **Terminal** on MacOSX/Linux or the **Node.js command prompt** on Windows.

Navigate to the folder where this repository was cloned.

Install the required packages using `npm install`.

Set environment variables and start the app.

* Mac OS / Linux (Terminal)
```
npm install
export FORGE_CLIENT_ID=<<your Forge app client ID>>
export FORGE_CLIENT_SECRET=<<your Forge app client secret>>
export FORGE_CALLBACK_URL=<<your Forge app callback URL>>
export FORGE_WEBHOOK_URL=<<your ngrok address here: e.g. http://abcd1234.ngrok.io>>
npm start
```

* Windows (Node.js command prompt)
```
npm install
set FORGE_CLIENT_ID=<<your Forge app client ID>>
set FORGE_CLIENT_SECRET=<<your Forge app client secret>>
set FORGE_CALLBACK_URL=<<your Forge app callback URL>>
set FORGE_WEBHOOK_URL=<<your ngrok address here: e.g. http://abcd1234.ngrok.io>>
npm start
```

Go to [localhost:3000](http://localhost:3000/)

### Using the App

1. Clear all existing AppBundles and Activities by clicking on `Configure` > `Clear account`.
2. Select `ProOptimizerAutomation` AppBundle and `Autodesk.3dsMax+2020` engine.
3. Click `Create/Update` to define a new AppBundle and Activity.

Once you create/update an Activity, you can keep using the same exisiting Activity for multiple WorkItems.

4. Fill in the vertex percent values (e.g. `0.25, 0.5`) and check keep normals and collapse stack.

You can enter as many values as you want. This will correspond to how many results will be in the output. 

5. Select a MAX file (e.g. `horse.max`) and `ProOptimizerAutomationActivity+dev` existing Activity.
6. Click `Start workitem` and wait for the job to finish.
7. A detailed report about the WorkItem will display once the job is complete.
8. Download the results using the link.

The zipped output contains a FBX and MAX file for each percent values entered.
