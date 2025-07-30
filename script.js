// ==UserScript==
// @name         RYM Top Songs Metadata Scraper
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Scrape song metadata from RateYourMusic top songs chart
// @author       You
// @match        https://rateyourmusic.com/charts/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Helper: Convert string to camelCase
    function toCamelCase(str) {
        return str
            .replace(/[^a-zA-Z0-9 ]/g, ' ')
            .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
            .replace(/^./, c => c.toLowerCase())
            .replace(/\s/g, '');
    }

    // Helper: Get chart name as camelCase
    function getChartNameCamel() {
        const chartNameRaw = document.querySelector('.page_charts_section_charts_header_chart_name')?.innerText?.trim() || 'rymChart';
        return toCamelCase(chartNameRaw);
    }

    // Helper: Scrape items from current page
    function scrapeItems() {
        const boxes = document.querySelectorAll('.page_charts_section_charts_item_info_main_left');
        let items = [];
        boxes.forEach(box => {
            const song = box.querySelector('.ui_name_locale_original')?.innerText?.trim() || '';
            const artist = box.querySelectorAll('.ui_name_locale_original')[1]?.innerText?.trim() || '';
            const releaseDate = box.querySelector('.page_charts_section_charts_item_title_date_compact')?.innerText?.trim() || '';
            const genre = box.querySelector('a.genre.comma_separated.first')?.innerText?.trim() || '';
            items.push({ song, artist, releaseDate, genre });
        });
        return items;
    }

    // Helper: Merge new items, avoiding duplicates (by song+artist+releaseDate)
    function mergeItems(existing, newItems) {
        const key = item => `${item.song}|${item.artist}|${item.releaseDate}`;
        const seen = new Set(existing.map(key));
        newItems.forEach(item => {
            if (!seen.has(key(item))) {
                existing.push(item);
                seen.add(key(item));
            }
        });
        return existing;
    }

    // Add a button to the page to copy chart JSON to clipboard
    function addCopyButton() {
        if (document.getElementById('rym-copy-json-btn')) return; // Prevent duplicates
        const btn = document.createElement('button');
        btn.id = 'rym-copy-json-btn';
        btn.textContent = 'Copy Chart JSON to Clipboard';
        btn.style.position = 'fixed';
        btn.style.top = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = 9999;
        btn.style.padding = '10px 16px';
        btn.style.background = '#1db954';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.fontSize = '16px';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
            const chartNameCamel = getChartNameCamel();
            const title = document.querySelector('h1#page_charts_section_charts_header_chart_name')?.innerHTML?.trim() || chartNameCamel;
            const output = {
                title: title,
                items: window[chartNameCamel] || []
            };
            const json = JSON.stringify(output, null, 2);
            navigator.clipboard.writeText(json).then(() => {
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy Chart JSON to Clipboard', 1500);
            });
        };
        document.body.appendChild(btn);
    }

    // Main function to run on each page load/change
    function runScraper() {
        const chartNameCamel = getChartNameCamel();
        const newItems = scrapeItems();
        if (!window[chartNameCamel]) {
            window[chartNameCamel] = [];
        }
        window[chartNameCamel] = mergeItems(window[chartNameCamel], newItems);
        // Get the chart title from the h1 element
        const title = document.querySelector('h1#page_charts_section_charts_header_chart_name')?.innerHTML?.trim() || chartNameCamel;
        // Print out the chart data as a raw JSON object with title and items
        const output = {
            title: title,
            items: window[chartNameCamel]
        };
        console.log(JSON.stringify(output, null, 2));
    }

    // Run on initial load
    runScraper();
    addCopyButton();

    // Watch for URL changes (for SPA/AJAX navigation)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(() => {
                runScraper();
                addCopyButton();
            }, 500); // Wait for DOM update
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
