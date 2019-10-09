/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////


$(document).ready(function () {
    prepareLists();

    $('#clearAccount').click(clearAccount);
    $('#defineActivityShow').click(defineActivityModal);
    $('#createAppBundleActivity').click(createAppBundleActivity);
    $('#startWorkitem').click(startWorkitem);

    startConnection();
});

/**
 * Get existing Activities, available engines, and local AppBundles
 */
function prepareLists() {
    list('activity', '/api/forge/designautomation/activities');
    list('engines', '/api/forge/designautomation/engines');
    list('localBundles', '/api/appbundles');
}

/**
 * Get a list of items from the server
 */
function list(control, endpoint) {
    $('#' + control).find('option').remove().end();
    jQuery.ajax({
        url: endpoint,
        success: function (list) {
            if (list.length === 0)
                $('#' + control).append($('<option>', { disabled: true, text: 'Nothing found' }));
            else 
                list.forEach(function (item) { $('#' + control).append($('<option>', { value: item, text: item })); })
        }
    });
}

/**
 * Clear existing Activities and AppBundles from this account 
 */
function clearAccount() {
    if (!confirm('Clear existing activities & appbundles before start. ' +
        'This is useful if you believe there are wrong settings on your account.' +
        '\n\nYou cannot undo this operation. Proceed?')) return;

    jQuery.ajax({
        url: 'api/forge/designautomation/account',
        method: 'DELETE',
        success: function () {
            prepareLists();
            writeLog('Account cleared, all appbundles & activities deleted');
        }
    });
}

/**
 * Show modal box to define AppBundles and Activities 
 */
function defineActivityModal() {
    $("#defineActivityModal").modal();
}

/**
 * Create a new AppBundle and Activity for the WorkItem
 */
function createAppBundleActivity() {
    writeLog("Defining appbundle and activity for " + $('#engines').val());
    $("#defineActivityModal").modal('toggle');
    createAppBundle(function () {
        createActivity(function () {
            prepareLists();
        })
    });
}

/**
 * Create a new AppBundle 
 */
function createAppBundle(cb) {
    jQuery.ajax({
        url: 'api/forge/designautomation/appbundles',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            zipFileName: $('#localBundles').val(),
            engine: $('#engines').val()
        }),
        success: function (res) {
            writeLog('AppBundle: ' + res.appBundle + ', v' + res.version);
            if (cb) cb();
        }
    });
}

/**
 * Create a new Activity
 */
function createActivity(cb) {
    jQuery.ajax({
        url: 'api/forge/designautomation/activities',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            zipFileName: $('#localBundles').val(),
            engine: $('#engines').val()
        }),
        success: function (res) {
            writeLog('Activity: ' + res.activity);
            if (cb) cb();
        }
    });
}

/**
 * Start new WorkItem
 */
function startWorkitem() {
    var inputFileField = document.getElementById('inputFile');
    if (inputFileField.files.length === 0) { alert('Please select an input file'); return; }
    if ($('#activity').val() === null) { alert('Please select an activity'); return };
    var file = inputFileField.files[0];
    var checkboxKeepNormals = document.getElementById('KeepNormals');
    var checkboxCollapseStack = document.getElementById('CollapseStack');

    var formData = new FormData();
    formData.append('inputFile', file);
    formData.append('data', JSON.stringify({
        percent: $('#percent').val(),
        KeepNormals: checkboxKeepNormals.checked,
        CollapseStack: checkboxCollapseStack.checked,
        activityName: $('#activity').val()
    }));
    writeLog('Uploading input file...');
    $.ajax({
        url: 'api/forge/designautomation/workitems',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (res) {
            writeLog('Workitem started: ' + res.workItemId);
        }
    });
}

/**
 * Write messages to the browser
 */
function writeLog(text) {
  $('#outputlog').append('<div style="border-top: 1px dashed #C0C0C0">' + text + '</div>');
  var elem = document.getElementById('outputlog');
  elem.scrollTop = elem.scrollHeight;
}


/**
 * Start connection between server and client
 */
function startConnection() {
    // Set up connection between server and client (client-side)
    var socket = io();

    // Update when WorkItem is complete
    socket.on('onComplete', data => {
        writeLog(data.message);
    });
    socket.on('downloadResult', data => {
        writeLog('<a href="' + data.url +'">Download result file here</a>');
    });
}