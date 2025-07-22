// ==UserScript==
// @name         Kubeflow Enhancement
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Enhance Kubeflow
// @author       You
// @match        https://kubeflow-v2.private.lifen.fr/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kubeflow.org
// @grant        none
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/jc-louis/kubeflow-enhancement/refs/heads/master/tampermonkey.js
// @downloadURL  https://raw.githubusercontent.com/jc-louis/kubeflow-enhancement/refs/heads/master/tampermonkey.js
// ==/UserScript==

(function() {
    'use strict';

    console.log("Kubeflow Enhancement script v1.1 loaded");

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    function findAndReplaceInput() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input:not([type])');

        for (let input of inputs) {
            if (input.value === "unknown@lifen.fr") {
                console.log("Found input with unknown@lifen.fr:");


                const userEmail = getCookie('ajs_user_id');

                if (userEmail) {
                    console.log("Replacing with email from cookie:", userEmail);
                    input.value = userEmail;

                    // Trigger input events to ensure the change is registered
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));

                    return true;
                } else {
                    console.warn("Could not find ajs_user_id cookie");
                }
            }
        }
        return false;
    }

    function startObserving() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', findAndReplaceInput);
        } else {
            findAndReplaceInput();
        }

        // Set up MutationObserver to watch for DOM changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any new nodes contain inputs
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check the node itself and its children
                            if (node.tagName === 'INPUT' || node.querySelector('input')) {
                                setTimeout(findAndReplaceInput, 100); // Small delay to ensure rendering
                                break;
                            }
                        }
                    }
                }
            });
        });

        observer.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });

        document.addEventListener('click', function() {
            setTimeout(findAndReplaceInput, 500); // Wait a bit after click
        });

        document.addEventListener('focus', function() {
            setTimeout(findAndReplaceInput, 100);
        }, true);

        const intervalId = setInterval(function() {
            if (findAndReplaceInput()) {
                clearInterval(intervalId);
            }
        }, 2000);

        setTimeout(function() {
            clearInterval(intervalId);
            console.log("Stopped periodic checking for email input");
        }, 120000);
    }

    if (document.body) {
        startObserving();
    } else {
        document.addEventListener('DOMContentLoaded', startObserving);
    }

})();
