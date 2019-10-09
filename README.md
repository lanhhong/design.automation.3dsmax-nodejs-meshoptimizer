# design.automation.3dsmax-nodejs-meshoptimizer
## Autodesk Forge Design Automation for 3ds Max Sample

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
Copy the address into `FORGE_WEBHOOK_URL` environment variable later.

Install the required packages.
```
npm install
```

Set environment variables.

  * Mac OS / Linux (terminal)
```
export FORGE_CLIENT_ID=<<your Forge app client ID>>
export FORGE_CLIENT_SECRET=<<your Forge app client secret>>
export FORGE_CALLBACK_URL=<<your Forge app callback URL>>
export FORGE_WEBHOOK_URL=<<your ngrok address here: e.g. http://abcd1234.ngrok.io>>
```

  * Windows (Node.js command line)
```
set FORGE_CLIENT_ID=<<your Forge app client ID>>
set FORGE_CLIENT_SECRET=<<your Forge app client secret>>
set FORGE_CALLBACK_URL=<<your Forge app callback URL>>
set FORGE_WEBHOOK_URL=<<your ngrok address here: e.g. http://abcd1234.ngrok.io>>
```

Start server
```
npm start
```

Go to [localhost:3000](http://localhost:3000/)
