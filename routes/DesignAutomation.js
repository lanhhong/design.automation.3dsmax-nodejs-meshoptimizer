const express = require('express');
const path = require('path');
const request = require('request');
const fs = require('fs');
const multer  = require('multer');
const { DesignAutomationClient, DataManagementClient } = require('forge-server-utils');

const config = require('../config');
const Authentication = require('./common/Authentication');

const router = express.Router();

// For parsing application/json
router.use(express.json()); 

// For parsing multipart/form-data, uploading files
const upload = multer({
    dest: 'uploads/' // Saves your file into a directory called "uploads"
});

// Used to access Forge Design Automation V3 APIs
const DesignAutomation = new DesignAutomationClient({
    client_id: config.credentials.client_id, 
    client_secret: config.credentials.client_secret
});

// Used to access Forge Data Management APIs
const DataManagement = new DataManagementClient({
    client_id: config.credentials.client_id, 
    client_secret: config.credentials.client_secret
});

// Local directory to store AppBundles
const BundlesDirectory = path.join(__dirname, '../bundles');

// Prefix for AppBundles and Activities
const Nickname = config.credentials.client_id;

// A user-friendly name for a specific AppBundle and/or Activity version
const Alias = 'dev';


/**
 * Get available 3ds Max engines
 */
router.get('/api/forge/designautomation/engines', async (req, res) => {
    // Get access token
    await Authentication.getInternalToken();

    // Get the list of all available engines
    let engines = await DesignAutomation.listEngines();

    // Filter out 3ds Max engines
    engines = engines.filter(engine => {
        return engine.includes('3dsMax');
    });

    res.send(engines);
});

/**
 * Get names of AppBundles in the local AppBundles directory
 */
router.get('/api/appbundles', (req, res) => {
    // Look through bundles directory to find AppBundles
    fs.readdir(BundlesDirectory, (err, files) => {
        // Get files that are zipped
        let bundles = files.filter(file => {
            return path.extname(file).toLowerCase() === '.zip';
        });

        // Get names of files without the extension
        bundles.forEach((bundle, i) => {
            bundles[i] = path.parse(bundle).name;
        }); 
        
        res.send(bundles);
    });
});

/**
 * Create and upload a new AppBundle 
 */
router.post('/api/forge/designautomation/appbundles', async (req, res) => {
    // Input from the client - local AppBundle and engine 
    const zipFileName = req.body.zipFileName;
    const engineName = req.body.engine;

    // Standard name for this AppBundle
    const appBundleName = zipFileName + 'AppBundle';

    // Check if the local AppBundle is in the bundles directory
    const packageZipPath = path.join(BundlesDirectory, zipFileName + '.zip');
    if(!fs.existsSync(packageZipPath)) {
        console.log('AppBundle not found at ' + packageZipPath);
        res.end();
    }

    // Get a list of existing AppBundles
    const appbundles = await DesignAutomation.listAppBundles();

    // Check if AppBundle is alreay defined and create a new AppBundle version
    const qualifiedAppBundleId = `${Nickname}.${appBundleName}+${Alias}`;
    let newAppBundleVersion;
    if(!appbundles.includes(qualifiedAppBundleId)) {
        // AppBundle is not defined
        // Create version 1 of the AppBundle and Alias pointing to version 1
        newAppBundleVersion = await DesignAutomation.createAppBundle(appBundleName, engineName);
        const newAlias = await DesignAutomation.createAppBundleAlias(appBundleName, Alias, 1);
    }
    else {
        // AppBundle is already defined
        // Update exisiting AppBundle (creating a new version) and Alias pointing to the new version
        newAppBundleVersion = await DesignAutomation.updateAppBundle(appBundleName, engineName);
        const newAlias = await DesignAutomation.updateAppBundleAlias(appBundleName, Alias, newAppBundleVersion.version);
    }

    // Upload the local AppBundle zip file with the new version of AppBundle
    const appBundleStream = fs.createReadStream(packageZipPath);
    await DesignAutomation.uploadAppBundleArchive(newAppBundleVersion, appBundleStream);

    res.send({ appBundle: qualifiedAppBundleId, version: newAppBundleVersion.version });
;});

/**
 * Get existing Activities defined for this account
 */
router.get('/api/forge/designautomation/activities', async (req, res) => {
    // Get a list of all existing Acvitities
    let activities = await DesignAutomation.listActivities();

    // Filter out the latest Activities for this account
    activities = activities.filter(activity => {
        return (activity.startsWith(Nickname) && activity.indexOf('$LATEST') == -1);
    });

    // For displaying existing Activities without our credentials
    let definedActivities = [];
    activities.forEach(activity => {
        definedActivities.push(activity.replace(`${Nickname}.`, ''));
    });

    res.send(definedActivities);
});

/**
 * Create a new Activity
 */
