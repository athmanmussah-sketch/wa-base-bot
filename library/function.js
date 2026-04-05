// © 2025 Debraj. All Rights Reserved.

const axios = require('axios')
const moment = require('moment-timezone')
const { sizeFormatter } = require('human-readable')
const util = require('util')
const jimp = require('jimp') // ✅ FIXED
const vm = require("vm")
const CryptoJS = require("crypto-js")

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000)

const resize = async (image, width, height) => {
    let oyy = await jimp.read(image)
    let kiyomasa = await oyy.resize(width, height).getBufferAsync(jimp.MIME_JPEG)
    return kiyomasa
}

const generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString();
    if (epoch)
        tag += '.--' + epoch;
    return tag;
}

const processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

const clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}

const runtime = (seconds) => {
    seconds = Number(seconds);

    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const dayDisplay = days > 0 ? `${days} days, ` : "";
    const hourDisplay = hours > 0 ? `${hours} hours, ` : "";
    const minuteDisplay = minutes > 0 ? `${minutes} minutes, ` : "";
    const secondDisplay = secs > 0 ? `${secs} seconds` : "";

    return (dayDisplay + hourDisplay + minuteDisplay + secondDisplay).trim().replace(/,\s*$/, "") || "0 seconds";
};

const getTime = (format, date) => {
    if (date) {
        return moment(date).tz('Asia/Kolkata').locale('en-in').format(format)
    } else {
        return moment.tz('Asia/Kolkata').locale('en-in').format(format)
    }
}

const formatDate = (dateValue, locale = 'en-IN') => {
    let dateObj = new Date(dateValue)
    return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'Asia/Kolkata'
    })
}

const formatDateIndia = (inputDate) => {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    let dateObj = new Date(inputDate);
    
    return `${days[dateObj.getDay()]}, ${dateObj.getDate()} - ${months[dateObj.getMonth()]} - ${dateObj.getFullYear()}`;
}

const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`

const getBuffer = async (url, options) => {
    try {
        const res = await axios({ method: "get", url, responseType: 'arraybuffer', ...options })
        return res.data
    } catch (err) {
        return err
    }
}

const fetchJson = async (url, options) => {
    try {
        const res = await axios({ method: 'GET', url, ...options })
        return res.data
    } catch (err) {
        return err
    }
}

const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024,i)).toFixed(2) + ' ' + sizes[i];
};

const formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})

const bytesToSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024,i)).toFixed(2) + ' ' + sizes[i];
}

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isUrl = (url) => url.match(/https?:\/\/.+/gi)

const jsonformat = (string) => JSON.stringify(string, null, 2)

const format = (...args) => util.format(...args)

module.exports = {
    unixTimestampSeconds,
    resize,
    generateMessageTag,
    processTime,
    getRandom,
    getBuffer,
    formatSize,
    fetchJson,
    runtime,
    clockString,
    sleep,
    isUrl,
    getTime,
    formatDate,
    formatDateIndia,
    formatp,
    jsonformat,
    format,
    bytesToSize
    }
