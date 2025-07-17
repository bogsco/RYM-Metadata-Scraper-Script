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

    // Main function to run on each page load/change
    function runScraper() {
        const chartNameCamel = getChartNameCamel();
        const newItems = scrapeItems();
        if (!window[chartNameCamel]) {
            window[chartNameCamel] = [];
        }
        window[chartNameCamel] = mergeItems(window[chartNameCamel], newItems);
    }

    // Run on initial load
    runScraper();

    // Watch for URL changes (for SPA/AJAX navigation)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(runScraper, 500); // Wait for DOM update
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