router.post('/api/forge/designautomation/activities', async (req, res, next) => {
    // Input from the client - local AppBundle and engine 
    const zipFileName = req.body.zipFileName;
    const engineName = req.body.engine;

    // Standard name for this AppBundle and Activity
    const appBundleName = zipFileName + 'AppBundle';
    const activityName = zipFileName + 'Activity';
    
    // Get a list of all existing Activities
    const activities = await DesignAutomation.listActivities();

    // Check if Activity is alreay defined and create a new version of the Activity 
    const qualifiedActivityId = `${Nickname}.${activityName}+${Alias}`;
    if(!activities.includes(qualifiedActivityId)) {
        // Activity is not defined
        // Define the 3ds Max engine attributes
        const commandLine = '$(engine.path)\\3dsmaxbatch.exe -sceneFile $(args[inputFile].path) $(settings[script].path)';
        const daScript = 'da = dotNetClass(\"Autodesk.Forge.Sample.DesignAutomation.Max.RuntimeExecute\")\nda.ProOptimizeMesh()\n';
        
        // Define parameters and settings for the Activity
        const appBundleId = `${Nickname}.${appBundleName}+${Alias}`;
        const parameters = {
            inputFile: { description: 'input file', localName: '$(inputFile)', ondemand: false, required: true, verb: 'get', zip: false },
            inputJson: { description: 'input json', localName: 'params.json', ondemand: false, required: false, verb: 'get', zip: false },
            outputFile: { description: 'output file', localName: 'output.zip', ondemand: false, required: true, verb: 'put', zip: false }
        };
        const settings = {
            script: { value: daScript }
        };

        // Create version 1 of the Activity and Alias pointing to version 1
        const newActivity = await DesignAutomation.createActivity(activityName, engineName, commandLine, appBundleId, parameters, settings);
        const newAlias = await DesignAutomation.createActivityAlias(activityName, Alias, 1);

        res.send({ activity: qualifiedActivityId });
    }
    else {
        // Activity already defined
        // For this sample, there's no need to update the Activity (create another version)
        // Since the Activity points to the latest version of the AppBundle (points to 'dev' Alias)
        // But this can be extended for different contexts
        res.send({ activity: 'Activity already defined' });
    }
});

/**
 * Start a new WorkItem
 */
router.post('/api/forge/designautomation/workitems', upload.single('inputFile'), async (req, res) => {
    // Input from the client - input parameters and an existing Activity
    const workItemData = JSON.parse(req.body.data);
    const percentParam = workItemData.percent;
    const keepNormalsParam = workItemData.KeepNormals;
    const collapseStackParam = workItemData.CollapseStack;
    const activityName = `${Nickname}.${workItemData.activityName}`;

    // Get access token
    const auth = await Authentication.getInternalToken();

    // Path to the input file
    const inputFilePath = req.file.path;

    // The OSS bucket where input and output files will be stored
    const bucketKey = `${Nickname.toLowerCase()}_designautomation`;

    // Input file name is formatted to avoid overriding when the object is stored
    const d = new Date();
    const formattedDate = `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;
    const inputFileNameOSS = `${formattedDate}_input_${req.file.originalname}`;

    // Upload input file to OSS bucket
    // 1. Create a bucket if bucket does not exist
    try {
        await DataManagement.createBucket(bucketKey, 'transient');
    } catch(err) {
        console.log(err);
    }

    // 2. Read input file and upload to the bucket
    // Then prepare WorkItem arguments and submit WorkItem
    fs.readFile(inputFilePath, async (err, data) => {
        try {
            // Upload the input file's contents to the specified bucket
            await DataManagement.uploadObject(bucketKey, inputFileNameOSS, 'application/octet-stream', data);

            // Prepare WorkItem arguments
            // 1. Input file argument
            const inputFileArgument = {
                url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${inputFileNameOSS}`,
                headers: { Authorization: `Bearer ${auth.access_token}` }
            };

            // 2. Input JSON argument
            const inputJson = {
                // Note these names are matching in the JSON and used in the plug-in to receive data
                VertexPercents: percentParam.split(/[ ,]+/),
                KeepNormals: keepNormalsParam,
                CollapseStack: collapseStackParam
            };
            const inputJsonArgument = {
                url: `data:application/json,${JSON.stringify(inputJson).replace(/"/g, "'")}`
            };

            // 3. Output file argument
            const outputFileNameOSS = 'output.zip';
            const outputFileArgument = {
                url: `https://developer.api.autodesk.com/oss/v2/buckets/${bucketKey}/objects/${outputFileNameOSS}`,
                verb: 'put',
                headers: { Authorization: `Bearer ${auth.access_token}` }
            };

            // Prepare WorkItem specifications
            const callbackUrl = `${config.credentials.webhook_url}/api/forge/callback/designautomation?outputFileName=${outputFileNameOSS}`;
            const workitemSpec = {
                inputFile: inputFileArgument,
                inputJson: inputJsonArgument,
                outputFile: outputFileArgument,
                onComplete: { verb: 'post', url: callbackUrl }
            };

            // Submit new WorkItem
            const workitemStatus = await DesignAutomation.createWorkItem(activityName, workitemSpec);

            res.send({ workItemId: workitemStatus.id });
        
        } catch(err) {
            console.log(err);
        }
    });
    

});

/**
 * Callback from the completion of the WorkItem (onComplete)
 */
router.post('/api/forge/callback/designautomation', async (req, res) => {
    // The object and bucket key used to get the WorkItem's output
    const bucketKey = `${Nickname.toLowerCase()}_designautomation`;
    const objectKey = req.query.outputFileName;

    // Get WorkItem's detailed report and send to client
    const reportUrl = req.body.reportUrl;
    await request.get(reportUrl, (err, res, body) => {
        req.app.io.emit('onComplete', { message: body });
    });
    
    // Create a signed URL (to download the output) and send to client 
    const signedUrl = await DataManagement.createSignedUrl(bucketKey, objectKey);
    req.app.io.emit('downloadResult', { url: signedUrl.signedUrl });

    res.end();
});

/**
 * Delete AppBundles and Activities for this account - for debugging purposes
 */
router.delete('/api/forge/designautomation/account', async (req, res) => {
    // Clear existing AppBundles and Activities
    try {
        await DesignAutomation.deleteAppBundle('ProOptimizerAutomationAppBundle');
    } catch(err) {
        console.log(err)
    }
    
    try {
        await DesignAutomation.deleteActivity('ProOptimizerAutomationActivity');
    } catch(err) {
        console.log(err)
    }
    
    res.end();
});

module.exports = router;